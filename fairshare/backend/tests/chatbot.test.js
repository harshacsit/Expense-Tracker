const { CHATBOT_TOOLS, SYSTEM_PROMPT } = require('../src/services/chatbot/functions');

/**
 * Chatbot guardrail and schema tests.
 * No actual API calls — tests the function definitions and system prompt rules.
 */

describe('Chatbot Functions Schema', () => {
  test('defines exactly 3 tools', () => {
    expect(CHATBOT_TOOLS).toHaveLength(3);
  });

  test('tool names are addExpense, getBalances, suggestSettlements', () => {
    const names = CHATBOT_TOOLS.map((t) => t.name);
    expect(names).toContain('addExpense');
    expect(names).toContain('getBalances');
    expect(names).toContain('suggestSettlements');
  });

  test('addExpense requires amount, category, splitType', () => {
    const addExpenseTool = CHATBOT_TOOLS.find((t) => t.name === 'addExpense');
    expect(addExpenseTool.input_schema.required).toContain('amount');
    expect(addExpenseTool.input_schema.required).toContain('category');
    expect(addExpenseTool.input_schema.required).toContain('splitType');
  });

  test('addExpense category enum includes Groceries, Utilities, Rent', () => {
    const addExpenseTool = CHATBOT_TOOLS.find((t) => t.name === 'addExpense');
    const categoryEnum = addExpenseTool.input_schema.properties.category.enum;
    expect(categoryEnum).toContain('Groceries');
    expect(categoryEnum).toContain('Utilities');
    expect(categoryEnum).toContain('Rent');
  });

  test('getBalances requires no parameters', () => {
    const getBalancesTool = CHATBOT_TOOLS.find((t) => t.name === 'getBalances');
    expect(getBalancesTool.input_schema.required).toHaveLength(0);
  });

  test('suggestSettlements requires no parameters', () => {
    const suggestTool = CHATBOT_TOOLS.find((t) => t.name === 'suggestSettlements');
    expect(suggestTool.input_schema.required).toHaveLength(0);
  });
});

describe('Chatbot System Prompt Guardrails', () => {
  test('system prompt exists and is a non-empty string', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  test('system prompt forbids direct database writes', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/never write.*database|never.*db|function calls/i);
  });

  test('system prompt requires function use, not assumptions', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/function|tool/i);
  });

  test('system prompt mentions currency symbol ₹', () => {
    expect(SYSTEM_PROMPT).toContain('₹');
  });
});
