require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const House = require('../models/House');
const HouseMember = require('../models/HouseMember');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');

const seed = async () => {
  try {
    await connectDB();
    console.log('Seeding demo data...');

    // 1. Create demo users
    let userAnith = await User.findOne({ email: 'anith@sunrise.com' });
    if (!userAnith) {
      userAnith = await User.create({
        name: 'Anith Kumar',
        email: 'anith@sunrise.com',
        password: 'password123',
      });
      console.log('Created user: Anith (anith@sunrise.com)');
    }

    let userRavi = await User.findOne({ email: 'ravi@sunrise.com' });
    if (!userRavi) {
      userRavi = await User.create({
        name: 'Ravi Sharma',
        email: 'ravi@sunrise.com',
        password: 'password123',
      });
      console.log('Created user: Ravi (ravi@sunrise.com)');
    }

    let userPriya = await User.findOne({ email: 'priya@sunrise.com' });
    if (!userPriya) {
      userPriya = await User.create({
        name: 'Priya Patel',
        email: 'priya@sunrise.com',
        password: 'password123',
      });
      console.log('Created user: Priya (priya@sunrise.com)');
    }

    // 2. Create demo house if not existing
    let house = await House.findOne({ inviteCode: 'SUNRISE1' });
    if (!house) {
      house = await House.create({
        name: 'Sunrise Villa 4B',
        createdBy: userAnith._id,
        inviteCode: 'SUNRISE1',
        currency: 'INR',
      });
      console.log('Created house: Sunrise Villa 4B (Code: SUNRISE1)');

      // Add house members
      await HouseMember.create({ houseId: house._id, userId: userAnith._id, role: 'admin' });
      await HouseMember.create({ houseId: house._id, userId: userRavi._id, role: 'member' });
      await HouseMember.create({ houseId: house._id, userId: userPriya._id, role: 'member' });

      // Add sample expenses
      const expense1 = await Expense.create({
        houseId: house._id,
        description: 'July Wi-Fi & Internet Bill',
        amount: 1500,
        paidById: userAnith._id,
        splitType: 'equal',
        category: 'Internet',
        date: new Date(),
      });
      await ExpenseShare.create({ expenseId: expense1._id, houseId: house._id, userId: userAnith._id, amountOwed: 500 });
      await ExpenseShare.create({ expenseId: expense1._id, houseId: house._id, userId: userRavi._id, amountOwed: 500 });
      await ExpenseShare.create({ expenseId: expense1._id, houseId: house._id, userId: userPriya._id, amountOwed: 500 });

      const expense2 = await Expense.create({
        houseId: house._id,
        description: 'Weekly Groceries & Vegetables',
        amount: 2400,
        paidById: userRavi._id,
        splitType: 'equal',
        category: 'Groceries',
        date: new Date(),
      });
      await ExpenseShare.create({ expenseId: expense2._id, houseId: house._id, userId: userAnith._id, amountOwed: 800 });
      await ExpenseShare.create({ expenseId: expense2._id, houseId: house._id, userId: userRavi._id, amountOwed: 800 });
      await ExpenseShare.create({ expenseId: expense2._id, houseId: house._id, userId: userPriya._id, amountOwed: 800 });

      console.log('Sample expenses & shares created!');
    }

    console.log('✅ Demo seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
