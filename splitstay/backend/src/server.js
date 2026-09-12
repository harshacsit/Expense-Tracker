require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SplitStay Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
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
