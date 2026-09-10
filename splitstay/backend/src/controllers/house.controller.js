const House = require('../models/House');
const HouseMember = require('../models/HouseMember');
const User = require('../models/User');
const { generateInviteCode } = require('../utils/generateInviteCode');
const { calculateBalances } = require('../services/balanceEngine');

// @desc  Create a new house
// @route POST /api/houses
const createHouse = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'House name is required' });

    const inviteCode = generateInviteCode();
    const house = await House.create({ name, inviteCode, createdBy: req.user._id });

    // Add creator as admin member
    await HouseMember.create({ userId: req.user._id, houseId: house._id, role: 'admin' });

    res.status(201).json({ house, inviteCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Join a house via invite code
// @route POST /api/houses/join
const joinHouse = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: 'Invite code is required' });

    const house = await House.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!house) return res.status(404).json({ message: 'Invalid invite code' });

    // Check if already a member
    const existing = await HouseMember.findOne({ userId: req.user._id, houseId: house._id });
    if (existing) return res.status(409).json({ message: 'You are already a member of this house' });

    await HouseMember.create({ userId: req.user._id, houseId: house._id });

    res.json({ message: `Joined "${house.name}" successfully!`, house });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all houses the user belongs to
// @route GET /api/houses
const getMyHouses = async (req, res) => {
  try {
    const memberships = await HouseMember.find({ userId: req.user._id }).populate('houseId');
    const houses = memberships.map((m) => m.houseId);
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get a single house
// @route GET /api/houses/:id
const getHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all members of a house
// @route GET /api/houses/:id/members
const getMembers = async (req, res) => {
  try {
    const memberships = await HouseMember.find({ houseId: req.params.id }).populate(
      'userId',
      'name email'
    );
    const members = memberships.map((m) => ({ ...m.userId.toObject(), role: m.role }));
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update house currency
// @route PUT /api/houses/:id/currency
const updateCurrency = async (req, res) => {
  try {
    const { currency } = req.body;
    const allowed = ['INR', 'USD', 'EUR', 'GBP'];
    if (!allowed.includes(currency)) {
      return res.status(400).json({ message: `Currency must be one of: ${allowed.join(', ')}` });
    }

    const house = await House.findByIdAndUpdate(
      req.params.id,
      { currency },
      { new: true }
    );
    if (!house) return res.status(404).json({ message: 'House not found' });

    res.json({ message: 'Currency updated successfully', house });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Leave house (with unsettled balance guard - TDD §11)
// @route POST /api/houses/:id/leave
const leaveHouse = async (req, res) => {
  try {
    const houseId = req.params.id;
    const userId = req.user._id;

    // Load members and verify balance is zero
    const memberships = await HouseMember.find({ houseId }).populate('userId', 'name email _id');
    const members = memberships.map((m) => m.userId);

    const balances = await calculateBalances(houseId, members);
    const myBalance = balances.find((b) => b.userId.toString() === userId.toString());

    if (myBalance && Math.abs(myBalance.netBalance) > 0.01) {
      const owes = myBalance.netBalance < -0.01;
      return res.status(400).json({
        message: owes
          ? `Cannot leave house with an unsettled debt of ₹${Math.abs(myBalance.netBalance).toFixed(2)}. Please settle up first.`
          : `Cannot leave house while you are still owed ₹${myBalance.netBalance.toFixed(2)}. Please settle up first.`,
        netBalance: myBalance.netBalance,
      });
    }

    // Balance is settled — remove membership
    await HouseMember.findOneAndDelete({ houseId, userId });

    res.json({ message: 'Successfully left the house.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createHouse, joinHouse, getMyHouses, getHouse, getMembers, updateCurrency, leaveHouse };
