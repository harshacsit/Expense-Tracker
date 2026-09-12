const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_TOOLS, SYSTEM_PROMPT } = require('./functions');
const { routeIntent } = require('./intentRouter');
const { buildExpenseContext } = require('./ragContext');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * chatbot.service.js
 *
 * Orchestrates the full Gemini function-calling flow:
 * 1. Build message with RAG context if relevant
 * 2. Call Gemini with tools defined in functions.js
 * 3. If Gemini returns a function call, route to intentRouter
 * 4. Feed result back to Gemini for a natural-language response
 * 5. Return final text to the user
 */

/**
 * Formats conversation history to comply with Gemini requirements:
 * 1. Must start with role 'user' (leading assistant/model greetings stripped)
 * 2. Must alternate: user -> model -> user -> model
 * 3. Must end with role 'model' (since chat.sendMessage will append the new user message)
 */
const formatGeminiHistory = (rawHistory, currentMessage) => {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) {
    return [];
  }

  const normalized = [];
  for (const m of rawHistory) {
    if (!m || !m.content) continue;
    const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
    normalized.push({ role, text: String(m.content).trim() });
  }

  // If the last item in history is the current message with role 'user', remove it
  if (
    normalized.length > 0 &&
    normalized[normalized.length - 1].role === 'user' &&
    normalized[normalized.length - 1].text === currentMessage.trim()
  ) {
    normalized.pop();
  }

  // Gemini requires history to start with 'user' — drop any leading 'model' messages
  let startIndex = 0;
  while (startIndex < normalized.length && normalized[startIndex].role !== 'user') {
    startIndex++;
  }
  const filtered = normalized.slice(startIndex);

  if (filtered.length === 0) return [];

  // Enforce alternating turns
  const clean = [];
  for (const item of filtered) {
    if (clean.length === 0) {
      if (item.role === 'user') {
        clean.push({ role: 'user', parts: [{ text: item.text }] });
      }
    } else {
      const prevRole = clean[clean.length - 1].role;
      if (item.role !== prevRole) {
        clean.push({ role: item.role, parts: [{ text: item.text }] });
      } else {
        // Merge consecutive messages from same role
        clean[clean.length - 1].parts[0].text += `\n${item.text}`;
      }
    }
  }

  // Ensure history ends with 'model' so that chat.sendMessage(userMessage) is the next 'user' turn
  if (clean.length > 0 && clean[clean.length - 1].role === 'user') {
    clean.pop();
  }

  return clean;
};

/**
 * Deterministic formatters for function results.
 * Guarantees a clean, friendly response even if Gemini's 2nd call hits 429 or schema errors.
 */
const formatBalanceReply = (balances, currentUserId) => {
  if (!balances || balances.length === 0) {
    return 'No balances recorded yet. Add some expenses to see who owes whom!';
  }
  const lines = ['Here are the current balances for everyone in the house:\n'];
  balances.forEach((b) => {
    const isMe = String(b.userId) === String(currentUserId);
    const who = isMe ? `${b.name} (you)` : b.name;
    if (b.netBalance > 0.005) {
      lines.push(`• **${who}** is owed **₹${b.netBalance.toFixed(2)}** (Paid: ₹${b.totalPaid.toFixed(2)}, Share: ₹${b.totalOwed.toFixed(2)})`);
    } else if (b.netBalance < -0.005) {
      lines.push(`• **${who}** owes **₹${Math.abs(b.netBalance).toFixed(2)}** (Paid: ₹${b.totalPaid.toFixed(2)}, Share: ₹${b.totalOwed.toFixed(2)})`);
    } else {
      lines.push(`• **${who}** is all settled up ✓`);
    }
  });
  return lines.join('\n');
};

const formatSettlementReply = (suggestions) => {
  if (!suggestions || suggestions.length === 0) {
    return 'All debts are fully settled! Everyone is even — no payments are needed right now. 🎉';
  }
  const lines = ['Here is the easiest way to settle all debts with the minimum number of payments:\n'];
  suggestions.forEach((s) => {
    lines.push(`• **${s.fromName}** pays **${s.toName}** ₹${s.amount.toFixed(2)}`);
  });
  return lines.join('\n');
};

/**
 * Fallback direct intent handler if LLM is rate-limited (e.g. 429 Too Many Requests)
 */
const fallbackIntentHandler = async (userMessage, context, ragContext) => {
  const lower = userMessage.toLowerCase();
  if (lower.includes('balance') || lower.includes('owe') || lower.includes('debt') || lower.includes('who owes')) {
    const result = await routeIntent('getBalances', {}, context);
    return {
      reply: formatBalanceReply(result.balances, context.userId),
      action: { function: 'getBalances', result },
    };
  }
  if (lower.includes('settle') || lower.includes('pay back') || lower.includes('clear')) {
    const result = await routeIntent('suggestSettlements', {}, context);
    return {
      reply: formatSettlementReply(result.suggestions),
      action: { function: 'suggestSettlements', result },
    };
  }
  if (ragContext) {
    return {
      reply: ragContext,
      action: null,
    };
  }
  return null;
};

/**
 * @param {string} userMessage - The raw message from the user
 * @param {string[]} conversationHistory - Array of {role, content} prior messages
 * @param {object} context - { houseId, userId, members }
 * @returns {{ reply: string, action: object|null }}
 */
const processMessage = async (userMessage, conversationHistory = [], context) => {
  const { houseId } = context;

  // Build RAG context for insight-type questions
  const insightKeywords = ['spend', 'spent', 'more', 'less', 'month', 'trend', 'most', 'breakdown', 'summary', 'history', 'expense', 'total'];
  const needsContext = insightKeywords.some((kw) => userMessage.toLowerCase().includes(kw));
  let ragContext = '';
  if (needsContext) {
    ragContext = await buildExpenseContext(houseId);
  }

  const systemWithContext = ragContext
    ? `${SYSTEM_PROMPT}\n\n${ragContext}`
    : SYSTEM_PROMPT;

  // Convert and sanitize prior history for Gemini
  const geminiHistory = formatGeminiHistory(conversationHistory, userMessage);

  const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemWithContext,
        tools: [{ functionDeclarations: GEMINI_TOOLS }],
      });

      const chat = model.startChat({ history: geminiHistory });

      // --- First LLM call ---
      const result = await chat.sendMessage(userMessage);
      const response = result.response;

      // Check for function call
      const candidate = response.candidates?.[0];
      const functionCallPart = candidate?.content?.parts?.find((p) => p.functionCall);

      if (!functionCallPart) {
        // Pure text response — no function call needed
        const text = response.text();
        return { reply: text || 'I could not generate a response.', action: null };
      }

      const { name: fnName, args: fnArgs } = functionCallPart.functionCall;

      // --- Route tool call through intentRouter ---
      let toolResult;
      let toolError = null;
      try {
        toolResult = await routeIntent(fnName, fnArgs, context);
      } catch (err) {
        toolError = err.message;
        toolResult = { success: false, error: toolError };
      }

      // --- Second LLM call with function result (optional natural language polish) ---
      let finalText = '';
      try {
        const functionResponsePart = {
          functionResponse: {
            name: fnName,
            response: toolResult,
          },
        };

        const finalResult = await chat.sendMessage([functionResponsePart]);
        finalText = finalResult.response?.text?.();
      } catch (secondCallErr) {
        console.warn(`[Chatbot] Second LLM call skipped (${secondCallErr.message}), using deterministic formatter`);
      }

      // If second call failed (e.g. role: 'function' unsupported or 429), use guaranteed formatter
      if (!finalText) {
        if (fnName === 'addExpense') {
          finalText = toolResult.message || `Expense added! ₹${fnArgs.amount} for ${fnArgs.category}.`;
        } else if (fnName === 'getBalances') {
          finalText = formatBalanceReply(toolResult.balances, context.userId);
        } else if (fnName === 'suggestSettlements') {
          finalText = formatSettlementReply(toolResult.suggestions);
        } else {
          finalText = 'Action completed successfully.';
        }
      }

      return {
        reply: finalText,
        action: toolError ? null : { function: fnName, result: toolResult },
      };
    } catch (err) {
      console.warn(`Gemini model ${modelName} failed:`, err.message);
      lastError = err;
      continue;
    }
  }

  // If all Gemini models failed (e.g. rate-limited 429 across models), check deterministic fallback
  const fallback = await fallbackIntentHandler(userMessage, context, ragContext);
  if (fallback) {
    return fallback;
  }

  throw lastError || new Error('All Gemini models failed to respond');
};

module.exports = { processMessage };
