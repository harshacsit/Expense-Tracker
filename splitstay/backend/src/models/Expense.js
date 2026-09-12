const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    paidById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      required: true,
      enum: ['Rent', 'Groceries', 'Utilities', 'Internet', 'Cooking Gas', 'Entertainment', 'Other'],
    },
    description: { type: String, trim: true },
    splitType: { type: String, enum: ['equal', 'custom', 'percentage', 'exact'], default: 'equal' },
    receiptUrl: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
