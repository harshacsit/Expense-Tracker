const express = require('express');
const {
  getGroupChat,
  getDirectChat,
  getHouseChatMembers,
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireHouseMember } = require('../middleware/house.middleware');

// House-scoped chat router (mounted under /api/houses/:id/chat)
const houseChatRouter = express.Router({ mergeParams: true });
houseChatRouter.use(protect);
houseChatRouter.use(requireHouseMember);

houseChatRouter.get('/group', getGroupChat);
houseChatRouter.get('/members', getHouseChatMembers);

// Standalone chat router (mounted under /api/chat)
const standaloneChatRouter = express.Router();
standaloneChatRouter.use(protect);

standaloneChatRouter.get('/direct/:userId', getDirectChat);

module.exports = {
  houseChatRouter,
  standaloneChatRouter,
};
