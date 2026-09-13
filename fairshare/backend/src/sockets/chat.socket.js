let Server;
try {
  Server = require('socket.io').Server;
} catch (err) {
  // socket.io not installed yet
}

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const HouseMember = require('../models/HouseMember');

// In-memory mapping of userId -> Set of socketIds for presence tracking
const activeUserSockets = new Map();

function getOnlineUserIds() {
  return Array.from(activeUserSockets.keys());
}

function initChatSocket(httpServer) {
  if (!Server) {
    console.warn('⚠️ [Chat Socket]: socket.io is not installed yet. Run "npm install socket.io" in backend to enable real-time chat.');
    return null;
  }

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow any origin or configured frontend
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT Handshake Authentication
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const secret = process.env.JWT_SECRET || 'fairshare_jwt_secret_dev_fallback_key_2026';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('_id name email');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('[Socket Auth Error]:', err.message);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = String(socket.user._id);

    // Track user socket presence
    if (!activeUserSockets.has(userId)) {
      activeUserSockets.set(userId, new Set());
    }
    activeUserSockets.get(userId).add(socket.id);

    // Join personal user room for direct invites
    socket.join(`user:${userId}`);

    // Join all conversation rooms user belongs to
    try {
      const userHouses = await HouseMember.find({ userId: socket.user._id }).select('houseId');
      const houseIds = userHouses.map((h) => h.houseId);

      const userConversations = await Conversation.find({
        $or: [
          { houseId: { $in: houseIds }, type: 'group' },
          { participantIds: socket.user._id },
        ],
      }).select('_id');

      userConversations.forEach((conv) => {
        socket.join(String(conv._id));
      });
    } catch (err) {
      console.error('[Socket Join Error]:', err.message);
    }

    // Broadcast user online status
    io.emit('presence:online', { userId });

    // 1. Send Message event
    socket.on('message:send', async ({ conversationId, text }, callback) => {
      try {
        if (!conversationId || !text || !text.trim()) {
          if (callback) callback({ error: 'Message text and conversation ID are required' });
          return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          if (callback) callback({ error: 'Conversation not found' });
          return;
        }

        // Validate sender is an active member of the house
        const membership = await HouseMember.findOne({
          houseId: conversation.houseId,
          userId: socket.user._id,
        });

        if (!membership) {
          if (callback) callback({ error: 'Access denied: You are not a member of this house' });
          return;
        }

        // For direct chats, verify user is one of the two participants
        if (conversation.type === 'direct') {
          const isParticipant = conversation.participantIds.some(
            (p) => String(p) === String(socket.user._id)
          );
          if (!isParticipant) {
            if (callback) callback({ error: 'Access denied: Not a participant in this direct chat' });
            return;
          }
        }

        // Create and persist message
        const message = await Message.create({
          conversationId,
          senderId: socket.user._id,
          text: text.trim(),
          readBy: [socket.user._id],
        });

        const populated = await Message.findById(message._id).populate(
          'senderId',
          '_id name email'
        );

        // Broadcast to all sockets in conversation room
        io.to(String(conversationId)).emit('message:new', populated);

        if (callback) callback({ success: true, message: populated });
      } catch (err) {
        console.error('[Socket message:send Error]:', err);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    // 2. Read Message event
    socket.on('message:read', async ({ conversationId, messageId }) => {
      try {
        if (!conversationId) return;

        if (messageId) {
          await Message.findByIdAndUpdate(messageId, {
            $addToSet: { readBy: socket.user._id },
          });
          io.to(String(conversationId)).emit('message:readUpdate', {
            conversationId,
            messageId,
            userId: socket.user._id,
          });
        } else {
          // Mark all messages in this conversation as read by this user
          await Message.updateMany(
            { conversationId, readBy: { $ne: socket.user._id } },
            { $addToSet: { readBy: socket.user._id } }
          );
          io.to(String(conversationId)).emit('message:readUpdate', {
            conversationId,
            userId: socket.user._id,
          });
        }
      } catch (err) {
        console.error('[Socket message:read Error]:', err.message);
      }
    });

    // 3. Start or Fetch Direct Conversation
    socket.on('direct:start', async ({ houseId, targetUserId }, callback) => {
      try {
        if (!houseId || !targetUserId) {
          if (callback) callback({ error: 'houseId and targetUserId are required' });
          return;
        }

        // Verify both users belong to the house
        const [myMembership, targetMembership] = await Promise.all([
          HouseMember.findOne({ houseId, userId: socket.user._id }),
          HouseMember.findOne({ houseId, userId: targetUserId }),
        ]);

        if (!myMembership || !targetMembership) {
          if (callback) callback({ error: 'Both users must belong to the house' });
          return;
        }

        // Find existing direct conversation between these two users
        let conversation = await Conversation.findOne({
          houseId,
          type: 'direct',
          participantIds: { $all: [socket.user._id, targetUserId] },
        });

        // If not found, create it lazily
        if (!conversation) {
          conversation = await Conversation.create({
            type: 'direct',
            houseId,
            participantIds: [socket.user._id, targetUserId],
          });
        }

        const convId = String(conversation._id);

        // Join current socket to room
        socket.join(convId);

        // Join target user's active sockets to room
        const targetSockets = activeUserSockets.get(String(targetUserId));
        if (targetSockets) {
          targetSockets.forEach((sId) => {
            const targetSocket = io.sockets.sockets.get(sId);
            if (targetSocket) targetSocket.join(convId);
          });
        }

        if (callback) {
          callback({
            success: true,
            conversationId: convId,
            conversation,
          });
        }
      } catch (err) {
        console.error('[Socket direct:start Error]:', err);
        if (callback) callback({ error: 'Failed to start direct conversation' });
      }
    });

    // Disconnection
    socket.on('disconnect', () => {
      const userSockets = activeUserSockets.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUserSockets.delete(userId);
          // Broadcast presence offline
          io.emit('presence:offline', { userId });
        }
      }
    });
  });

  return io;
}

module.exports = {
  initChatSocket,
  getOnlineUserIds,
};
