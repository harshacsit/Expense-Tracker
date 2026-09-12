const Settlement = require('../models/Settlement');
const HouseMember = require('../models/HouseMember');

// @desc  Record a settlement payment between members
// @route POST /api/houses/:id/settlements
const recordSettlement = async (req, res) => {
  try {
    const houseId = req.params.id;
    const toUserId = req.body.toUserId || req.body.payeeId;
    const fromUserId = req.body.fromUserId || req.body.payerId || req.user._id;
    const { amount, note } = req.body;

    if (!toUserId || !amount) {
      return res.status(400).json({ message: 'Recipient (toUserId/payeeId) and amount are required' });
    }

    if (toUserId.toString() === fromUserId.toString()) {
      return res.status(400).json({ message: 'Payer and recipient cannot be the same person' });
    }

    // Verify recipient is a house member
    const recipientMembership = await HouseMember.findOne({ userId: toUserId, houseId });
    if (!recipientMembership) {
      return res.status(400).json({ message: 'Recipient is not a member of this house' });
    }

    const settlement = await Settlement.create({
      houseId,
      fromUserId,
      toUserId,
      amount,
      note: note || '',
    });

    const populated = await Settlement.findById(settlement._id)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    res.status(201).json({
      settlement: populated,
      message: `Settlement of ₹${amount} recorded successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all settlements for a house
// @route GET /api/houses/:id/settlements
const getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({ houseId: req.params.id })
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ date: -1 });

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { recordSettlement, getSettlements };
