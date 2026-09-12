const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const houseRoutes = require('./routes/house.routes');
const balanceRouter = require('./routes/balance.routes');
const settlementRoutes = require('./routes/settlement.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const { expenseRouter, standaloneExpenseRouter } = require('./routes/expense.routes');
const { protect } = require('./middleware/auth.middleware');
const { requireHouseMember } = require('./middleware/house.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middleware
const ALLOWED_ORIGIN = process.env.FRONTEND_URL;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman, server-side)
    if (!origin) return callback(null, true);
    // If FRONTEND_URL is set, validate allowed origins
    if (ALLOWED_ORIGIN && ALLOWED_ORIGIN !== '*') {
      const allowedList = ALLOWED_ORIGIN.split(',').map((u) => u.trim().replace(/\/$/, ''));
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedList.includes(normalizedOrigin)) return callback(null, true);
      console.warn(`[CORS] Rejected origin: ${origin}. Allowed: ${ALLOWED_ORIGIN}`);
      return callback(new Error('Not allowed by CORS'));
    }
    // Otherwise reflect any origin (dev mode / LAN access)
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Interactive API Documentation (TDD §12)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);

// House-scoped nested routes
app.use('/api/houses/:id/expenses', expenseRouter);
app.use('/api/houses/:id/balances', balanceRouter);
app.use('/api/houses/:id/settlements', settlementRoutes);
app.use('/api/houses/:id/chat', chatbotRoutes);

// Standalone expense delete
app.use('/api/expenses', standaloneExpenseRouter);

// Root welcome endpoint
app.get('/', (req, res) => res.json({ message: '🚀 FairShare API is running!', docs: '/api-docs', health: '/api/health' }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
