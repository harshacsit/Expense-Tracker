/**
 * functions.js
 *
 * Function-calling schema exposed to the Gemini LLM.
 * Defines the 3 approved functions: addExpense, getBalances, suggestSettlements.
 * The chatbot CANNOT do anything else — guardrail by design.
 *
 * Schema format: Gemini functionDeclarations (OpenAPI-style)
 */

const GEMINI_TOOLS = [
  {
    name: 'addExpense',
    description:
      'Add a new shared expense to the current house. Use this when the user says they paid for something that should be split among housemates.',
    parameters: {
      type: 'OBJECT',
      properties: {
        amount: {
          type: 'NUMBER',
          description: 'The total amount paid in INR (₹)',
        },
        category: {
          type: 'STRING',
          description: 'Category of the expense. Must be one of: Rent, Groceries, Utilities, Internet, Cooking Gas, Entertainment, Other',
        },
        description: {
          type: 'STRING',
          description: 'Optional short description of the expense',
        },
        splitType: {
          type: 'STRING',
          description: 'How to split: "equal" divides evenly among all members, "custom" uses customShares',
        },
        customShares: {
          type: 'ARRAY',
          description:
            'Required only when splitType is "custom". Each object has userId and amountOwed.',
          items: {
            type: 'OBJECT',
            properties: {
              userId: { type: 'STRING' },
              amountOwed: { type: 'NUMBER' },
            },
          },
        },
      },
      required: ['amount', 'category', 'splitType'],
    },
  },
  {
    name: 'getBalances',
    description:
      'Get the current balance for every member in the house — who owes whom and how much. Call this when the user asks about debts, balances, or what someone owes.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'suggestSettlements',
    description:
      'Get the minimum set of payments needed to fully settle all balances in the house. Use this when the user asks how to settle up or clear debts.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];

const SYSTEM_PROMPT = `You are the SplitStay assistant — a helpful, concise AI for shared roommate expense management.

RULES:
1. You can perform actions using the provided functions: addExpense, getBalances, suggestSettlements.
2. For spending summaries, category breakdowns, spending trends, or questions about past expenses: use the HOUSE EXPENSE HISTORY context provided below to give a clear, accurate breakdown. If the history says no expenses were found, inform the user kindly.
3. NEVER assume or make up amounts, names, or categories when adding expenses. If the user's message is missing required fields (amount, category), ask for them before calling addExpense.
4. NEVER write to any database directly. All actions must go through approved function calls.
5. NEVER invent balance numbers. For balance and settlement queries, always call getBalances or suggestSettlements.
6. Keep responses concise, well-structured, and friendly. Use ₹ for currency amounts.
7. If the user asks something completely outside house expense management, politely decline and redirect to SplitStay topics.

EXAMPLES:
- User: "I paid 800 for groceries, split equally" → call addExpense
- User: "How much does Ravi owe?" or "Check balance" → call getBalances
- User: "How should we settle up?" → call suggestSettlements
- User: "Show me our spending summary for this month" → summarize totals and categories using the HOUSE EXPENSE HISTORY context
- User: "Did we spend more on food this month?" → compare using the HOUSE EXPENSE HISTORY context`;

/**
 * CHATBOT_TOOLS — Anthropic/Claude-compatible schema (used in unit tests & future Claude integration).
 * Mirrors GEMINI_TOOLS but uses `input_schema` instead of `parameters`.
 */
const CHATBOT_TOOLS = [
  {
    name: 'addExpense',
    description: 'Add a new shared expense to the current house.',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Total amount paid in INR (₹)' },
        category: {
          type: 'string',
          description: 'Category of the expense',
          enum: ['Rent', 'Groceries', 'Utilities', 'Internet', 'Cooking Gas', 'Entertainment', 'Other'],
        },
        description: { type: 'string', description: 'Optional short description' },
        splitType: { type: 'string', description: '"equal" | "custom" | "percentage"' },
        customShares: {
          type: 'array',
          description: 'Required when splitType is "custom"',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              amountOwed: { type: 'number' },
            },
          },
        },
      },
      required: ['amount', 'category', 'splitType'],
    },
  },
  {
    name: 'getBalances',
    description: 'Get current balance for every member in the house.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'suggestSettlements',
    description: 'Get the minimum payments needed to settle all balances.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

module.exports = { GEMINI_TOOLS, CHATBOT_TOOLS, SYSTEM_PROMPT };
