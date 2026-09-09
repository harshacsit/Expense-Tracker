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