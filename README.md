# FairShare 🏠

> **Smart Shared Expense Tracker, AI-Powered Debt Simplifier & Financial Assistant for Roommates**

[![CI Pipeline](https://github.com/harshacsit/Expense-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/harshacsit/Expense-Tracker/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.x-blue.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Environment Variables Setup](#-environment-variables-setup)
- [Local Development Setup](#-local-development-setup)
- [Docker & Containerized Deployment](#-docker--containerized-deployment)
- [API Documentation & Postman Collection](#-api-documentation--postman-collection)
- [Testing & CI/CD Pipeline](#-testing--cicd-pipeline)
- [Real-World Worked Scenario](#-real-world-worked-scenario)
- [Contributing & License](#-contributing--license)

---

## 📖 Overview

Sharing living expenses among roommates, housemates, or travel groups often leads to confusion, manual calculation errors, and awkward payment requests. **FairShare** eliminates this friction by offering an intelligent, automated financial platform designed for shared households.

Unlike traditional expense-splitting apps that rely solely on manual form inputs and rigid interfaces, **FairShare** introduces:
1. **Debt Simplification Algorithm**: Automatically nets multi-person debts to minimize the total number of transactions needed to settle up.
2. **Conversational AI Assistant**: Allows users to log expenses, check balances, and request settlement instructions in plain natural language (e.g., *"I paid $60 for groceries split equally"*).
3. **Cross-Laptop Network Access**: Dynamic CORS and network origin handling that enables roommates connected to the same local Wi-Fi network to access the server seamlessly.

---

## ✨ Key Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| 🔐 **Security & Auth** | JWT Authentication | Secure user registration, password hashing (bcrypt), JWT authorization, and email password reset workflows. |
| 🏠 **House Management** | House Groups & Invites | Create house groups, invite roommates via unique 6-character codes, and manage member roles. |
| 💸 **Flexible Splitting** | Equal & Custom Splits | Split shared bills equally across all members or assign exact custom amounts per person. |
| 🧮 **Smart Netting** | Debt Simplification Engine | Graph-based balance engine that reduces complex cross-member debts into minimum transaction paths. |
| 🤖 **AI Assistant** | Natural Language & RAG Chat | Built-in conversational AI with LLM function calling to parse natural language expense logs and balance queries. |
| 🧾 **Receipt OCR** | Automated Receipt Scanner | Extract itemized totals and billing information directly from uploaded receipt images. |
| 📱 **Modern UI & PWA** | PWA & Custom Visual Themes | Responsive mobile-first React UI with Progressive Web App support, background installation, and ambient animations. |
| 🌐 **Network Ready** | Cross-Laptop Access | Dynamic origin reflection allowing multiple devices on the same local network to connect effortlessly. |

---

## 🛠️ Tech Stack

### **Backend Core**
- **Runtime**: Node.js (`v20.x`)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **API Documentation**: Swagger UI & OpenAPI 3.0 specification (`/api-docs`)

### **Frontend Core**
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Vanilla CSS Animations
- **Routing**: React Router v6
- **HTTP Client**: Axios with dynamic base URL and token interceptors
- **Icons**: Lucide React

### **DevOps & AI Capabilities**
- **AI Integration**: LLM Function Calling & RAG Context Router (Gemini / Claude APIs)
- **Containerization**: Docker & Docker Compose
- **Web Server / Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)
- **Testing**: Jest & Supertest

---

## 🏗 System Architecture

```
                                  +---------------------------------------+
                                  |            Client Devices             |
                                  |  (Desktop Browser / PWA Mobile App)   |
                                  +-------------------+-------------------+
                                                      |
                                           HTTP / WebSocket Requests
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |         Nginx / Vite Web Server       |
                                  |             (Frontend App)            |
                                  +-------------------+-------------------+
                                                      |
                                            REST API Calls (/api/*)
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |         Node.js / Express API         |
                                  |            (Backend Engine)           |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +----------------------+
                     |                                                                 |
                     v                                                                 v
+--------------------+--------------------+                          +-----------------+-----------------+
|               MongoDB                   |                          |         AI Service / LLM API        |
|  (Users, Houses, Expenses, Settlements) |                          |    (Function Calling & RAG)    |
+-----------------------------------------+                          +-----------------------------------+
```

---

## 📁 Repository Structure

```
Expense-Tracker/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI pipeline configuration
├── docker-compose.yml                 # Multi-container Docker deployment specification
├── FairShare_API.postman_collection.json # Complete API collection for testing
├── README.md                          # Project documentation (Single Source of Truth)
└── fairshare/
    ├── backend/                       # Express.js REST API Backend
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── package.json
    │   ├── src/
    │   │   ├── app.js                 # Express app setup & dynamic CORS configuration
    │   │   ├── server.js              # Server entry point & DB connection listener
    │   │   ├── config/                # Database and Swagger OpenAPI specs
    │   │   ├── controllers/           # Auth, House, Expense, Settlement, Balance & Chat controllers
    │   │   ├── middleware/            # JWT authentication & house membership checks
    │   │   ├── models/                # Mongoose schemas (User, House, Expense, Settlement, etc.)
    │   │   ├── routes/                # Express API routes
    │   │   ├── services/              # Balance engine, debt simplifier, email, OCR, & chatbot RAG
    │   │   └── utils/                 # Helper utilities (invite code generators)
    │   └── tests/                     # Jest unit & integration test suites
    └── frontend/                      # React 18 + Vite Frontend Application
        ├── Dockerfile
        ├── nginx.conf                 # Production Nginx reverse proxy configuration
        ├── package.json
        ├── index.html                 # PWA HTML entry point
        ├── public/                    # PWA web manifest, icons & service worker (`sw.js`)
        └── src/
            ├── App.jsx                # React app router & main layout wrapper
            ├── main.jsx               # React DOM root initialization
            ├── api/                   # Axios API client & Chatbot API bindings
            ├── components/            # Expense forms, balance cards, chat widget, modals
            ├── context/               # Global Authentication State Context
            ├── hooks/                 # Custom React hooks (useHouseBalances, useChatbot)
            └── pages/                 # Views (Login, Register, Dashboard, HouseSetup, History)
```

---

## 🔑 Environment Variables Setup

### 1. Backend Environment Variables (`fairshare/backend/.env`)

Create a `.env` file inside `fairshare/backend/`:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/fairshare

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Frontend CORS URL
CLIENT_URL=http://localhost:3000

# Optional: AI Assistant Integration (Gemini / Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Email Service (Password Resets & Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

### 2. Frontend Environment Variables (`fairshare/frontend/.env`)

Create a `.env` file inside `fairshare/frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Local Development Setup

Follow these steps to run the application locally without Docker:

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or a MongoDB Atlas connection string

---

### Step 1: Install & Start Backend

```bash
# Navigate to the backend directory
cd fairshare/backend

# Install node dependencies
npm install

# Start backend server in development mode (Nodemon)
npm run dev
```

The REST API backend will start at: `http://localhost:5000`  
Swagger API documentation will be accessible at: `http://localhost:5000/api-docs`

---

### Step 2: Install & Start Frontend

Open a new terminal window:

```bash
# Navigate to the frontend directory
cd fairshare/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend web app will open at: `http://localhost:3000`

---

## 🐳 Docker & Containerized Deployment

You can launch the entire stack (MongoDB + Express Backend + React Nginx Frontend) in containerized mode with a single command using **Docker Compose**:

### Prerequisites
- **Docker Desktop** installed and running on your machine.

### Launch Containers

From the project root directory (`Expense-Tracker/`), run:

```bash
# Build images and start all containers in detached mode
docker-compose up --build -d
```

This will automatically instantiate:
- **MongoDB Container**: Running on port `27017`
- **Backend Container**: Express API running on port `5000`
- **Frontend Container**: Production Nginx container serving React SPA on port `3000`

### Check Container Status

```bash
docker-compose ps
```

### Stop Containers

```bash
docker-compose down
```

---

## 📖 API Documentation & Postman Collection

### Interactive Swagger UI
FairShare comes pre-configured with interactive OpenAPI documentation. Start the backend server and navigate to:
👉 **`http://localhost:5000/api-docs`**

### Postman Collection
A complete Postman collection is included in the project root:
📄 **`FairShare_API.postman_collection.json`**

Import this file into Postman to immediately access pre-formatted requests for:
- Authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- House Management (`/api/houses`, `/api/houses/join`, `/api/houses/:id/members`)
- Expenses & Splitting (`/api/houses/:id/expenses`, `/api/expenses/:id`)
- Balances & Debt Simplification (`/api/houses/:id/balances`, `/api/houses/:id/settlements`)
- AI Chatbot (`/api/houses/:id/chat`)

---

## 🧪 Testing & CI/CD Pipeline

### Running Tests Locally

The project includes an extensive test suite built with **Jest** and **Supertest** covering split calculations, balance netting, edge cases, and chatbot function guardrails.

```bash
cd fairshare/backend
npm test
```

### CI/CD Workflow (GitHub Actions)

Every commit pushed to `main` triggers automated checks in `.github/workflows/ci.yml`:
1. **Backend Unit Tests**: Executes all unit & integration tests on Node.js 20.
2. **Frontend Build Check**: Ensures the Vite React production bundle builds cleanly without syntax or bundling errors.
3. **Docker Build Check**: Verifies that both frontend and backend Dockerfiles build successfully.

---

## 💡 Real-World Worked Scenario

Here is an example scenario illustrating how FairShare simplifies roommate expenses:

### **Scenario**: "Sunrise Apartments" (3 Members: Anith, Ravi, Priya)

| # | Paid By | Amount | Category | Split Type | Each Person's Share |
|---|---|---|---|---|---|
| 1 | Ravi | ₹1,200 | Groceries | Equal (3 ways) | ₹400 |
| 2 | Priya | ₹900 | Electricity Bill | Equal (3 ways) | ₹300 |
| 3 | Anith | ₹600 | Internet Bill | Equal (3 ways) | ₹200 |
| 4 | Ravi | ₹450 | Cooking Gas | Equal (3 ways) | ₹150 |

#### **1. Individual Totals & Share Calculations**
- **Total Shared Expenses**: ₹3,150
- **Equal Cost Share per Person**: ₹1,050

#### **2. Net Balances**
- **Ravi**: Paid ₹1,650 — Fair Share ₹1,050 = **+₹600 (Is owed)**
- **Priya**: Paid ₹900 — Fair Share ₹1,050 = **−₹150 (Owes)**
- **Anith**: Paid ₹600 — Fair Share ₹1,050 = **−₹450 (Owes)**

#### **3. Optimized Debt Settlement Plan (`debtSimplifier.js`)**
Without debt simplification, multiple circular payments occur. FairShare's graph netting algorithm reduces this to **just 2 simple transactions**:
1. 💵 **Anith pays Ravi ₹450**
2. 💵 **Priya pays Ravi ₹150**

Everyone is fully settled!

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!

### License
This project is licensed under the **MIT License**.