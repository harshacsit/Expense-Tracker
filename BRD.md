# Business Requirements Document (BRD)

**Project Name:** SplitStay (Shared Roommate Expense Tracker with Conversational AI)

**Objective:** Provide roommates with a shared web-based platform to log group expenses under a single "house" account, automatically calculate each person's fair share, and show who owes whom so bills can be settled easily and transparently.

---

## 1. Problem Statement

A standard personal expense tracker is single-user — an individual logs and monitors only their own spending. This model fails for roommates who share recurring costs (rent, groceries, electricity, internet, cooking gas), where expenses are paid by one person on behalf of the group and must be divided fairly among all members. 

Without a shared ledger, roommates rely on fragmented, manual tracking (spreadsheets, chat notes, or memory) to track who paid for what and who still owes whom. This leads to mathematical errors, uncomfortable debt reminders, floating-point rounding discrepancies, and friction when reconciling balances over time.

---

## 2. Solution Overview

SplitStay introduces a shared "house" account model designed specifically for communal living:

1. **Grouping:** Roommates are linked together under one house account via invite codes, ensuring all expenses are tracked against the collective group rather than an individual.
2. **Shared Expense Logging:** Any member can add an expense on behalf of the house, recording who paid and the expense category.
3. **Automatic Splitting:** Each expense is divided among members automatically — equally, by exact shares, or by percentages, with zero floating-point drift.
4. **Balance Netting:** The system nets out what each member paid vs. what they owe across all house expenses, producing a real-time "who owes whom, how much" view.
5. **Debt Simplification:** A minimum-cash-flow algorithm calculates the fewest possible payments needed to settle all house debts.
6. **Settlement:** Members can record payments made to each other, instantly updating the running balances.
7. **Conversational AI Assistant:** An embedded AI chatbot allows roommates to log expenses, check balances, and receive settlement plans via natural language.

---

## 3. Why AI, Not Just CRUD (The Core Differentiator)

Traditional expense trackers like Splitwise or Tricount rely exclusively on manual, multi-step CRUD forms. Users must manually select a payer, choose split formulas, input numbers across fields, and navigate sub-menus. For busy roommates, this high-friction entry pattern frequently leads to forgotten receipts and delayed bookkeeping.

SplitStay fundamentally transforms expense tracking by treating Conversational AI as a primary interactive interface rather than a cosmetic, bolt-on novelty:

1. **Deterministic Function-Calling for Structured Actions:**
   - Rather than using AI to hallucinate or manipulate numbers, SplitStay utilizes Google Gemini's native tool function-calling (`add_expense`, `get_balances`, `get_settlements`).
   - The LLM's role is strictly limited to extracting structured parameters (amount, category, split type, payer) from colloquial human sentences (e.g. *"I paid ₹600 for WiFi, split equally"*).
   - The resulting parameters are executed against deterministic internal backend business logic and database constraints. The AI **never writes directly to the database** and never fabricates financial balances.

2. **RAG-Powered Historical Spending Insights:**
   - Standard CRUD dashboards only answer predefined queries. Through Retrieval-Augmented Generation (RAG), SplitStay builds dynamic contextual summaries of actual house transactions.
   - Roommates can ask open-ended questions like *"How much did we spend on utilities last month compared to groceries?"* or *"Who covered dinner most frequently this semester?"* and receive instantaneous, contextual answers grounded directly in verified house records.

3. **Applied AI in Real Workflows:**
   - Integrated multimodal OCR receipt scanning auto-populates expense forms directly from photographed bills.
   - This hybrid design couples the convenience of conversational natural language with the mathematical rigor of a double-entry ledger.

---

## 4. Functional Requirements

1. **User Authentication & Management:**
   - Secure email/password registration and login with encrypted credentials.
   - Optional Google OAuth 2.0 social sign-in.
   - Password recovery via secure email reset links.
2. **House/Group Management:**
   - Create a house and generate a unique alphanumeric invite code.
   - Join an existing house using an invite code.
   - Switch between multiple houses from the top navigation.
3. **Shared Expense Logging:**
   - Record expenses with amount, date, category (Rent, Groceries, Utilities, Internet, Cooking Gas, Entertainment, Other), and description.
   - Support one-click receipt photo scanning with automatic optical parsing.
4. **Split Configuration & Precision:**
   - Support **Equal**, **Exact Amount**, and **Percentage** splits across all house members.
   - Enforce residual fraction distribution so the sum of all individual shares exactly equals the expense total with zero penny/paise loss.
5. **Real-Time Balance Calculation:**
   - Automatically compute each member's net balance: `(total paid) - (total owed) + (settlements given) - (settlements received)`.
   - Display who owes money (debtors) and who is owed money (creditors).
6. **Settlement & Debt Simplification:**
   - Suggest the minimum number of transactions to clear all debts ($N - 1$ guarantee).
   - Record "settle up" payments between members to zero out balances.
7. **Dashboard & History:**
   - Monthly total spending breakdown and personal share summary.
   - Searchable, filterable transaction history with edit and delete capabilities.
   - Export records to CSV spreadsheet or styled printable PDF statements.
8. **AI Chatbot Assistant:**
   - Natural language expense entry (e.g., *"I paid ₹1,200 for groceries, split equally"*).
   - Conversational balance queries (e.g., *"How much do I owe?", "Who paid for internet?"*).
   - Spending insights and budget summaries via Retrieval-Augmented Generation (RAG).
   - On-demand debt simplification suggestions.

---

## 5. UI/UX Design, Accessibility & PWA

SplitStay features a modern, user-centric interface built on contemporary design principles:

- **Glassmorphism Design System:** Tailored dark theme with semi-transparent frosted-glass containers (`backdrop-blur-xl`), subtle borders (`rgba(255, 255, 255, 0.08)`), and purple-indigo gradient accents.
- **Animated WebGL Background Visuals:** Hardware-accelerated dynamic shaders (such as the interactive glowing `Orb`, `Galaxy` starfield, and `Lightfall` streams from React Bits) providing a fluid aesthetic on authentication screens (Login, Register, Forgot Password, Reset Password).
- **Comprehensive Dashboard:**
  - **Summary Cards:** Immediate display of Net Balance (*You are owed* vs *You owe*), Total Monthly House Spend, and Active Members.
  - **Actionable Settlement Cards:** One-click "Settle Up" modal pre-filled with the creditor, debtor, and exact amount.
- **Responsive Split Entry Tabs:** Dedicated tabs inside the expense modal for switching seamlessly between **Equal Split**, **Exact Amount**, and **Percentage Split**.
- **Floating AI Chat Widget:** Persistent bottom-right chat bubble (`ChatWidget.jsx`) equipped with quick-prompt suggestion chips (e.g., *"Add expense"*, *"Check balance"*, *"Settle up"*, *"Monthly summary"*) for rapid conversational interaction.
- **Mobile-First Responsive Design:** Fluid layouts optimized for touch interactions on smartphones and tablets, scaling cleanly to high-resolution desktop viewports.
- **Progressive Web App (PWA) Capabilities:**
  - Installable application shell with standalone manifest and home screen icon support.
  - Offline-first caching of essential static assets and recently fetched house balances for offline reference.
- **Accessibility & Inclusive Design:**
  - Full keyboard navigability (Tab, Enter, Escape shortcuts across modals and forms).
  - Explicit ARIA labels (`aria-label`, `aria-hidden`, role attributes) on all interactive icons and buttons.
  - WCAG 2.1 AA compliant color contrast ratios across dark mode text, badges, and state indicators.

---

## 6. Non-Functional Requirements

- **Security & Authorization:**
  - **Password Hashing:** Passwords encrypted using `bcryptjs` with salt rounds = 10.
  - **Token Authentication:** Stateless JWT authentication with signed payloads and strict expiration policies (7-day validity).
  - **House-Membership Validation:** All financial endpoints guarded by `house.middleware.js` to ensure users can only view or modify data for houses they belong to.
  - **Repository & Secret Hygiene:** Strict `.gitignore` policy isolating environment secrets (`.env`, `*.env`), dependencies (`node_modules/`), build outputs (`dist/`), and runtime log files.
  - **Server Reliability:** Server binds to `0.0.0.0` with graceful database connection timeouts (5 seconds) and port conflict listeners (`EADDRINUSE`) to prevent silent startup failures.
- **Data Integrity:** Balance calculations automatically recalculate when an expense or settlement is created, edited, or deleted.
- **Performance:** Dashboard metrics and balance queries execute and render in under 1 second.
- **Cross-Platform Responsiveness:** Fully responsive layout tested on modern mobile browsers, tablets, and desktop viewports.
- **Chatbot Guardrails:** The chatbot executes deterministic internal tool functions and cannot bypass backend validation or write arbitrary data to the database.

---

## 7. Data & Privacy

User privacy and financial data integrity are central to the SplitStay trust model:

1. **Personal Data Export:**
   - Users retain complete ownership of their data. Any house member can export full historical records, including expense details, per-person share breakdowns, and settlement histories, into standardized CSV spreadsheets or printable PDF statements at any time.
2. **Account Deletion & Right to Be Forgotten:**
   - Users can initiate account deletion requests. Upon confirmation, user identifiers and personal credentials are permanently purged from the database, while anonymized transaction records remain to preserve the mathematical continuity of shared house ledgers.
3. **Audit Trail & Attribution:**
   - Every financial action (expense creation, edits, deletions, and settlements) logs an immutable audit trail capturing `createdAt`, `updatedAt`, `paidById`, and `createdBy` metadata.
   - House members can inspect precisely who recorded or adjusted each expense, eliminating ambiguous adjustments and dispute friction.
4. **Settlement-Confirmation Trust Model:**
   - When a peer-to-peer payment is recorded, both the payer and payee are clearly documented, providing transparent audit confirmation before balances are zeroed.

---

## 8. Competitive Analysis

| Feature | Splitwise | Tricount | Settle Up | SplitStay |
|---|---|---|---|---|
| **Shared House / Group Budgets** | ✅ | ✅ | ✅ | ✅ |
| **Equal & Custom Splits** | ✅ | ✅ | ✅ | ✅ |
| **Debt Simplification Algorithm** | ✅ | ❌ | ✅ | ✅ |
| **Natural-Language Expense Entry via Chatbot** | ❌ | ❌ | ❌ | ✅ |
| **RAG-Based Conversational Spending Insights** | ❌ | ❌ | ❌ | ✅ |
| **Interactive WebGL Visuals & Glassmorphism** | ❌ | ❌ | ❌ | ✅ |
| **Receipt OCR Auto-Extraction** | Paid | ❌ | ❌ | ✅ |

---

## 9. Sample Scenario Walkthrough

**Scenario:** "Sunrise Apartments" House (3 members: Anith, Ravi, Priya)

### Shared Expenses Logged:
1. **Ravi** paid ₹1,200 for Groceries (Split equally among 3 = ₹400 each).
2. **Priya** paid ₹900 for Electricity Bill (Split equally among 3 = ₹300 each).
3. **Anith** paid ₹600 for Internet (Split equally among 3 = ₹200 each).
4. **Ravi** paid ₹450 for Cooking Gas (Split equally among 3 = ₹150 each).

- **Total Shared Spend:** ₹3,150
- **Fair Share per Person:** ₹1,050

### Balance Breakdown:
- **Ravi:** Paid ₹1,650 − Owed ₹1,050 = **+₹600** (Net Creditor)
- **Priya:** Paid ₹900 − Owed ₹1,050 = **−₹150** (Net Debtor)
- **Anith:** Paid ₹600 − Owed ₹1,050 = **−₹450** (Net Debtor)

### Simplified Debt Settlement:
Instead of multiple circular payments, the minimum cash flow algorithm resolves all balances in **2 transactions**:
1. **Anith pays Ravi ₹450**
2. **Priya pays Ravi ₹150**
*(All house debts cleared to ₹0.00)*

---

## 10. Future Enhancements & Production Roadmap

The following post-MVP features are identified for future product iterations:

1. **Multi-Currency Support:**
   - Configurable per-house default currency selector (`INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`).
   - Real-time conversion rates for international or vacation travel houses.
2. **Receipt Scanning via OCR / Vision AI:**
   - Upload paper receipts or digital bills directly in the chat widget or expense modal.
   - Use Google Gemini Vision to automatically extract merchant, date, total amount, and line-item splits.
3. **Automated Balance Reminders & Notifications:**
   - Scheduled automated email reminders via Resend before month-end rent and recurring utilities are due.
   - Push notifications for new expenses and settlement confirmations.
4. **Export & Reporting:**
   - Generate and download monthly CSV and branded PDF expense statements for tax records or landlord reconciliations.