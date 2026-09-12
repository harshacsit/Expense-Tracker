/**
 * debtSimplifier.js
 * 
 * Implements the minimum-cash-flow greedy algorithm to suggest the
 * fewest number of payments needed to fully settle all balances.
 * 
 * BRD Example:
 *   Input:  Ravi +600, Priya -150, Anith -450
 *   Output: [Anith → Ravi ₹450, Priya → Ravi ₹150]  (2 transactions)
 * 
 * Algorithm:
 *   1. Sort members: creditors (positive) and debtors (negative) lists
 *   2. Greedily match largest debtor to largest creditor
 *   3. Repeat until all balances are 0
 * 
 * Formal Guarantee:
 *   The minimum-cash-flow debt simplification algorithm guarantees that N house members
 *   can always fully settle their collective balances in at most N − 1 transactions,
 *   by greedily matching the largest debtor against the largest creditor until all balances reach zero.
 */

/**
 * @param {Array<{userId: string, name: string, netBalance: number}>} balances
 * @returns {Array<{from: string, fromName: string, to: string, toName: string, amount: number}>}
 */
const simplifyDebts = (balances) => {
  const transactions = [];

  // Deep copy with rounding to avoid floating-point drift
  const members = balances.map((b) => ({
    ...b,
    netBalance: parseFloat(b.netBalance.toFixed(2)),
  }));

  // Separate creditors (net > 0) and debtors (net < 0)
  const getCreditors = () =>
    members.filter((m) => m.netBalance > 0.005).sort((a, b) => b.netBalance - a.netBalance);
  const getDebtors = () =>
    members.filter((m) => m.netBalance < -0.005).sort((a, b) => a.netBalance - b.netBalance);

  let creditors = getCreditors();
  let debtors = getDebtors();
  let iterations = 0;

  while (creditors.length > 0 && debtors.length > 0 && iterations < 100) {
    iterations++;
    const creditor = creditors[0];
    const debtor = debtors[0];

    // Settlement amount = minimum of what's owed and what's due
    const amount = parseFloat(
      Math.min(Math.abs(debtor.netBalance), creditor.netBalance).toFixed(2)
    );

    transactions.push({
      from: debtor.userId,
      fromName: debtor.name,
      to: creditor.userId,
      toName: creditor.name,
      amount,
    });

    // Update balances
    const credIdx = members.findIndex((m) => m.userId === creditor.userId);
    const debtIdx = members.findIndex((m) => m.userId === debtor.userId);
    members[credIdx].netBalance = parseFloat((members[credIdx].netBalance - amount).toFixed(2));
    members[debtIdx].netBalance = parseFloat((members[debtIdx].netBalance + amount).toFixed(2));

    creditors = getCreditors();
    debtors = getDebtors();
  }

  return transactions;
};

module.exports = { simplifyDebts };
