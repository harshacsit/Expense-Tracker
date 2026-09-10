const House = require('../models/House');
const HouseMember = require('../models/HouseMember');
const { calculateBalances } = require('../services/balanceEngine');
const { simplifyDebts } = require('../services/debtSimplifier');
const { sendBalanceReminderEmail } = require('../services/email.service');

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// @desc  Get real-time balances for all house members
// @route GET /api/houses/:id/balances
const getBalances = async (req, res) => {
  try {
    const houseId = req.params.id;

    const memberships = await HouseMember.find({ houseId }).populate('userId', 'name email');
    const members = memberships.map((m) => m.userId);

    if (members.length === 0) {
      return res.json({ balances: [], settlements: [] });
    }

    const balances = await calculateBalances(houseId, members);
    const settlementSuggestions = simplifyDebts(balances);

    res.json({ balances, settlementSuggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Send balance reminder emails to members who owe money
// @route POST /api/houses/:id/balances/remind
const sendReminder = async (req, res) => {
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: 'House not found' });

    const memberships = await HouseMember.find({ houseId }).populate('userId', 'name email');
    const members = memberships.map((m) => m.userId);

    if (members.length === 0) {
      return res.status(400).json({ message: 'No members in this house' });
    }

    const balances = await calculateBalances(houseId, members);
    const settlementSuggestions = simplifyDebts(balances);
    const currencySymbol = CURRENCY_SYMBOLS[house.currency] || '₹';

    // Filter debtors
    const debtors = balances.filter((b) => b.netBalance < -0.01);
    if (debtors.length === 0) {
      return res.json({ message: 'All members are settled up! No reminders needed.' });
    }

    const sentTo = [];
    for (const debtor of debtors) {
      const mySettlements = settlementSuggestions.filter((s) => s.from === debtor.userId);
      try {
        await sendBalanceReminderEmail({
          to: debtor.email,
          debtorName: debtor.name,
          houseName: house.name,
          amount: debtor.netBalance,
          currencySymbol,
          settlements: mySettlements,
        });
        sentTo.push(debtor.name);
      } catch (err) {
        console.warn(`Could not send reminder email to ${debtor.email}:`, err.message);
        // Continue with other debtors even if one fails
      }
    }

    res.json({
      message: `Balance reminders sent to ${sentTo.length} roommate(s): ${sentTo.join(', ')}`,
      count: sentTo.length,
      debtors: sentTo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBalances, sendReminder };
