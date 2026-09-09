# Business Requirements Document (BRD)

**Project Name:** expense -tracker

**Objective:** Provide roommates with a shared web-based platform to log group expenses under a single "house" account, automatically calculate each person's fair share, and show who owes whom so bills can be settled easily.

## Problem Statement

A standard expense tracker is single-user — an individual logs and monitors only their own spending. This does not work for roommates who share recurring costs (rent, groceries, utilities), since expenses are paid by one person on behalf of the group and must be divided fairly among all members. Without a shared system, roommates rely on manual tracking (spreadsheets, chat messages) to remember who paid for what and who still owes whom, which is error-prone and hard to reconcile over time.

## Solution Overview

The application introduces a shared "house" account that multiple users can belong to:

1. **Grouping:** Roommates are linked together under one house account, so expenses are logged against the group, not an individual.
2. **Shared Expense Logging:** Any member can add an expense on behalf of the house, recording who actually paid.
3. **Automatic Splitting:** Each expense is divided among members automatically — equally, or by custom shares.
4. **Balance Netting:** The system nets out what each member paid vs. what they owe across all expenses, producing a clear "who owes whom, how much" view.
5. **Settlement:** Members can record payments made to each other, which updates the running balance.

This turns manual, error-prone expense splitting into an automated, always-up-to-date shared ledger.

## Functional Requirements

1. **User Authentication:** Users must be able to sign up and log in securely.
2. **House/Group Creation:** A user must be able to create a "house" account and invite roommates to join it (via invite code or link).
3. **Shared Expense Logging:** Any member of a house can add an expense with amount, date, category (Rent, Groceries, Utilities, etc.), and description.
4. **Split Configuration:** When adding an expense, the user must be able to choose how it's split — equally among all members, or by custom amounts/percentages per member.
5. **Balance Calculation:** The system must calculate and display real-time balances — how much each member owes or is owed within the house.
6. **Settlement:** Members must be able to record a "settle up" payment (e.g., "Alex paid Sam ₹500") to clear balances.
7. **Dashboard:** Members must see a summary of total house spending for the current month and their personal share.
8. **History:** A list view of past transactions, filterable by member or category, with the ability to edit/delete entries added by the user.
9. **AI Chatbot Assistant:** Members must be able to interact with an AI chatbot to:
   - Add expenses using natural language (e.g., "I paid ₹800 for groceries, split equally").
   - Ask balance-related questions (e.g., "How much does Sam owe me?").
   - Ask for spending insights (e.g., "Did we spend more on food this month?").
   - Receive suggestions for the minimum number of payments needed to settle all balances in the house.

## Non-Functional Requirements

- **Security:** Passwords must be hashed (Bcrypt); users can only access houses they belong to.
- **Data Integrity:** Balance calculations must remain accurate even if expenses are edited or deleted after creation.
- **Performance:** Dashboard and balance data must load in under 1 second.
- **Responsiveness:** Must be fully functional on both mobile and desktop browsers.
- **Scalability:** A house should support at least 10 members without performance degradation.
- **Chatbot Reliability:** The chatbot must only perform actions (e.g., adding an expense) through verified backend endpoints, never by writing to the database directly, so all normal validation rules still apply.

 example for these :
Here are real-world apps that solve the exact same problem as SplitStay — useful references for your report or to compare features against:

Direct Real-World Equivalents

1. Splitwise (most famous example)

The gold standard for shared expense splitting. Groups (equivalent to your "house"), equal/custom/percentage splits, running balances, "simplify debts" feature (exactly like your debtSimplifier.js), and settlement recording.
What SplitStay borrows conceptually: the whole Expense → Split → Balance model.

2. Tricount

European equivalent of Splitwise, popular for roommates and trip expenses. Strong on multi-currency support and a simple "balance summary" view per person.

3. Settle Up

Similar to Splitwise but with more customizable split types (shares, percentages, exact amounts) and group-based permissions — close to your HouseMember + ExpenseShare design.

4. Venmo / Cash App (group payments feature)

Not expense-splitting-first, but widely used informally by roommates to actually settle balances after calculating them elsewhere — this is the real-world analog to your Settlement model, minus the automatic calculation.
Where SplitStay Differentiates (your AI chatbot angle)

None of the big three (Splitwise, Tricount, Settle Up) have a conversational AI assistant for adding expenses or asking balance questions in natural language — they're all form-based. That's a genuinely novel angle you can highlight in your report:

Feature	Splitwise	Tricount	Settle Up	SplitStay
Shared house/group	✅	✅	✅	✅
Equal/custom splits	✅	✅	✅	✅
Debt simplification	✅	❌	✅	✅
Natural-language expense entry via chatbot	❌	❌	❌	✅
RAG-based spending insights	❌	❌	❌	✅

Want me to add this comparison table (as a "Competitive Analysis" section) into the BRD, since it strengthens the case for why the project is worth building?

like for you these much expenses  for give me the example

Here's a concrete worked example — 3 roommates sharing a house for a month:

Sample Scenario: "Sunrise Apartments" House (3 members: Anith, Ravi, Priya)
Expenses Logged
#	Paid By	Amount	Category	Split Type
1	Anith	₹3,000	Rent (his share, paid to landlord on behalf of group... let's keep it simple)	—
2	Ravi	₹1,200	Groceries	Equal
3	Priya	₹900	Electricity Bill	Equal
4	Anith	₹600	Internet	Equal
5	Ravi	₹450	Cooking Gas	Custom (Ravi ₹150, Priya ₹150, Anith ₹150 — same as equal here, but shows the field)

(Let's simplify and treat all 4 shared expenses — #2 to #5 — as equal splits among 3 people, ignoring #1 rent for this example.)

Split Calculation (equal, 3 people)
Expense	Amount	Each Person's Share
Groceries	₹1,200	₹400
Electricity	₹900	₹300
Internet	₹600	₹200
Cooking Gas	₹450	₹150
Total shared	₹3,150	₹1,050 each
Balance Calculation
Person	Total Paid	Total Owed (₹1,050 each)	Net Balance
Ravi	₹1,650 (₹1,200 + ₹450)	₹1,050	+₹600 (is owed)
Priya	₹900	₹1,050	−₹150 (owes)
Anith	₹600	₹1,050	−₹450 (owes)
Settlement Suggestion (debt simplification)

Instead of 2 separate people paying Ravi:

Anith pays Ravi ₹450
Priya pays Ravi ₹150

→ 2 transactions, fully settles the house. (This is what debtSimplifier.js would output.)

What This Looks Like via the Chatbot
Anith: "I paid 600 for internet, split equally"
Bot:   "Got it — ₹600 for internet, split equally between you 3 (₹200 each). Added ✅"

Priya: "How much do I owe?"
Bot:   "You owe ₹150 total in this house — mainly to Ravi."

Ravi: "How should we settle up?"
Bot:   "Simplest way: Anith pays you ₹450, and Priya pays you ₹150. That clears everyone."

Want me to add this worked example as a "Sample Walkthrough" section in the BRD or TDD, so it's easier to demo/explain in your viva?