const {
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateCustomSplit,
  calculateExactSplit,
} = require('../src/services/splitCalculator');

/**
 * Unit tests for splitCalculator.js
 * Verifies:
 *   1. Equal, Exact Amount, and Percentage split types
 *   2. Residual fraction distribution (zero penny/paise loss or floating-point drift)
 *   3. Strict validation and error handling
 */

const MEMBER_IDS = ['user_anith', 'user_ravi', 'user_priya'];

describe('calculateEqualSplit with Residual Fraction Distribution', () => {
  test('splits ₹1200 equally among 3 → ₹400 each', () => {
    const result = calculateEqualSplit(1200, MEMBER_IDS);
    expect(result).toHaveLength(3);
    const amounts = result.map((r) => r.amountOwed);
    const total = amounts.reduce((s, a) => s + a, 0);
    expect(total).toBe(1200);
    amounts.forEach((a) => expect(a).toBe(400));
  });

  test('splits ₹100 equally among 3 with residual fraction distribution (33.34, 33.33, 33.33)', () => {
    const result = calculateEqualSplit(100, MEMBER_IDS);
    expect(result).toHaveLength(3);
    expect(result[0].amountOwed).toBe(33.34);
    expect(result[1].amountOwed).toBe(33.33);
    expect(result[2].amountOwed).toBe(33.33);
    const total = result.reduce((s, r) => s + r.amountOwed, 0);
    expect(total).toBe(100);
  });

  test('splits ₹100.01 equally among 3 with residual fraction distribution (33.34, 33.34, 33.33)', () => {
    const result = calculateEqualSplit(100.01, MEMBER_IDS);
    expect(result).toHaveLength(3);
    expect(result[0].amountOwed).toBe(33.34);
    expect(result[1].amountOwed).toBe(33.34);
    expect(result[2].amountOwed).toBe(33.33);
    const total = parseFloat(result.reduce((s, r) => s + r.amountOwed, 0).toFixed(2));
    expect(total).toBe(100.01);
  });

  test('zero floating-point drift across arbitrary decimal amounts', () => {
    [1200, 900, 600, 450, 333.33, 100, 100.01, 77.77, 10.05, 0.05].forEach((amount) => {
      const result = calculateEqualSplit(amount, MEMBER_IDS);
      const total = parseFloat(result.reduce((s, r) => s + r.amountOwed, 0).toFixed(2));
      expect(total).toBe(amount);
    });
  });

  test('throws if no members provided', () => {
    expect(() => calculateEqualSplit(1000, [])).toThrow();
  });
});

describe('calculatePercentageSplit with Largest Remainder Distribution', () => {
  test('splits ₹1000 with 50%, 25%, 25% → ₹500, ₹250, ₹250', () => {
    const shares = [
      { userId: 'user_anith', percentage: 50 },
      { userId: 'user_ravi', percentage: 25 },
      { userId: 'user_priya', percentage: 25 },
    ];
    const result = calculatePercentageSplit(1000, shares);
    expect(result[0].amountOwed).toBe(500);
    expect(result[1].amountOwed).toBe(250);
    expect(result[2].amountOwed).toBe(250);
    const total = result.reduce((s, r) => s + r.amountOwed, 0);
    expect(total).toBe(1000);
  });

  test('splits ₹100 with 33.33%, 33.33%, 33.34% without penny loss', () => {
    const shares = [
      { userId: 'user_anith', percentage: 33.33 },
      { userId: 'user_ravi', percentage: 33.33 },
      { userId: 'user_priya', percentage: 33.34 },
    ];
    const result = calculatePercentageSplit(100, shares);
    const total = parseFloat(result.reduce((s, r) => s + r.amountOwed, 0).toFixed(2));
    expect(total).toBe(100);
  });

  test('throws error if percentages do not sum to 100%', () => {
    const invalidShares = [
      { userId: 'user_anith', percentage: 40 },
      { userId: 'user_ravi', percentage: 40 },
    ];
    expect(() => calculatePercentageSplit(1000, invalidShares)).toThrow(/100%/);
  });
});

describe('calculateCustomSplit & calculateExactSplit', () => {
  test('accepts valid custom shares that sum to total', () => {
    const shares = [
      { userId: 'user_ravi', amountOwed: 150 },
      { userId: 'user_priya', amountOwed: 150 },
      { userId: 'user_anith', amountOwed: 150 },
    ];
    const result = calculateExactSplit(450, shares);
    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.amountOwed).toBe(150));
  });

  test('throws if custom shares do not sum to total', () => {
    const shares = [
      { userId: 'user_ravi', amountOwed: 200 },
      { userId: 'user_priya', amountOwed: 100 },
    ];
    expect(() => calculateCustomSplit(450, shares)).toThrow(/expense total/i);
  });

  test('throws if no customShares provided', () => {
    expect(() => calculateCustomSplit(450, [])).toThrow();
  });
});
