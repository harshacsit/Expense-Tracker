const express = require('express');
const router = express.Router();
const { createHouse, joinHouse, getMyHouses, getHouse, getMembers } = require('../controllers/house.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

router.use(protect);

router.get('/', getMyHouses);
router.post('/', createHouse);
router.post('/join', joinHouse);
router.get('/:id', requireHouseMember, getHouse);
router.get('/:id/members', requireHouseMember, getMembers);

module.exports = router;
