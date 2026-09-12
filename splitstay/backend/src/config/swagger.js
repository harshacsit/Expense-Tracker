/**
 * OpenAPI 3.0 Specification for SplitStay REST API
 * Corresponds to TDD.md Section 4 & 12
 */
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SplitStay REST API',
    version: '1.0.0',
    description:
      'API documentation for SplitStay — Shared Roommate Expense Tracker with Conversational AI, double-entry balance netting, and debt simplification.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your signed JWT token obtained from /api/auth/login or /api/auth/register',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Anith' },
          email: { type: 'string', example: 'anith@example.com' },
          avatar: { type: 'string', nullable: true },
        },
      },
      House: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Sunrise Apartments' },
          inviteCode: { type: 'string', example: 'CF0BDF36' },
          currency: { type: 'string', enum: ['INR', 'USD', 'EUR', 'GBP'], example: 'INR' },
          createdBy: { type: 'string' },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          houseId: { type: 'string' },
          paidById: { type: 'string' },
          amount: { type: 'number', example: 1200 },
          category: {
            type: 'string',
            enum: ['Rent', 'Groceries', 'Utilities', 'Internet', 'Cooking Gas', 'Entertainment', 'Other'],
            example: 'Groceries',
          },
          description: { type: 'string', example: 'Weekly supermarket shopping' },
          splitType: { type: 'string', enum: ['equal', 'custom', 'percentage', 'exact'], example: 'equal' },
          date: { type: 'string', format: 'date-time' },
        },
      },
      Balance: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          totalPaid: { type: 'number', example: 2000 },
          totalOwed: { type: 'number', example: 1350 },
          settlementsGiven: { type: 'number', example: 0 },
          settlementsReceived: { type: 'number', example: 0 },
          netBalance: { type: 'number', example: 650 },
        },
      },
      SettlementSuggestion: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          fromName: { type: 'string', example: 'Anith' },
          to: { type: 'string' },
          toName: { type: 'string', example: 'bhogi anith' },
          amount: { type: 'number', example: 350 },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'Server is healthy and responsive' } },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Anith' },
                  email: { type: 'string', example: 'anith@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created successfully with signed JWT token' },
          400: { description: 'Email already registered or invalid fields' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate credentials and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'anith@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Fetch current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current user profile' } },
      },
    },
    '/api/auth/account': {
      delete: {
        summary: 'Account deletion & Right to Be Forgotten (GDPR)',
        description: 'Purges user personal credentials while retaining anonymized ledger continuity',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Account successfully deleted and anonymized' },
        },
      },
    },
    '/api/houses': {
      get: {
        summary: 'List all houses user belongs to',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of user houses' } },
      },
      post: {
        summary: 'Create a new house group',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Apartment 402' },
                  currency: { type: 'string', enum: ['INR', 'USD', 'EUR', 'GBP'], default: 'INR' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'House created and unique invite code generated' } },
      },
    },
    '/api/houses/join': {
      post: {
        summary: 'Join an existing house via invite code',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['inviteCode'],
                properties: { inviteCode: { type: 'string', example: 'CF0BDF36' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Joined house successfully' } },
      },
    },
    '/api/houses/{id}/members': {
      get: {
        summary: 'List all members in a house',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Array of house members' } },
      },
    },
    '/api/houses/{id}/leave': {
      post: {
        summary: 'Leave house group with unsettled balance guard',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Successfully left house' },
          400: { description: 'Cannot leave house with unsettled balance' },
        },
      },
    },
    '/api/houses/{id}/currency': {
      put: {
        summary: 'Update house default currency',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currency'],
                properties: { currency: { type: 'string', enum: ['INR', 'USD', 'EUR', 'GBP'] } },
              },
            },
          },
        },
        responses: { 200: { description: 'Currency updated' } },
      },
    },
    '/api/houses/{id}/expenses': {
      get: {
        summary: 'Fetch paginated expense list with search and filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Expenses with total and pagination' } },
      },
      post: {
        summary: 'Create a shared expense with exact split distribution',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'category'],
                properties: {
                  amount: { type: 'number', example: 600 },
                  category: { type: 'string', example: 'Internet' },
                  description: { type: 'string', example: 'WiFi bill' },
                  splitType: { type: 'string', enum: ['equal', 'custom', 'percentage', 'exact'], default: 'equal' },
                  customShares: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Expense created and shares stored' } },
      },
    },
    '/api/houses/{id}/expenses/scan-receipt': {
      post: {
        summary: 'Scan receipt image via Gemini Vision OCR',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['base64Data'],
                properties: {
                  base64Data: { type: 'string', description: 'Base64 image data' },
                  mimeType: { type: 'string', default: 'image/jpeg' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Extracted amount, category, merchant description, and date' } },
      },
    },
    '/api/expenses/{id}': {
      delete: {
        summary: 'Delete an expense and its associated shares',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Expense deleted' } },
      },
    },
    '/api/houses/{id}/balances': {
      get: {
        summary: 'Get net balances and minimum debt settlement paths',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Balances array and settlementSuggestions array' } },
      },
    },
    '/api/houses/{id}/balances/remind': {
      post: {
        summary: 'Send balance reminder emails to debtors via Resend',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Reminder emails dispatched' } },
      },
    },
    '/api/houses/{id}/settlements': {
      get: {
        summary: 'Get all recorded peer-to-peer settlements',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'List of recorded settlements' } },
      },
      post: {
        summary: 'Record a settlement payment between two house members',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['toUserId', 'amount'],
                properties: {
                  toUserId: { type: 'string' },
                  amount: { type: 'number', example: 350 },
                  note: { type: 'string', example: 'UPI transfer' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Settlement recorded and balances zeroed' } },
      },
    },
    '/api/houses/{id}/chat': {
      post: {
        summary: 'Process conversational expense, balance, or settlement prompt',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'Show me our spending summary for this month' },
                  history: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Chat response with reply text and executed action' } },
      },
    },
  },
};

module.exports = swaggerSpec;
