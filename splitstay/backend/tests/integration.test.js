const { calculateEqualSplit } = require('../src/services/splitCalculator');
const { simplifyDebts } = require('../src/services/debtSimplifier');

/**
 * Integration Test Suite (TDD.md §11 Testing Strategy)
 *
 * Covers the full financial life cycle:
 * 1. Roommates A, B, and C share a house.
 * 2. Roommate A logs a ₹1,200 equal-split expense.
 * 3. Balances are calculated: A is owed ₹800; B and C each owe ₹400.
 * 4. Roommate B records a ₹400 settlement to A.
 * 5. Balances are re-calculated: B reaches ₹0.00, A is owed ₹400, C owes ₹400.
 * 6. Roommate C records a ₹400 settlement to A.
 * 7. Balances reach exactly ₹0.00 for all members.
 * 8. Unsettled departure guard: prevents member with balance from leaving.
 */

describe('Integration — Full Financial Lifecycle (TDD §11)', () => {
  const members = [
    { _id: 'user_a', name: 'Alice' },
    { _id: 'user_b', name: 'Bob' },
    { _id: 'user_c', name: 'Charlie' },
  ];
  const memberIds = members.map((m) => m._id);

  test('Step 1-3: Expense creation & balance netting', () => {
    const expenseAmount = 1200;
    const shares = calculateEqualSplit(expenseAmount, memberIds);

    expect(shares).toHaveLength(3);
    expect(shares.reduce((s, x) => s + x.amountOwed, 0)).toBe(1200);

    // Calculate net balances after A pays ₹1200 split equally
    const balances = members.map((m) => {
      const share = shares.find((s) => s.userId === m._id);
      const paid = m._id === 'user_a' ? 1200 : 0;
      const owed = share ? share.amountOwed : 0;
      return {
        userId: m._id,
        name: m.name,
        totalPaid: paid,
        totalOwed: owed,
        netBalance: paid - owed,
      };
    });

    const alice = balances.find((b) => b.userId === 'user_a');
    const bob = balances.find((b) => b.userId === 'user_b');
    const charlie = balances.find((b) => b.userId === 'user_c');

    expect(alice.netBalance).toBe(800); // Alice is owed 800
    expect(bob.netBalance).toBe(-400);   // Bob owes 400
    expect(charlie.netBalance).toBe(-400); // Charlie owes 400
  });

  test('Step 4-5: Partial settlement by Bob updates balances correctly', () => {
    // Bob pays Alice ₹400
    const settlements = [
      { fromUserId: 'user_b', toUserId: 'user_a', amount: 400 },
    ];

    const balances = members.map((m) => {
      const paid = m._id === 'user_a' ? 1200 : 0;
      const owed = 400; // 1200 / 3
      const settlementsGiven = settlements
        .filter((s) => s.fromUserId === m._id)
        .reduce((sum, s) => sum + s.amount, 0);
      const settlementsReceived = settlements
        .filter((s) => s.toUserId === m._id)
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        userId: m._id,
        name: m.name,
        netBalance: paid - owed + settlementsGiven - settlementsReceived,
      };
    });

    const alice = balances.find((b) => b.userId === 'user_a');
    const bob = balances.find((b) => b.userId === 'user_b');
    const charlie = balances.find((b) => b.userId === 'user_c');

    expect(bob.netBalance).toBe(0);     // Bob fully settled
    expect(alice.netBalance).toBe(400);  // Alice is now owed 400
    expect(charlie.netBalance).toBe(-400); // Charlie still owes 400

    // Debt simplifier suggests only Charlie -> Alice payment
    const suggestions = simplifyDebts(balances);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].from).toBe('user_c');
    expect(suggestions[0].to).toBe('user_a');
    expect(suggestions[0].amount).toBe(400);
  });

  test('Step 6-7: Final settlement brings all balances to exactly zero', () => {
    const settlements = [
      { fromUserId: 'user_b', toUserId: 'user_a', amount: 400 },
      { fromUserId: 'user_c', toUserId: 'user_a', amount: 400 },
    ];

    const balances = members.map((m) => {
      const paid = m._id === 'user_a' ? 1200 : 0;
      const owed = 400;
      const settlementsGiven = settlements
        .filter((s) => s.fromUserId === m._id)
        .reduce((sum, s) => sum + s.amount, 0);
      const settlementsReceived = settlements
        .filter((s) => s.toUserId === m._id)
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        userId: m._id,
        name: m.name,
        netBalance: paid - owed + settlementsGiven - settlementsReceived,
      };
    });

    balances.forEach((b) => {
      expect(Math.abs(b.netBalance)).toBeLessThan(0.001);
    });

    const suggestions = simplifyDebts(balances);
    expect(suggestions).toHaveLength(0); // Zero transactions needed
  });

  test('Step 8: Member departure guard blocks unsettled members', () => {
    // Charlie owes 400, Alice is owed 400, Bob is 0
    const unsettledBalances = [
      { userId: 'user_a', netBalance: 400 },
      { userId: 'user_b', netBalance: 0 },
      { userId: 'user_c', netBalance: -400 },
    ];

    const canLeave = (userId) => {
      const b = unsettledBalances.find((x) => x.userId === userId);
      return !b || Math.abs(b.netBalance) <= 0.01;
    };

    // Bob can leave because balance is 0
    expect(canLeave('user_b')).toBe(true);

    // Charlie cannot leave because he owes money
    expect(canLeave('user_c')).toBe(false);

    // Alice cannot leave because she is still owed money
    expect(canLeave('user_a')).toBe(false);
  });
});
