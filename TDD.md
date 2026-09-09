# Technical Design Document (TDD)

**Project Name:** SplitStay

## Problem Statement

A standard expense tracker is single-user. This variation requires *shared* budgets: multiple roommates belong to one "house" account, and any member can add an expense that must be split fairly among all members — with the system tracking who owes whom.

## Solution Overview

- **Grouping:** A `House` model links multiple `User`s via a `HouseMember` join table.
- **Shared Logging:** Expenses are tied to the house (not a single user), with a record of who paid.
- **Automatic Splitting:** Each expense generates `ExpenseShare` rows — one per member — capturing what they owe (equal or custom split).
- **Balance Netting:** A balance service sums what each member paid minus what they owe, across all expenses, to compute real-time "who owes whom" balances.
- **Settlement:** A `Settlement` model lets members record payments to each other, adjusting balances accordingly.

## A. Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT (JSON Web Tokens)
- **AI Chatbot:** Claude/GPT API with function calling, used as a natural-language layer over the existing REST API

## B. API Design

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new user account. |
| POST | `/api/auth/login` | Authenticate and return JWT. |
| POST | `/api/houses` | Create a new house/group. |
| POST | `/api/houses/:id/join` | Join a house via invite code. |
| GET | `/api/houses/:id/members` | List all members of a house. |
| GET | `/api/houses/:id/expenses` | Fetch all expenses for a house. |
| POST | `/api/houses/:id/expenses` | Add a new expense with split details. |
| DELETE | `/api/expenses/:id` | Remove a specific expense entry. |
| GET | `/api/houses/:id/balances` | Get calculated balances for every member. |
| POST | `/api/houses/:id/settlements` | Record a payment between two members. |
| POST | `/api/houses/:id/chat` | Send a natural-language message to the AI chatbot and receive a response/action result. |

## C. Database Schema (Prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  memberships HouseMember[]
}

model House {
  id         Int           @id @default(autoincrement())
  name       String
  inviteCode String        @unique
  members    HouseMember[]
  expenses   Expense[]
}

model HouseMember {
  id      Int    @id @default(autoincrement())
  userId  Int
  houseId Int
  user    User   @relation(fields: [userId], references: [id])
  house   House  @relation(fields: [houseId], references: [id])
  shares  ExpenseShare[]
}

model Expense {
  id          Int             @id @default(autoincrement())
  houseId     Int
  paidById    Int
  amount      Float
  category    String
  description String?
  date        DateTime        @default(now())
  house       House           @relation(fields: [houseId], references: [id])
  shares      ExpenseShare[]
}

model ExpenseShare {
  id             Int          @id @default(autoincrement())
  expenseId      Int
  houseMemberId  Int
  amountOwed     Float
  expense        Expense      @relation(fields: [expenseId], references: [id])
  member         HouseMember  @relation(fields: [houseMemberId], references: [id])
}

model Settlement {
  id         Int      @id @default(autoincrement())
  houseId    Int
  fromUserId Int
  toUserId   Int
  amount     Float
  date       DateTime @default(now())
}
```

## D. Split Calculation Logic

1. When an expense is added, the payer and split type (equal / custom) are recorded.
2. For **equal splits**, `amountOwed` per member = `amount / numberOfMembers`.
3. For **custom splits**, the frontend sends per-member amounts, validated so they sum to the total expense.
4. Each member's net balance in a house = (total they paid) − (total `amountOwed` across all `ExpenseShare` rows), adjusted by any recorded `Settlement`s.

## E. AI Chatbot Architecture

**Flow:** User message → `chatbot.controller.js` → `chatbot.service.js` (calls LLM with function-calling enabled) → LLM returns either a text answer or a function call → `intentRouter.js` maps the function call to an existing internal service (`splitCalculator`, `balanceEngine`, `settlement` creation) → result is returned to the user in natural language.

**Function-calling schema (exposed to the LLM):**

```json
[
  {
    "name": "addExpense",
    "description": "Add a new shared expense to the house",
    "parameters": {
      "amount": "number",
      "category": "string",
      "splitType": "equal | custom",
      "customShares": "object (optional)"
    }
  },
  {
    "name": "getBalances",
    "description": "Get who owes whom in the current house",
    "parameters": {}
  },
  {
    "name": "suggestSettlements",
    "description": "Get the minimum set of payments needed to settle all balances",
    "parameters": {}
  }
]
```

**Design principle:** The chatbot never writes to the database directly — it only ever calls the same internal services/endpoints a normal UI action would, so validation, authorization (`house.middleware.js`), and split/balance logic stay identical whether the user clicks a button or types a sentence.

**Insights (RAG):** For open-ended questions ("did we spend more on food this month?"), `ragContext.js` retrieves relevant expense records (via summarized embeddings or a simple filtered query) and passes them to the LLM as context before it answers.

**Debt simplification:** `debtSimplifier.js` implements a minimum-cash-flow algorithm — netting all balances, then greedily matching the largest debtor to the largest creditor — to minimize the number of settlement transactions suggested.

## F. Implementation Strategy

- **Phase 1 (Database):** Set up Postgres and define the Prisma schema (User, House, HouseMember, Expense, ExpenseShare, Settlement).
- **Phase 2 (Backend):** Implement auth routes, house creation/joining, and expense CRUD with split logic. Use JWT middleware to ensure only house members can access house data.
- **Phase 3 (Balance Engine):** Build the balance-calculation service that aggregates shares and settlements into a "who owes whom" summary.
- **Phase 4 (Frontend):** Build house creation/join flow, the expense form (with split-type toggle), the balances dashboard, and transaction history.
- **Phase 5 (AI Chatbot):** Integrate the LLM with function calling, build the intent router, and wire up the `ChatWidget.jsx` on the frontend.
- **Phase 6 (Deployment):** Deploy frontend on Vercel and backend on Render/Railway.

## F. User Stories

### Sprint 1: Infrastructure & Auth (The Foundation)
**Goal:** Get the environment ready and ensure users can securely enter the system.

**Story 1: Database Setup**
As a Developer, I want to initialize the database with User, House, HouseMember, Expense, ExpenseShare, and Settlement schemas so that we have a structured way to store shared expense data.
*Acceptance Criteria:* Prisma client is generated; migration applied to local Postgres instance.

**Story 2: User Registration**
As a User, I want to sign up with an email and password so that I can have a private account.
*Acceptance Criteria:* Password is encrypted (bcrypt); user record saved in DB; 201 status returned.

**Story 3: User Authentication**
As a User, I want to log in to my account so that I can access my houses and dashboard.
*Acceptance Criteria:* Valid login returns a JWT; unauthorized attempts return 401.

### Sprint 2: Houses & Shared Expenses (The Build)
**Goal:** Enable roommates to group together and log shared expenses.

**Story 4: Create a House**
As a User, I want to create a house and get a unique invite code so that I can invite my roommates.
*Acceptance Criteria:* House is created with the current user as first member; invite code is unique.

**Story 5: Join a House**
As a User, I want to join a house using an invite code so that I can start sharing expenses with my roommates.
*Acceptance Criteria:* Valid code adds the user as a HouseMember; invalid code returns an error.

**Story 6: API - Add Expense with Split**
As a User, I want to add an expense and choose how it's split (equal or custom) so that costs are shared fairly.
*Acceptance Criteria:* Equal split divides amount evenly across all members; custom split validates that shares sum to the total; ExpenseShare rows are created correctly.

**Story 7: API - Fetch House Expenses**
As a User, I want to see all expenses logged in my house so that I know what's been spent.
*Acceptance Criteria:* API returns only expenses belonging to houses the user is a member of.

### Sprint 3: Balances, Settlement & Dashboard (The Polish)
**Goal:** Show members what they owe, let them settle up, and provide insights.

**Story 8: API - Calculate Balances**
As a User, I want to see how much each roommate owes or is owed so that I know who to pay or collect from.
*Acceptance Criteria:* Balance calculation nets out amounts paid, amounts owed, and recorded settlements per member.

**Story 9: Record a Settlement**
As a User, I want to record a payment I made to a roommate so that our balance is updated.
*Acceptance Criteria:* Settlement is saved and immediately reflected in the balances endpoint.

**Story 10: Frontend - Dashboard Summary**
As a User, I want to see total house spending and my personal balance on a dashboard so that I can monitor shared finances at a glance.
*Acceptance Criteria:* Dashboard displays monthly total, my share, and a clear "you owe / you are owed" breakdown.

**Story 11: Quality Assurance & Bug Bash**
As a Team, we want to perform a code audit so that we can remove any "vibe-coded" technical debt.
*Acceptance Criteria:* All endpoints have at least one unit test; split and balance calculations are covered by tests; no console errors in the browser.

### Sprint 4: AI Chatbot Assistant (The Smart Layer)
**Goal:** Let users manage and query their shared expenses conversationally.

**Story 12: Natural-Language Expense Entry**
As a User, I want to tell the chatbot "I paid ₹800 for groceries, split equally" so that I don't have to fill out the expense form manually.
*Acceptance Criteria:* Message is parsed into amount/category/split type; `addExpense` function call is triggered; expense appears in history.

**Story 13: Conversational Balance Queries**
As a User, I want to ask "how much does Sam owe me?" so that I can quickly check balances without opening the dashboard.
*Acceptance Criteria:* Chatbot calls `getBalances` and returns an accurate, human-readable answer.

**Story 14: Settlement Suggestions**
As a User, I want the chatbot to tell me the fewest payments needed to settle all house balances so that settling up is simple.
*Acceptance Criteria:* `suggestSettlements` returns a minimized list of payments that fully resolves all balances.

**Story 15: Spending Insights (RAG)**
As a User, I want to ask "did we spend more on food this month than last?" so that I can understand our spending trends.
*Acceptance Criteria:* Relevant expense records are retrieved and passed as context to the LLM; answer is grounded in actual house data, not hallucinated.

**Story 16: Chatbot Guardrails**
As a Developer, I want the chatbot restricted to calling only approved internal functions so that it can never bypass validation or write to the database directly.
*Acceptance Criteria:* All chatbot actions route through existing controllers/middleware; unauthorized or malformed function calls are rejected.
