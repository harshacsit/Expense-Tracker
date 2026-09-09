# Master Prompt — SplitStay (Shared Roommate Expense Tracker)

Use this single prompt if you want to regenerate, extend, or explain this project to any AI assistant, in one shot.

---

Build a full BRD (Business Requirements Document) and TDD (Technical Design Document) for a project called **SplitStay** — a shared roommate expense-splitting tracker, with the following scope:

**Problem Statement:**
A standard expense tracker is single-user. Roommates need a shared version: multiple users belong to one "house" account, any member can log an expense on behalf of the group, and the system must automatically split it and track who owes whom — replacing manual tracking via spreadsheets or chat messages.

**Core Solution:**
- Group users under a shared "house" account (many-to-many via a membership table).
- Any member can log an expense, recording who actually paid.
- Each expense is split automatically — equally or by custom shares — among members.
- The system nets out what each member paid vs. owes to produce real-time "who owes whom" balances.
- Members can record settlements (payments to each other) that update balances.

**BRD should include:**
- Objective, Problem Statement, Solution Overview
- Functional requirements: auth, house creation/joining via invite code, shared expense logging, equal/custom split configuration, real-time balance calculation, settlement recording, dashboard summary, transaction history, and an AI chatbot assistant (natural-language expense entry, balance queries, spending insights, settlement suggestions)
- Non-functional requirements: security (hashed passwords, house-scoped access), data integrity, performance, responsiveness, scalability, and a chatbot-reliability constraint (chatbot must only act through verified backend endpoints, never write to the DB directly)

**TDD should include:**
- Problem Statement + Solution Overview (technical framing)
- Tech stack: React (Vite) + Tailwind frontend, Node.js/Express backend, PostgreSQL + Prisma ORM, JWT auth, and an LLM (Claude/Gemini) with function calling for the chatbot
- REST API table covering auth, house CRUD/join, expenses, balances, settlements, and a `/chat` endpoint
- Prisma schema: `User`, `House`, `HouseMember` (join table), `Expense`, `ExpenseShare` (per-member owed amount per expense), `Settlement`
- Split calculation logic: equal split = amount / member count; custom split validated to sum to total; net balance = total paid − total owed, adjusted by settlements
- AI Chatbot Architecture section: message flow (controller → service → LLM function call → intent router → existing internal services), a function-calling schema (`addExpense`, `getBalances`, `suggestSettlements`), a debt-simplification algorithm (minimum-cash-flow settlement suggestions), and a RAG-based insights flow for open-ended spending questions
- Phased implementation plan: DB setup → backend/auth → balance engine → frontend → AI chatbot integration → deployment
- User stories organized into sprints, each in "As a [role], I want [goal] so that [benefit]" format with acceptance criteria — covering: DB setup, registration/login, house create/join, add expense with split, fetch expenses, calculate balances, record settlement, dashboard summary, QA/bug bash, and a dedicated chatbot sprint (natural-language expense entry, conversational balance queries, settlement suggestions, spending insights via RAG, chatbot guardrails)

**Also produce:**
- A project folder structure (`structure.txt`) reflecting this design — separate `backend/` (config, middleware, controllers, routes, services incl. a `chatbot/` subfolder, utils, tests) and `frontend/` (api, components incl. `ChatWidget.jsx`, pages, context, hooks) directories.
- A `.env.example` template listing only the environment variable names needed (database URI, one LLM API key, optional NextAuth/Google OAuth vars, email API key, internal service token) — no real values.
- A system prompt for the chatbot service itself, defining its scope, rules (always use functions not assumptions, confirm missing fields, never fabricate numbers, concise tone), and the functions it's allowed to call.

Output the BRD and TDD as two separate, well-formatted Markdown files.


