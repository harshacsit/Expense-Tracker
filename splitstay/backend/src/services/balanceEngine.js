const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const Settlement = require('../models/Settlement');

/**
 * balanceEngine.js
 * 
 * Computes real-time "who owes whom" balances for a house.
 * 
 * Formula per member:
 *   netBalance = totalPaid - totalOwed + settlementsReceived - settlementsPaid
 * 
 * BRD Example (Sunrise Apartments):
 *   Ravi paid ₹1650, owed ₹1050 → +₹600 (is owed)
 *   Priya paid ₹900,  owed ₹1050 → −₹150 (owes)
 *   Anith paid ₹600,  owed ₹1050 → −₹450 (owes)
 */

/**
 * Calculate net balances for all members of a house.
 * @param {string} houseId
 * @param {Array<{_id: string, name: string, email: string}>} members - all members
 * @returns {Array<{userId, name, email, totalPaid, totalOwed, settlementsGiven, settlementsReceived, netBalance}>}
 */
const calculateBalances = async (houseId, members) => {
  const memberIds = members.map((m) => m._id.toString());

  // --- Total paid per member ---
  const expenses = await Expense.find({ houseId });
  const paidMap = {};
  memberIds.forEach((id) => (paidMap[id] = 0));
  expenses.forEach((exp) => {
    const pid = exp.paidById.toString();
    if (paidMap[pid] !== undefined) {
      paidMap[pid] += exp.amount;
    }
  });

  // --- Total owed per member (from ExpenseShare) ---
  const shares = await ExpenseShare.find({ houseId });
  const owedMap = {};
  memberIds.forEach((id) => (owedMap[id] = 0));
  shares.forEach((share) => {
    const uid = share.userId.toString();
    if (owedMap[uid] !== undefined) {
      owedMap[uid] += share.amountOwed;
    }
  });

  // --- Settlements ---
  const settlements = await Settlement.find({ houseId });
  const settledGivenMap = {};
  const settledReceivedMap = {};
  memberIds.forEach((id) => {
    settledGivenMap[id] = 0;
    settledReceivedMap[id] = 0;
  });
  settlements.forEach((s) => {
    const from = s.fromUserId.toString();
    const to = s.toUserId.toString();
    if (settledGivenMap[from] !== undefined) settledGivenMap[from] += s.amount;
    if (settledReceivedMap[to] !== undefined) settledReceivedMap[to] += s.amount;
  });

  // --- Compute net balance ---
  return members.map((member) => {
    const id = member._id.toString();
    const totalPaid = parseFloat((paidMap[id] || 0).toFixed(2));
    const totalOwed = parseFloat((owedMap[id] || 0).toFixed(2));
    const settlementsGiven = parseFloat((settledGivenMap[id] || 0).toFixed(2));
    const settlementsReceived = parseFloat((settledReceivedMap[id] || 0).toFixed(2));
    const netBalance = parseFloat(
      (totalPaid - totalOwed + settlementsReceived - settlementsGiven).toFixed(2)
    );

    return {
      userId: id,
      name: member.name,
      email: member.email,
      totalPaid,
      totalOwed,
      settlementsGiven,
      settlementsReceived,
      netBalance, // positive = is owed, negative = owes
    };
  });
};

module.exports = { calculateBalances };
