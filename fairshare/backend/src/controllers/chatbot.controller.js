const HouseMember = require('../models/HouseMember');
const { processMessage } = require('../services/chatbot/chatbot.service');

// @desc  Send message to AI chatbot
// @route POST /api/houses/:id/chat
const chat = async (req, res) => {
  try {
    const houseId = req.params.id;
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Load all house members for context
    const memberships = await HouseMember.find({ houseId }).populate('userId', 'name email _id');
    const members = memberships.map((m) => m.userId);

    if (members.length === 0) {
      return res.status(400).json({ message: 'House has no members' });
    }

    const context = {
      houseId,
      userId: req.user._id,
      members,
    };

    const { reply, action } = await processMessage(message, history, context);

    res.json({ reply, action });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ message: 'Chatbot service error: ' + error.message });
  }
};

module.exports = { chat };
