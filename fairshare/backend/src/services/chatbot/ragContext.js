const Expense = require('../../models/Expense');

/**
 * ragContext.js
 * 
 * Retrieves relevant expense history to ground LLM answers
 * for open-ended spending insight questions.
 * 
 * Instead of full vector embeddings, we use structured filtering
 * (current month vs. last month by category) — sufficient for the
 * use cases in the BRD (e.g., "did we spend more on food this month?")
 */

/**
 * Build a plain-text context block from the house's expense history.
 * @param {string} houseId
 * @param {number} [monthsBack=2] - How many months of history to include
 * @returns {string} A formatted string to inject into the LLM prompt
 */
const buildExpenseContext = async (houseId, monthsBack = 2) => {
  const since = new Date();
  since.setMonth(since.getMonth() - monthsBack);

  const expenses = await Expense.find({
    houseId,
    date: { $gte: since },
  })
    .populate('paidById', 'name')
    .sort({ date: -1 })
    .limit(50);

  if (expenses.length === 0) {
    return 'No expenses found in the past 2 months for this house.';
  }

  // Group by month
  const grouped = {};
  expenses.forEach((exp) => {
    const monthKey = exp.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(
      `- ${exp.paidById?.name || 'Unknown'} paid ₹${exp.amount} for ${exp.category}${exp.description ? ` (${exp.description})` : ''} on ${exp.date.toLocaleDateString('en-IN')}`
    );
  });

  const lines = ['HOUSE EXPENSE HISTORY (last 2 months):'];
  Object.entries(grouped).forEach(([month, items]) => {
    lines.push(`\n${month}:`);
    lines.push(...items);
  });

  return lines.join('\n');
};

module.exports = { buildExpenseContext };
