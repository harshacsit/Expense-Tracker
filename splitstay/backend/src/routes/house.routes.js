const express = require('express');
const router = express.Router();
const { createHouse, joinHouse, getMyHouses, getHouse, getMembers, updateCurrency, leaveHouse } = require('../controllers/house.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

router.use(protect);

router.get('/', getMyHouses);
router.post('/', createHouse);
router.post('/join', joinHouse);
router.get('/:id', requireHouseMember, getHouse);
router.get('/:id/members', requireHouseMember, getMembers);
router.put('/:id/currency', requireHouseMember, updateCurrency);
router.post('/:id/leave', requireHouseMember, leaveHouse);

module.exports = router;
