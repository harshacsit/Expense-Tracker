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
1. You can ONLY perform actions using the provided functions: addExpense, getBalances, suggestSettlements.
2. NEVER assume or make up amounts, names, or categories. If the user's message is missing required fields (amount, category), ask for them before calling a function.
3. NEVER write to any database directly. All actions go through approved function calls.
4. For balance and settlement queries, always call the appropriate function — never guess or invent numbers.
5. Keep responses concise and friendly. Use ₹ for currency amounts.
6. If the user asks something outside your scope (e.g., personal finance advice), politely decline and redirect to house expense topics.

EXAMPLES:
- User: "I paid 800 for groceries, split equally" → call addExpense
- User: "How much does Ravi owe?" → call getBalances
- User: "How should we settle up?" → call suggestSettlements
- User: "Did we spend more on food this month?" → answer using context if provided, else ask clarifying questions`;

module.exports = { GEMINI_TOOLS, SYSTEM_PROMPT };
