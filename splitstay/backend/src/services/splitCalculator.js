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
 * Calculate equal splits for an expense with residual fraction distribution.
 * Any leftover paise/cents from rounding are distributed 1 cent per member
 * to guarantee the sum of shares strictly equals the total expense.
 * 
 * @param {number} amount - Total expense amount
 * @param {string[]} memberUserIds - Array of user IDs to split among
 * @returns {Array<{userId: string, amountOwed: number}>}
 */
const calculateEqualSplit = (amount, memberUserIds) => {
  if (!memberUserIds || memberUserIds.length === 0) {
    throw new Error('No members provided for split calculation');
  }

  const n = memberUserIds.length;
  const totalCents = Math.round(Number(amount) * 100);
  const baseCents = Math.floor(totalCents / n);
  let remainderCents = totalCents - (baseCents * n);

  return memberUserIds.map((userId) => {
    const extra = remainderCents > 0 ? 1 : 0;
    if (remainderCents > 0) remainderCents--;
    return {
      userId,
      amountOwed: (baseCents + extra) / 100,
    };
  });
};

/**
 * Calculate percentage splits for an expense with residual fraction distribution.
 * Allocates base cents by percentage, then distributes residual cents to shares
 * with the highest fractional remainder (Hamilton / Largest Remainder method).
 * 
 * @param {number} amount - Total expense amount
 * @param {Array<{userId: string, percentage: number}>} percentageShares
 * @returns {Array<{userId: string, amountOwed: number}>}
 */
const calculatePercentageSplit = (amount, percentageShares) => {
  if (!percentageShares || percentageShares.length === 0) {
    throw new Error('Percentage shares must be provided');
  }

  const totalPercentage = percentageShares.reduce((sum, s) => sum + Number(s.percentage || 0), 0);
  if (Math.abs(totalPercentage - 100) > 0.05) {
    throw new Error(
      `Percentages must sum to 100%, currently sums to ${totalPercentage.toFixed(1)}%`
    );
  }

  const totalCents = Math.round(Number(amount) * 100);
  let allocatedCents = 0;

  const rawShares = percentageShares.map((s, index) => {
    const exactCents = (totalCents * Number(s.percentage)) / 100;
    const baseCents = Math.floor(exactCents);
    allocatedCents += baseCents;
    return {
      index,
      userId: s.userId,
      cents: baseCents,
      fraction: exactCents - baseCents,
    };
  });

  let remainderCents = totalCents - allocatedCents;
  // Sort by highest fractional remainder to assign residual cents fairly
  const sortedIndices = [...rawShares.keys()].sort(
    (a, b) => rawShares[b].fraction - rawShares[a].fraction
  );

  for (let i = 0; i < remainderCents; i++) {
    const targetIdx = sortedIndices[i % sortedIndices.length];
    rawShares[targetIdx].cents += 1;
  }

  return rawShares.map((s) => ({
    userId: s.userId,
    amountOwed: s.cents / 100,
  }));
};

/**
 * Validate and return custom (exact amount) splits.
 * @param {number} amount - Total expense amount
 * @param {Array<{userId: string, amountOwed: number}>} customShares
 * @returns {Array<{userId: string, amountOwed: number}>}
 */
const calculateCustomSplit = (amount, customShares) => {
  if (!customShares || customShares.length === 0) {
    throw new Error('Custom shares must be provided');
  }

  const parsedAmount = Number(amount);
  const total = customShares.reduce((sum, s) => sum + Number(s.amountOwed || 0), 0);
  const diff = Math.abs(total - parsedAmount);

  if (diff > 0.01) {
    throw new Error(
      `Custom shares sum to ${total.toFixed(2)}, but expense total is ${parsedAmount.toFixed(2)}`
    );
  }

  return customShares.map((s) => ({
    userId: s.userId,
    amountOwed: parseFloat(Number(s.amountOwed).toFixed(2)),
  }));
};

const calculateExactSplit = calculateCustomSplit;

module.exports = {
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateCustomSplit,
  calculateExactSplit,
};
