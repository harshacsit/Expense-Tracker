const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');

const clearExpenses = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error('❌ MONGO_URI is not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected.');

    const expResult = await Expense.deleteMany({});
    const shareResult = await ExpenseShare.deleteMany({});

    console.log(`🗑️ Deleted ${expResult.deletedCount} expenses.`);
    console.log(`🗑️ Deleted ${shareResult.deletedCount} expense shares.`);
    console.log('✨ All expenses and shares cleared successfully! Balances are now reset.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing expenses:', error.message);
    process.exit(1);
  }
};

clearExpenses();
