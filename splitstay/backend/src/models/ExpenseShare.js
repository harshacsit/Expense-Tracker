const mongoose = require('mongoose');

const expenseShareSchema = new mongoose.Schema(
  {
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    amountOwed: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpenseShare', expenseShareSchema);
