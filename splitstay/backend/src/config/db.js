const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`👉 Tip: Check your MongoDB Atlas Network Access (IP Whitelist - ensure 0.0.0.0/0 or your current IP is allowed)`);
  }
};

module.exports = connectDB;
