const {
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateCustomSplit,
} = require('../src/services/splitCalculator');
const { simplifyDebts } = require('../src/services/debtSimplifier');

/**
 * Edge-case tests defined in TDD.md §Testing Strategy:
 *
 * 1. Expense added with zero members → error thrown
 * 2. Settlement exceeding the actual owed amount
 * 3. Duplicate settlement submissions (idempotency — net balance check)
 * 4. Percentage shares with floating-point precision
 * 5. Single-member house (trivial split)
 */

describe('Edge Cases — Zero Members', () => {
  test('calculateEqualSplit throws when memberIds is empty array', () => {
    expect(() => calculateEqualSplit(500, [])).toThrow('No members provided');
  });

  test('calculateEqualSplit throws when memberIds is null', () => {
    expect(() => calculateEqualSplit(500, null)).toThrow();
  });

  test('calculatePercentageSplit throws when shares array is empty', () => {
    expect(() => calculatePercentageSplit(500, [])).toThrow();
  });

  test('calculateCustomSplit throws when customShares is empty', () => {
    expect(() => calculateCustomSplit(500, [])).toThrow();
  });
});

describe('Edge Cases — Settlement Exceeding Owed Amount', () => {
  /**
   * If user A owes B ₹150, but records a settlement of ₹200,
   * the net balance for A would become +₹50 (they're now owed).
   * debtSimplifier should reflect this correctly without crashing.
   */
  test('over-settlement reverses creditor/debtor roles', () => {
    // After over-settlement: A was debtor (-150) but paid 200 → now creditor (+50)
    const balancesAfterOverSettlement = [
      { userId: 'a', name: 'A', netBalance: 50 },   // previously owed, now owed by others
      { userId: 'b', name: 'B', netBalance: -50 },  // previously owed money, now debtor
    ];
    const result = simplifyDebts(balancesAfterOverSettlement);
    expect(result).toHaveLength(1);
    expect(result[0].from).toBe('b');
    expect(result[0].to).toBe('a');
    expect(result[0].amount).toBeCloseTo(50, 1);
  });

  test('exact settlement leaves balances at zero — no transactions needed', () => {
    const balanced = [
      { userId: 'a', name: 'A', netBalance: 0 },
      { userId: 'b', name: 'B', netBalance: 0 },
    ];
    const result = simplifyDebts(balanced);
    expect(result).toHaveLength(0);
  });
});

describe('Edge Cases — Duplicate Settlement Idempotency Check', () => {
  /**
   * If the same settlement is submitted twice (e.g., double-click bug),
   * the net balance would double-count the payment.
   * Test verifies the simplifier correctly reflects the doubled balance.
   */
  test('double-settlement results in 2x net credit for receiver', () => {
    // Ravi should have received ₹300 (double of ₹150)
    const afterDuplicate = [
      { userId: 'ravi', name: 'Ravi', netBalance: -300 }, // received 300 → now owes 300 (over-received)
      { userId: 'priya', name: 'Priya', netBalance: 300 }, // paid double
    ];
    const result = simplifyDebts(afterDuplicate);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBeCloseTo(300, 1);
  });
});

describe('Edge Cases — Single-Member House', () => {
  test('equal split with 1 member assigns full amount', () => {
    const result = calculateEqualSplit(750, ['solo_user']);
    expect(result).toHaveLength(1);
    expect(result[0].amountOwed).toBe(750);
  });

  test('percentage split with 100% for single member', () => {
    const result = calculatePercentageSplit(750, [{ userId: 'solo_user', percentage: 100 }]);
    expect(result).toHaveLength(1);
    expect(result[0].amountOwed).toBe(750);
  });
});

describe('Edge Cases — Large Group (10 members)', () => {
  test('equal split across 10 members sums exactly to total', () => {
    const members = Array.from({ length: 10 }, (_, i) => `user_${i}`);
    const amount = 333.33;
    const result = calculateEqualSplit(amount, members);
    const total = parseFloat(result.reduce((s, r) => s + r.amountOwed, 0).toFixed(2));
    expect(total).toBe(amount);
    expect(result).toHaveLength(10);
  });

  test('debt simplifier handles 10-member group in at most 9 transactions', () => {
    const balances = [
      { userId: 'u1', name: 'U1', netBalance: 500 },
      { userId: 'u2', name: 'U2', netBalance: 300 },
      { userId: 'u3', name: 'U3', netBalance: 200 },
      { userId: 'u4', name: 'U4', netBalance: -100 },
      { userId: 'u5', name: 'U5', netBalance: -150 },
      { userId: 'u6', name: 'U6', netBalance: -200 },
      { userId: 'u7', name: 'U7', netBalance: -250 },
      { userId: 'u8', name: 'U8', netBalance: -100 },
      { userId: 'u9', name: 'U9', netBalance: -100 },
      { userId: 'u10', name: 'U10', netBalance: -100 },
    ];
    const result = simplifyDebts(balances);
    expect(result.length).toBeLessThanOrEqual(9);
    // All payments should be positive
    result.forEach((t) => expect(t.amount).toBeGreaterThan(0));
  });
});
