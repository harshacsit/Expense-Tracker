const express = require('express');
const router = express.Router({ mergeParams: true });
const { addExpense, getExpenses, deleteExpense, scanReceipt } = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

// House-scoped expense routes (mounted at /api/houses/:id/expenses)
router.use(protect);
router.use(requireHouseMember);

router.get('/', getExpenses);
router.post('/', addExpense);
router.post('/scan-receipt', scanReceipt);

// Standalone expense delete (not house-scoped)
const expenseRouter = express.Router();
expenseRouter.delete('/:id', protect, deleteExpense);

module.exports = { expenseRouter: router, standaloneExpenseRouter: expenseRouter };
