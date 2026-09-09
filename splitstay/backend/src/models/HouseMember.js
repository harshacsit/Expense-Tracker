const mongoose = require('mongoose');

const houseMemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { timestamps: true }
);

// Ensure unique membership
houseMemberSchema.index({ userId: 1, houseId: 1 }, { unique: true });

module.exports = mongoose.model('HouseMember', houseMemberSchema);
