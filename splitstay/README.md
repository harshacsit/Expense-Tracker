# SplitStay 🏠

> **Smart shared expense splitting for roommates** — with an AI chatbot powered by Claude.

SplitStay lets roommates track shared expenses, automatically split costs, see real-time balances, and settle debts — all through a beautiful web app with a conversational AI assistant.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Auth** | JWT-based registration & login |
| 🏠 **House Groups** | Create or join a shared house via invite code |
| 💸 **Shared Expense Logging** | Add expenses with amount, category, description |
| ÷ **Split Types** | Equal split or custom amounts per person |
| ⚖️ **Real-time Balances** | Automatic "who owes whom" calculation |
| 🤝 **Settlements** | Record payments between members |
| 📊 **Dashboard** | Monthly totals, balance overview, expense history |
| 🤖 **AI Chatbot** | Natural-language expense entry & balance queries via Claude |
| 💡 **Debt Simplification** | Minimum-transaction settlement suggestions |

---

## 🛠️ Tech Stack

**Backend:** Node.js · Express · MongoDB (Mongoose) · JWT · Anthropic Claude SDK  
**Frontend:** React 18 · Vite · Tailwind CSS · React Router v6 · Axios

---

## 🚀 Quick Start

### 1. Backend

```bash
cd splitstay/backend
npm install
# Edit .env with your credentials (already pre-filled)
npm run dev
```
Server starts at **http://localhost:5000**

### 2. Frontend

```bash
cd splitstay/frontend
npm install
npm run dev
```
App opens at **http://localhost:3000**

---

## 🧪 Run Tests

```bash
cd splitstay/backend
npm test
```

**26 tests across 3 suites:**
- `splitCalculator.test.js` — equal/custom split logic
- `balanceEngine.test.js` — BRD Sunrise Apartments example (Anith, Ravi, Priya)
- `chatbot.test.js` — function schemas & guardrail validation

---

## 📖 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/houses` | Create a new house |
| POST | `/api/houses/join` | Join via invite code |
| GET | `/api/houses` | List your houses |
| GET | `/api/houses/:id/members` | List all members |
| GET | `/api/houses/:id/expenses` | Get expenses (filterable) |
| POST | `/api/houses/:id/expenses` | Add new expense |
| DELETE | `/api/expenses/:id` | Delete expense (owner only) |
| GET | `/api/houses/:id/balances` | Real-time balance summary |
| POST | `/api/houses/:id/settlements` | Record a payment |
| POST | `/api/houses/:id/chat` | AI chatbot message |

---

## 🤖 AI Chatbot

The chatbot uses **Claude claude-3-5-sonnet** with function calling. It can:

- **Add expenses** via natural language: _"I paid ₹800 for groceries, split equally"_
- **Query balances**: _"How much does Ravi owe me?"_
- **Suggest settlements**: _"How should we settle up?"_
- **Spending insights** (RAG): _"Did we spend more on food this month?"_

**Guardrails:** The chatbot never writes to the database directly — all actions route through the same backend services/controllers as normal UI actions.

---

## 📋 Sample Scenario

**Sunrise Apartments** — 3 members: Anith, Ravi, Priya

| # | Paid By | Amount | Category | Split |
|---|---|---|---|---|
| 1 | Ravi | ₹1,200 | Groceries | Equal |
| 2 | Priya | ₹900 | Utilities | Equal |
| 3 | Anith | ₹600 | Internet | Equal |
| 4 | Ravi | ₹450 | Cooking Gas | Equal |

**Balances (each owes ₹1,050):**
- Ravi: **+₹600** (is owed)
- Priya: **−₹150** (owes)
- Anith: **−₹450** (owes)

**AI Chatbot settlement suggestion:** Anith → Ravi ₹450, Priya → Ravi ₹150 *(2 transactions only)*

---

## 📁 Project Structure

```
splitstay/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.middleware.js, house.middleware.js
│   │   ├── models/User, House, HouseMember, Expense, ExpenseShare, Settlement
│   │   ├── controllers/ (auth, house, expense, balance, settlement, chatbot)
│   │   ├── routes/ (auth, house, expense, settlement, chatbot)
│   │   ├── services/ splitCalculator, balanceEngine, debtSimplifier
│   │   └── services/chatbot/ chatbot.service, intentRouter, functions, ragContext
│   └── tests/ (26 tests)
└── frontend/
    └── src/
        ├── pages/ Login, Register, HouseSetup, Dashboard, History
        ├── components/ ExpenseForm, ExpenseList, BalanceSummary, SettleUpModal, HouseInviteCard, ChatWidget
        ├── api/ axiosClient, chatbotApi
        ├── context/ AuthContext
        └── hooks/ useHouseBalances, useChatbot
```
