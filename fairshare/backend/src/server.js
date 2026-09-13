require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initChatSocket } = require('./sockets/chat.socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const server = http.createServer(app);

  // Initialize Socket.io real-time chat
  initChatSocket(server);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FairShare Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💬 Real-Time Chat Socket.io enabled`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
    } else {
      console.error('❌ Server error:', err);
    }
  });

  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
};

startServer();
