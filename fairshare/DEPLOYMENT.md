# Complete Step-by-Step Deployment Guide: Render & Netlify

This guide provides clear, production-ready steps to deploy **FairShare** (Shared Roommate Expense Tracker) with the **Backend on Render** and the **Frontend on Netlify**.

---

## 📋 Prerequisites & Architecture Checklist

| Component | Platform | Primary Purpose | Required Config |
| :--- | :--- | :--- | :--- |
| **Backend API** | [Render](https://render.com) | Node.js Express API & Auth | Root Dir: `fairshare/backend` |
| **Frontend Web App** | [Netlify](https://netlify.com) | React 18 SPA (Vite) | Root Dir: `fairshare/frontend` |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Cloud NoSQL Storage | Free Cluster (M0) Connection URI |

---

## Step 1: Set Up MongoDB Atlas (Database)

If you already have a MongoDB connection string, you can skip to **Step 2**.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Click **Build a Database** -> Select the **FREE M0** shared tier.
3. Choose your preferred region and click **Create Cluster**.
4. In **Database Access**:
   - Create a database user (e.g. username: `fairshare_admin`, password: `your_secure_password`).
5. In **Network Access**:
   - Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render instances can connect.
6. Click **Database** -> **Connect** -> **Drivers**:
   - Copy the MongoDB connection URI string:
     ```text
     mongodb+srv://fairshare_admin:<password>@cluster0.xxx.mongodb.net/fairshare?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## Step 2: Deploy Backend on Render

1. Push your FairShare codebase to a **GitHub** repository.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> Select **Web Service**.
4. Connect your GitHub repository and select your project branch.
5. Fill in the deployment details:
   - **Name**: `fairshare-backend` (or any custom name)
   - **Region**: Select closest region to your users
   - **Root Directory**: `fairshare/backend` (or `Expense-Tracker/fairshare/backend` depending on your repo root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Scroll down to **Environment Variables** and add the following key-value pairs:

   | Key | Value / Example | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production environment flag |
   | `PORT` | `5000` | Render will automatically bind this port |
   | `MONGO_URI` | `mongodb+srv://fairshare_admin:<password>@cluster0.xxx.mongodb.net/fairshare` | MongoDB Atlas Connection URI |
   | `JWT_SECRET` | `super_secret_jwt_key_2026_fairshare` | Random secure string for signing tokens |
   | `FRONTEND_URL` | `https://your-app-name.netlify.app` | Your deployed Netlify frontend URL (without trailing slash) |
   | `GOOGLE_CLIENT_ID` | *(Optional)* | For Google OAuth |
   | `GOOGLE_CLIENT_SECRET` | *(Optional)* | For Google OAuth |
   | `GOOGLE_CALLBACK_URL` | `https://fairshare-backend.onrender.com/api/auth/google/callback` | Callback URL registered in Google Cloud Console |
   | `RESEND_API_KEY` | *(Optional)* | For password reset & balance reminder emails |

7. Click **Create Web Service**.
8. Wait for Render to build and deploy. Once live, Render will give you a backend URL (e.g. `https://fairshare-backend.onrender.com`).
9. Verify health check by visiting in your browser:
   ```text
   https://fairshare-backend.onrender.com/api/health
   ```
   You should see: `{"status":"OK","timestamp":"..."}`

---

## Step 3: Deploy Frontend on Netlify

1. Sign in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** -> Select **Import an existing project**.
3. Choose **GitHub** and select your repository.
4. Fill in the build configuration:
   - **Base directory**: `fairshare/frontend` (or `Expense-Tracker/fairshare/frontend`)
   - **Build command**: `npm run build`
   - **Publish directory**: `fairshare/frontend/dist`
5. Click **Environment Variables** -> **Add a variable**:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://fairshare-backend.onrender.com/api` | Points frontend to your live Render backend URL |

6. Click **Deploy Site**.
7. Netlify will build the Vite production bundle. Once published, click the generated site link (e.g., `https://fairshare-roommates.netlify.app`).

---

## Step 4: Final Environment Linking & Testing

1. **Update `FRONTEND_URL` in Render**:
   - Copy your live Netlify site URL (e.g. `https://fairshare-roommates.netlify.app`).
   - Go back to Render Dashboard -> **fairshare-backend** -> **Environment**.
   - Update `FRONTEND_URL` to your exact Netlify domain (`https://fairshare-roommates.netlify.app`).
   - Save changes (Render will automatically re-deploy).

2. **Verify Live Application**:
   - Open your Netlify site.
   - Register a new account or log in.
   - Create a room or join with invite code.
   - Log expenses with Equal, Exact, and Percentage splits.
   - Settle up payments and verify real-time balance calculations.
   - Refresh pages like `/dashboard`, `/expenses`, `/balances` directly to confirm single page app routing works seamlessly (via `_redirects`).

---

## 🛠️ Troubleshooting & Gotchas

> [!TIP]
> **Render Free Tier Cold Starts**: Render puts free services to sleep after 15 minutes of inactivity. The first request after a period of inactivity may take ~30 seconds to spin up.

> [!WARNING]
> **CORS Errors**: If you encounter CORS errors in browser console:
> - Ensure `FRONTEND_URL` on Render matches your Netlify domain exactly (no trailing slash `/`).
> - Ensure `VITE_API_URL` on Netlify points to `https://<render-app-name>.onrender.com/api`.

> [!NOTE]
> **Netlify SPA Direct Refresh 404**: Netlify serves SPA routes via `public/_redirects`. This file containing `/* /index.html 200` has been automatically added to `fairshare/frontend/public/_redirects`.
