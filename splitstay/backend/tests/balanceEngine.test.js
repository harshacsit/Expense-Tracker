const { simplifyDebts } = require('../src/services/debtSimplifier');

/**
 * Unit tests for balanceEngine and debtSimplifier using BRD example:
 * 
 * After 4 equal-split expenses (₹3150 total):
 *   Ravi paid ₹1650, owed ₹1050 → net +₹600 (is owed)
 *   Priya paid ₹900,  owed ₹1050 → net −₹150 (owes)
 *   Anith paid ₹600,  owed ₹1050 → net −₹450 (owes)
 * 
 * Expected settlements:
 *   Anith → Ravi ₹450
 *   Priya → Ravi ₹150
 */

const BRD_BALANCES = [
  { userId: 'ravi_id', name: 'Ravi', netBalance: 600 },
  { userId: 'priya_id', name: 'Priya', netBalance: -150 },
  { userId: 'anith_id', name: 'Anith', netBalance: -450 },
];

describe('debtSimplifier - BRD Sunrise Apartments Example', () => {
  test('produces exactly 2 settlement transactions', () => {
    const result = simplifyDebts(BRD_BALANCES);
    expect(result).toHaveLength(2);
  });

  test('Anith pays Ravi ₹450', () => {
    const result = simplifyDebts(BRD_BALANCES);
    const anithToRavi = result.find((t) => t.from === 'anith_id' && t.to === 'ravi_id');
    expect(anithToRavi).toBeDefined();
    expect(anithToRavi.amount).toBeCloseTo(450, 1);
  });

  test('Priya pays Ravi ₹150', () => {
    const result = simplifyDebts(BRD_BALANCES);
    const priyaToRavi = result.find((t) => t.from === 'priya_id' && t.to === 'ravi_id');
    expect(priyaToRavi).toBeDefined();
    expect(priyaToRavi.amount).toBeCloseTo(150, 1);
  });

  test('all settlements sum to zero net change', () => {
    const result = simplifyDebts(BRD_BALANCES);
    const totalPayments = result.reduce((sum, t) => sum + t.amount, 0);
    // Total owed (positives) should equal total to receive
    expect(totalPayments).toBeCloseTo(600, 1); // Ravi is owed 600 total
  });

  test('handles already balanced (all zeros) gracefully', () => {
    const zeroed = [
      { userId: 'a', name: 'A', netBalance: 0 },
      { userId: 'b', name: 'B', netBalance: 0 },
    ];
    const result = simplifyDebts(zeroed);
    expect(result).toHaveLength(0);
  });

  test('handles two-person scenario correctly', () => {
    const twoPersonBalances = [
      { userId: 'alice', name: 'Alice', netBalance: 200 },
      { userId: 'bob', name: 'Bob', netBalance: -200 },
    ];
    const result = simplifyDebts(twoPersonBalances);
    expect(result).toHaveLength(1);
    expect(result[0].from).toBe('bob');
    expect(result[0].to).toBe('alice');
    expect(result[0].amount).toBeCloseTo(200, 1);
  });
});
