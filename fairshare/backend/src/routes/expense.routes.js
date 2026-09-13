const express = require('express');
const router = express.Router({ mergeParams: true });
const { addExpense, getExpenses, deleteExpense, updateExpense, scanReceipt } = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

// House-scoped expense routes (mounted at /api/houses/:id/expenses)
router.use(protect);
router.use(requireHouseMember);

router.get('/', getExpenses);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.post('/scan-receipt', scanReceipt);

// Standalone expense routes (not house-scoped)
const expenseRouter = express.Router();
expenseRouter.put('/:id', protect, updateExpense);
expenseRouter.delete('/:id', protect, deleteExpense);

module.exports = { expenseRouter: router, standaloneExpenseRouter: expenseRouter };
