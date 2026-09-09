const express = require('express');
const router = express.Router({ mergeParams: true });
const { chat } = require('../controllers/chatbot.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

router.use(protect);
router.use(requireHouseMember);

router.post('/', chat);

module.exports = router;
