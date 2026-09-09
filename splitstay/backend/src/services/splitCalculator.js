/**
 * splitCalculator.js
 * 
 * Handles equal and custom split calculation for shared expenses.
 * 
 * BRD Example (Sunrise Apartments, 3 members):
 *   Groceries ₹1200 → each pays ₹400
 *   Electricity ₹900 → each pays ₹300
 *   Internet ₹600 → each pays ₹200
 *   Cooking Gas ₹450 → each pays ₹150
 */

/**
 * Calculate equal splits for an expense.
 * @param {number} amount - Total expense amount
 * @param {string[]} memberUserIds - Array of user IDs to split among
 * @returns {Array<{userId: string, amountOwed: number}>}
 */
const calculateEqualSplit = (amount, memberUserIds) => {
  if (!memberUserIds || memberUserIds.length === 0) {
    throw new Error('No members provided for split calculation');
  }
  const share = parseFloat((amount / memberUserIds.length).toFixed(2));
  // Distribute rounding remainder to first member
  const totalAssigned = share * memberUserIds.length;
  const remainder = parseFloat((amount - totalAssigned).toFixed(2));

  return memberUserIds.map((userId, index) => ({
    userId,
    amountOwed: index === 0 ? parseFloat((share + remainder).toFixed(2)) : share,
  }));
};

/**
 * Validate and return custom splits.
 * @param {number} amount - Total expense amount
 * @param {Array<{userId: string, amountOwed: number}>} customShares
 * @returns {Array<{userId: string, amountOwed: number}>}
 */
const calculateCustomSplit = (amount, customShares) => {
  if (!customShares || customShares.length === 0) {
    throw new Error('Custom shares must be provided');
  }

  const total = customShares.reduce((sum, s) => sum + s.amountOwed, 0);
  const diff = Math.abs(total - amount);

  if (diff > 0.01) {
    throw new Error(
      `Custom shares sum to ₹${total.toFixed(2)}, but expense total is ₹${amount.toFixed(2)}`
    );
  }

  return customShares.map((s) => ({
    userId: s.userId,
    amountOwed: parseFloat(s.amountOwed.toFixed(2)),
  }));
};

module.exports = { calculateEqualSplit, calculateCustomSplit };
