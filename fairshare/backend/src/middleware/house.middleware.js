const HouseMember = require('../models/HouseMember');

/**
 * Verify that the authenticated user is a member of the house
 * specified by req.params.houseId or req.params.id
 */
const requireHouseMember = async (req, res, next) => {
  try {
    const houseId = req.params.houseId || req.params.id;

    const membership = await HouseMember.findOne({
      userId: req.user._id,
      houseId,
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied: you are not a member of this house' });
    }

    req.membership = membership;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error in house membership check' });
  }
};

module.exports = { requireHouseMember };
