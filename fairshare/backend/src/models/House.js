const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    inviteCode: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, enum: ['INR', 'USD', 'EUR', 'GBP'], default: 'INR' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('House', houseSchema);
