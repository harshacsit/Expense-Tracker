const express = require('express');
const router = express.Router({ mergeParams: true });
const { recordSettlement, getSettlements } = require('../controllers/settlement.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

router.use(protect);
router.use(requireHouseMember);

router.get('/', getSettlements);
router.post('/', recordSettlement);

module.exports = router;
