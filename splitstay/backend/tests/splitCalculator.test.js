const { calculateEqualSplit, calculateCustomSplit } = require('../src/services/splitCalculator');

/**
 * Unit tests for splitCalculator.js
 * Uses BRD "Sunrise Apartments" example data:
 *   3 members: Anith, Ravi, Priya
 *   Groceries ₹1200 → each ₹400
 *   Electricity ₹900 → each ₹300
 *   Internet ₹600 → each ₹200
 *   Cooking Gas ₹450 → each ₹150
 */

const MEMBER_IDS = ['user_anith', 'user_ravi', 'user_priya'];

describe('calculateEqualSplit', () => {
  test('splits ₹1200 equally among 3 → ₹400 each', () => {
    const result = calculateEqualSplit(1200, MEMBER_IDS);
    expect(result).toHaveLength(3);
    const amounts = result.map((r) => r.amountOwed);
    const total = amounts.reduce((s, a) => s + a, 0);
    expect(total).toBeCloseTo(1200, 1);
    amounts.forEach((a) => expect(a).toBeCloseTo(400, 1));
  });

  test('splits ₹900 equally among 3 → ₹300 each', () => {
    const result = calculateEqualSplit(900, MEMBER_IDS);
    result.forEach((r) => expect(r.amountOwed).toBeCloseTo(300, 1));
  });

  test('splits ₹600 equally among 3 → ₹200 each', () => {
    const result = calculateEqualSplit(600, MEMBER_IDS);
    result.forEach((r) => expect(r.amountOwed).toBeCloseTo(200, 1));
  });

  test('splits ₹450 equally among 3 → ₹150 each', () => {
    const result = calculateEqualSplit(450, MEMBER_IDS);
    result.forEach((r) => expect(r.amountOwed).toBeCloseTo(150, 1));
  });

  test('total of all splits always equals original amount', () => {
    [1200, 900, 600, 450, 333, 101].forEach((amount) => {
      const result = calculateEqualSplit(amount, MEMBER_IDS);
      const total = result.reduce((s, r) => s + r.amountOwed, 0);
      expect(total).toBeCloseTo(amount, 1);
    });
  });

  test('throws if no members provided', () => {
    expect(() => calculateEqualSplit(1000, [])).toThrow();
  });

  test('each result has userId and amountOwed', () => {
    const result = calculateEqualSplit(300, MEMBER_IDS);
    result.forEach((r) => {
      expect(r).toHaveProperty('userId');
      expect(r).toHaveProperty('amountOwed');
    });
  });
});

describe('calculateCustomSplit', () => {
  test('accepts valid custom shares that sum to total', () => {
    const shares = [
      { userId: 'user_ravi', amountOwed: 150 },
      { userId: 'user_priya', amountOwed: 150 },
      { userId: 'user_anith', amountOwed: 150 },
    ];
    const result = calculateCustomSplit(450, shares);
    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.amountOwed).toBeCloseTo(150, 1));
  });

  test('throws if custom shares do not sum to total', () => {
    const shares = [
      { userId: 'user_ravi', amountOwed: 200 },
      { userId: 'user_priya', amountOwed: 100 },
    ];
    expect(() => calculateCustomSplit(450, shares)).toThrow(/sum/i);
  });

  test('throws if no customShares provided', () => {
    expect(() => calculateCustomSplit(450, [])).toThrow();
  });
});
