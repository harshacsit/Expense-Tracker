const express = require('express');
const router = express.Router({ mergeParams: true });
const { getBalances } = require('../controllers/balance.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

router.use(protect);
router.use(requireHouseMember);
router.get('/', getBalances);

module.exports = router;
