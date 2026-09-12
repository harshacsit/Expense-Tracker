const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const HouseMember = require('../models/HouseMember');
const User = require('../models/User');
const {
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateCustomSplit,
} = require('../services/splitCalculator');
const { scanReceiptImage } = require('../services/receiptScanner.service');

// @desc  Add a new expense to a house
// @route POST /api/houses/:id/expenses
const addExpense = async (req, res) => {
  try {
    const { amount, category, description, splitType, customShares, percentageShares, paidById, memberIds, receiptUrl } = req.body;
    const houseId = req.params.id;

    if (!amount || !category) {
      return res.status(400).json({ message: 'Amount and category are required' });
    }

    // Determine target members for split calculation
    let splitMemberIds = memberIds;
    if (!splitMemberIds || !Array.isArray(splitMemberIds) || splitMemberIds.length === 0) {
      const memberships = await HouseMember.find({ houseId }).populate('userId', 'name email');
      splitMemberIds = memberships.map((m) => m.userId?._id?.toString() || m.userId?.toString());
    }

    if (!splitMemberIds || splitMemberIds.length === 0) {
      return res.status(400).json({ message: 'No members in this house' });
    }

    // Calculate splits
    let shares;
    try {
      if ((splitType === 'percentage' || splitType === 'percent') && (percentageShares || customShares)) {
        shares = calculatePercentageSplit(amount, percentageShares || customShares);
      } else if ((splitType === 'custom' || splitType === 'exact') && customShares) {
        shares = calculateCustomSplit(amount, customShares);
      } else {
        shares = calculateEqualSplit(amount, splitMemberIds);
      }
    } catch (splitError) {
      return res.status(400).json({ message: splitError.message });
    }

    const payerId = paidById || req.user._id;

    // Create expense
    const expense = await Expense.create({
      houseId,
      paidById: payerId,
      amount,
      category,
      description: description || '',
      splitType: splitType || 'equal',
      receiptUrl: receiptUrl || '',
    });

    // Create individual shares
    const shareDocuments = shares.map((s) => ({
      expenseId: expense._id,
      userId: s.userId,
      houseId,
      amountOwed: s.amountOwed,
    }));
    await ExpenseShare.insertMany(shareDocuments);

    const populatedExpense = await Expense.findById(expense._id).populate('paidById', 'name email');

    res.status(201).json({
      expense: populatedExpense,
      shares,
      message: `Expense of ₹${amount} added and split ${splitType || 'equal'}ly among ${splitMemberIds.length} members`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all expenses for a house
// @route GET /api/houses/:id/expenses
const getExpenses = async (req, res) => {
  try {
    const { category, member, page = 1, limit = 20, search } = req.query;
    const filter = { houseId: req.params.id };

    if (category) filter.category = category;
    if (member) filter.paidById = member;
    if (search && search.trim()) {
      filter.$or = [
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const expenses = await Expense.find(filter)
      .populate('paidById', 'name email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filter);

    // Attach shares to each expense
    const expensesWithShares = await Promise.all(
      expenses.map(async (exp) => {
        const shares = await ExpenseShare.find({ expenseId: exp._id }).populate('userId', 'name');
        return { ...exp.toObject(), shares };
      })
    );

    res.json({ expenses: expensesWithShares, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete an expense (only creator can delete)
// @route DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.paidById.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete expenses you created' });
    }

    // Delete associated shares first
    await ExpenseShare.deleteMany({ expenseId: expense._id });
    await expense.deleteOne();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Scan a receipt image using Gemini Vision OCR and extract expense details
// @route POST /api/houses/:id/expenses/scan-receipt
const scanReceipt = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: 'No receipt image provided' });
    }

    const parsed = await scanReceiptImage(imageBase64, mimeType || 'image/jpeg');
    res.json({ success: true, parsed });
  } catch (error) {
    console.error('Receipt scanning error:', error);
    res.status(500).json({ message: error.message || 'Failed to analyze receipt image' });
  }
};

module.exports = { addExpense, getExpenses, deleteExpense, scanReceipt };
