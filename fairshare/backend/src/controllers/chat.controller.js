const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const HouseMember = require('../models/HouseMember');
const User = require('../models/User');
const { getOnlineUserIds } = require('../sockets/chat.socket');

/**
 * Fetch or auto-create the house's single group conversation and its message history
 * GET /api/houses/:id/chat/group
 */
const getGroupChat = async (req, res) => {
  try {
    const houseId = req.params.houseId || req.params.id;

    // Get all house members
    const members = await HouseMember.find({ houseId }).select('userId');
    const memberUserIds = members.map((m) => m.userId);

    // Find or auto-create group conversation
    let conversation = await Conversation.findOne({ houseId, type: 'group' });
    if (!conversation) {
      conversation = await Conversation.create({
        type: 'group',
        houseId,
        participantIds: memberUserIds,
      });
    } else {
      // Ensure all current members are in participantIds
      const currentIds = conversation.participantIds.map(String);
      const missingIds = memberUserIds.filter((id) => !currentIds.includes(String(id)));
      if (missingIds.length > 0) {
        conversation.participantIds.push(...missingIds);
        await conversation.save();
      }
    }

    // Fetch latest 50 messages, ordered ascending for chat display
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', '_id name email')
      .lean();

    // Reverse so earliest is first
    messages.reverse();

    // Mark as read by current user in background
    Message.updateMany(
      { conversationId: conversation._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    ).exec();

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error('[getGroupChat Error]:', error);
    res.status(500).json({ message: 'Failed to load group chat' });
  }
};

/**
 * Fetch (or lazily create) a direct conversation with a roommate and its message history
 * GET /api/chat/direct/:userId
 */
const getDirectChat = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;
    let houseId = req.query.houseId;

    if (String(targetUserId) === String(currentUserId)) {
      return res.status(400).json({ message: 'Cannot start direct chat with yourself' });
    }

    // Verify target user exists
    const targetUser = await User.findById(targetUserId).select('_id name email');
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find shared house if not passed
    if (!houseId) {
      const myHouses = await HouseMember.find({ userId: currentUserId }).select('houseId');
      const targetHouses = await HouseMember.find({ userId: targetUserId }).select('houseId');

      const myHouseIds = myHouses.map((h) => String(h.houseId));
      const shared = targetHouses.find((h) => myHouseIds.includes(String(h.houseId)));

      if (!shared) {
        return res.status(403).json({ message: 'You and this user do not share a common house' });
      }
      houseId = shared.houseId;
    } else {
      // Validate both belong to specified house
      const [myMem, targetMem] = await Promise.all([
        HouseMember.findOne({ houseId, userId: currentUserId }),
        HouseMember.findOne({ houseId, userId: targetUserId }),
      ]);
      if (!myMem || !targetMem) {
        return res.status(403).json({ message: 'Both users must belong to this house' });
      }
    }

    // Find or create the direct conversation
    let conversation = await Conversation.findOne({
      houseId,
      type: 'direct',
      participantIds: { $all: [currentUserId, targetUserId] },
    }).populate('participantIds', '_id name email');

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        houseId,
        participantIds: [currentUserId, targetUserId],
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participantIds',
        '_id name email'
      );
    }

    // Fetch messages
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', '_id name email')
      .lean();

    messages.reverse();

    // Mark as read
    Message.updateMany(
      { conversationId: conversation._id, readBy: { $ne: currentUserId } },
      { $addToSet: { readBy: currentUserId } }
    ).exec();

    res.json({
      conversation,
      targetUser,
      messages,
    });
  } catch (error) {
    console.error('[getDirectChat Error]:', error);
    res.status(500).json({ message: 'Failed to load direct chat' });
  }
};

/**
 * List house members with online status and direct conversation preview
 * GET /api/houses/:id/chat/members
 */
const getHouseChatMembers = async (req, res) => {
  try {
    const houseId = req.params.houseId || req.params.id;
    const currentUserId = req.user._id;

    const memberships = await HouseMember.find({ houseId })
      .populate('userId', '_id name email')
      .lean();

    const onlineUserIds = getOnlineUserIds().map(String);

    // For each member, find if there is an existing direct conversation
    const membersData = await Promise.all(
      memberships.map(async (m) => {
        if (!m.userId) return null;
        const uId = String(m.userId._id);
        const isSelf = uId === String(currentUserId);
        const isOnline = onlineUserIds.includes(uId);

        let directConversationId = null;
        let unreadCount = 0;
        let lastMessage = null;

        if (!isSelf) {
          const directConv = await Conversation.findOne({
            houseId,
            type: 'direct',
            participantIds: { $all: [currentUserId, m.userId._id] },
          });

          if (directConv) {
            directConversationId = directConv._id;
            // Get unread count
            unreadCount = await Message.countDocuments({
              conversationId: directConv._id,
              senderId: m.userId._id,
              readBy: { $ne: currentUserId },
            });
            // Get last message
            const last = await Message.findOne({ conversationId: directConv._id })
              .sort({ createdAt: -1 })
              .select('text createdAt senderId')
              .lean();
            if (last) {
              lastMessage = {
                text: last.text,
                createdAt: last.createdAt,
                isMine: String(last.senderId) === String(currentUserId),
              };
            }
          }
        }

        return {
          userId: m.userId._id,
          name: m.userId.name,
          email: m.userId.email,
          role: m.role,
          isSelf,
          isOnline,
          directConversationId,
          unreadCount,
          lastMessage,
        };
      })
    );

    res.json(membersData.filter(Boolean));
  } catch (error) {
    console.error('[getHouseChatMembers Error]:', error);
    res.status(500).json({ message: 'Failed to load chat members' });
  }
};

module.exports = {
  getGroupChat,
  getDirectChat,
  getHouseChatMembers,
};
