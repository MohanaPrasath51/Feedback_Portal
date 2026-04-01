# Deployment Guide: Feedback Portal

This guide provides step-by-step instructions for deploying the **Feedback Portal** (Backend + Frontend) to production environments.

## 1. Database & External Services

### A. MongoDB Atlas (Database)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and save the password.
3. In "Network Access", allow access from `0.0.0.0/0` (standard for cloud hostings like Render).
4. Copy the **Connection String** (URI) for Node.js. It should look like:
   `mongodb+srv://<username>:<password>@cluster.xxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`

### B. Firebase Setup (Auth & Notifications)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. **Admin SDK**: Go to Project Settings > Service Accounts. Click **Generate New Private Key**. 
4. **Important**: Instead of uploading this file to production, we will use individual environment variables for security.

---

## 2. Backend Deployment (Render.com)

**Render** is recommended for the backend as it supports persistent Socket.io connections.

1. **Connect Repository**: Create a new "Web Service" on [Render](https://render.com/) and connect your GitHub repository.
2. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (This will use the clustering logic in `server.js`)
3. **Environment Variables**: Add the following in the Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Render will override this, but it's good practice)
   - `MONGO_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (A long, random string)
   - `FIREBASE_PROJECT_ID`: (From your Firebase JSON)
   - `FIREBASE_CLIENT_EMAIL`: (From your Firebase JSON)
   - `FIREBASE_PRIVATE_KEY`: (From your Firebase JSON - use the full string including `\n`)
   - `ALLOWED_ORIGINS`: `https://your-app.vercel.app` (Your Frontend URL)

---

## 3. Frontend Deployment (Vercel / Netlify)

1. **Connect Repository**: Create a new Project on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: `https://feedback-backend.onrender.com` (Your Backend URL from Render)
   - `VITE_FIREBASE_API_KEY`: (From your Firebase Config)
   - `VITE_FIREBASE_AUTH_DOMAIN`: (From your Firebase Config)
   - `VITE_FIREBASE_PROJECT_ID`: (From your Firebase Config)
   - `VITE_FIREBASE_STORAGE_BUCKET`: (From your Firebase Config)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: (From your Firebase Config)
   - `VITE_FIREBASE_APP_ID`: (From your Firebase Config)

---

## 4. Post-Deployment Checklist

### CORS Configuration
Ensure the backend's `ALLOWED_ORIGINS` includes the exact URL of your deployed frontend. If you have multiple frontends (e.g., local and prod), separate them with commas:
`https://your-feedback-portal.vercel.app,http://localhost:5173`

### Firebase Private Key Formatting
In the Render environment variable dashboard, paste the `FIREBASE_PRIVATE_KEY` with the literal `\n` characters preserved. The backend code is already configured to normalize these into actual newlines during startup.

### Socket.io Path
The frontend and backend use a standard Socket.io path. If you encounter "Connection Refused", verify that the `VITE_API_URL` does **not** end with a trailing slash and includes `https://`.

---

## Technical Architecture (Production)

- **Frontend**: Vite + React (Static Assets serving via CDN)
- **Backend**: Node.js (Express + Socket.io) with Clustering (Forked for each CPU core)
- **Database**: MongoDB Atlas (Managed Cloud Database)
- **Communications**: Real-time Socket.io events and Firebase Cloud Messaging (FCM)
