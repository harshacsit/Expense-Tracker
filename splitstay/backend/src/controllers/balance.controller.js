const HouseMember = require('../models/HouseMember');
const { calculateBalances } = require('../services/balanceEngine');
const { simplifyDebts } = require('../services/debtSimplifier');

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

module.exports = { getBalances };
