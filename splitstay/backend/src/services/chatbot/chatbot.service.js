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
 * @param {string} userMessage - The raw message from the user
 * @param {string[]} conversationHistory - Array of {role, content} prior messages
 * @param {object} context - { houseId, userId, members }
 * @returns {{ reply: string, action: object|null }}
 */
const processMessage = async (userMessage, conversationHistory = [], context) => {
  const { houseId } = context;

  // Build RAG context for insight-type questions
  const insightKeywords = ['spend', 'spent', 'more', 'less', 'month', 'trend', 'most', 'breakdown'];
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

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
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

  // --- Second LLM call with function result ---
  const functionResponsePart = {
    functionResponse: {
      name: fnName,
      response: toolResult,
    },
  };

  const finalResult = await chat.sendMessage([functionResponsePart]);
  const finalText = finalResult.response.text();

  return {
    reply: finalText || 'Done.',
    action: toolError ? null : { function: fnName, result: toolResult },
  };
};

module.exports = { processMessage };
