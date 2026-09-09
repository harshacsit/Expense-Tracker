const Expense = require('../../models/Expense');
const ExpenseShare = require('../../models/ExpenseShare');
const HouseMember = require('../../models/HouseMember');
const { calculateEqualSplit, calculateCustomSplit } = require('../splitCalculator');
const { calculateBalances } = require('../balanceEngine');
const { simplifyDebts } = require('../debtSimplifier');

/**
 * intentRouter.js
 * 
 * Maps LLM function calls to internal service calls.
 * This is the guardrail layer — chatbot can ONLY trigger these 3 functions.
 * All validation still runs through the same logic used by the REST API.
 */

/**
 * Route the LLM's chosen function call to the appropriate internal service.
 * @param {string} functionName - name of the function called by LLM
 * @param {object} functionArgs - arguments passed by LLM
 * @param {object} context - { houseId, userId, members }
 * @returns {object} result to feed back to the LLM
 */
const routeIntent = async (functionName, functionArgs, context) => {
  const { houseId, userId, members } = context;

  switch (functionName) {
    case 'addExpense': {
      const { amount, category, description, splitType, customShares } = functionArgs;

      if (!amount || amount <= 0) throw new Error('Invalid amount provided');
      if (!category) throw new Error('Category is required');

      const memberIds = members.map((m) => m._id.toString());

      let shares;
      if (splitType === 'custom' && customShares) {
        shares = calculateCustomSplit(amount, customShares);
      } else {
        shares = calculateEqualSplit(amount, memberIds);
      }

      // Create expense
      const expense = await Expense.create({
        houseId,
        paidById: userId,
        amount,
        category,
        description: description || '',
        splitType: splitType || 'equal',
        date: new Date(),
      });

      // Create expense shares
      await ExpenseShare.insertMany(
        shares.map((s) => ({
          expenseId: expense._id,
          userId: s.userId,
          houseId,
          amountOwed: s.amountOwed,
        }))
      );

      const perPerson = splitType === 'equal'
        ? `₹${(amount / memberIds.length).toFixed(2)} each`
        : 'custom amounts';

      return {
        success: true,
        message: `Expense added! ₹${amount} for ${category} — split ${splitType} (${perPerson}).`,
        expenseId: expense._id,
      };
    }

    case 'getBalances': {
      const balances = await calculateBalances(houseId, members);
      return { success: true, balances };
    }

    case 'suggestSettlements': {
      const balances = await calculateBalances(houseId, members);
      const suggestions = simplifyDebts(balances);
      return { success: true, suggestions };
    }

    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
};

module.exports = { routeIntent };
