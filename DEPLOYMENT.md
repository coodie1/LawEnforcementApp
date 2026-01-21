# Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide will help you deploy your Law Enforcement App to production.

---

## 📋 Prerequisites

- GitHub repository with your code
- MongoDB Atlas account (or hosted MongoDB)
- Vercel account (free tier works)
- Render account (free tier works)

---

## 🚀 Step 1: Deploy Backend to Render

### 1.1 Prepare Your Backend

✅ **Already done:** Your `backend/package.json` now has a `start` script.

### 1.2 Create Render Web Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `law-enforcement-backend` (or any name)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your main branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid if you need)

### 1.3 Set Environment Variables in Render

Click **"Environment"** tab and add:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_very_secure_jwt_secret_key_here
NODE_ENV=production
PORT=10000
```

**Important Notes:**
- `MONGODB_URI`: Your MongoDB Atlas connection string (must allow Render's IP addresses)
- `JWT_SECRET`: Use a strong random string (e.g., generate with `openssl rand -base64 32`)
- `PORT`: Render sets this automatically, but you can leave it or use `10000`

### 1.4 MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add Render's IP ranges)
   - For production, you can allow `0.0.0.0/0` (all IPs) if your MongoDB has authentication enabled

### 1.5 Deploy and Test

1. Click **"Create Web Service"**
2. Wait for deployment (first deploy takes 5-10 minutes)
3. Once deployed, note your backend URL: `https://your-app-name.onrender.com`
4. Test the backend: Visit `https://your-app-name.onrender.com/` - you should see: "CrimeDB Unified Backend is running!"

### 1.6 Create First Admin User (After Backend is Live)

After backend is deployed, you need to create the first admin user. You have two options:

**Option A: SSH into Render and run script** (if Render supports it)
```bash
cd backend
npm run create-first-user
```

**Option B: Use MongoDB Compass/Shell directly**
- Connect to your MongoDB Atlas
- Run the script locally pointing to production MongoDB:
  ```bash
  cd backend
  MONGODB_URI=your_production_mongodb_uri node scripts/createFirstUser.js
  ```

**Default credentials created:**
- Email: `admin@lawenforcement.com`
- Password: `Admin123!`

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Your Frontend

✅ **Already configured:** Your `frontend/src/api.ts` uses `import.meta.env.VITE_API_URL`

### 2.2 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend` (click "Edit" and set this)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

### 2.3 Set Environment Variables in Vercel

Before deploying, click **"Environment Variables"** and add:

```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important:** 
- Replace `your-backend-name.onrender.com` with your actual Render backend URL
- Make sure to include `/api` at the end
- No trailing slash

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Once deployed, Vercel will give you a URL like: `https://your-app-name.vercel.app`

---

## ✅ Step 3: Verify Deployment

### 3.1 Test Backend

1. Visit: `https://your-backend-name.onrender.com/`
   - Should see: "CrimeDB Unified Backend is running!"
2. Test API endpoint: `https://your-backend-name.onrender.com/api/auth/login`
   - Should return an error (expected, since no body sent), but confirms route exists

### 3.2 Test Frontend

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Try logging in with:
   - Email: `admin@lawenforcement.com`
   - Password: `Admin123!`
3. If login fails, check browser console (F12) for errors

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Cannot connect to backend" / CORS errors

**Symptoms:** Frontend can't reach backend, or CORS errors in browser console

**Solutions:**
1. ✅ Check `VITE_API_URL` in Vercel matches your Render backend URL exactly
2. ✅ Make sure backend URL includes `/api` at the end
3. ✅ Verify backend is running (visit backend URL in browser)
4. ✅ Check Render logs for errors

### Issue 2: "Invalid or expired token" immediately after login

**Symptoms:** Login seems successful but immediately redirected back to login

**Solutions:**
1. ✅ Check `JWT_SECRET` is set in Render environment variables
2. ✅ Make sure `JWT_SECRET` is the same if you changed it (or clear localStorage and re-login)
3. ✅ Verify backend is returning token in response

### Issue 3: "MongoDB connection error"

**Symptoms:** Backend logs show MongoDB connection failed

**Solutions:**
1. ✅ Check `MONGODB_URI` in Render environment variables
2. ✅ Verify MongoDB Atlas IP whitelist includes Render's IPs (or `0.0.0.0/0`)
3. ✅ Check MongoDB Atlas database user has correct permissions
4. ✅ Verify MongoDB connection string format is correct

### Issue 4: "404 Not Found" on API routes

**Symptoms:** Frontend gets 404 when calling API

**Solutions:**
1. ✅ Verify backend URL in Vercel env var ends with `/api`
2. ✅ Check Render backend is actually running (visit root URL)
3. ✅ Check Render logs for route registration errors

### Issue 5: Frontend build fails on Vercel

**Symptoms:** Vercel deployment fails during build

**Solutions:**
1. ✅ Check `frontend/package.json` has correct build script: `"build": "tsc && vite build"`
2. ✅ Verify all dependencies are in `package.json` (not just `devDependencies`)
3. ✅ Check Vercel build logs for specific error messages

### Issue 6: Backend crashes on Render

**Symptoms:** Backend shows "crashed" status

**Solutions:**
1. ✅ Check Render logs for error messages
2. ✅ Verify `MONGODB_URI` is set correctly
3. ✅ Check `JWT_SECRET` is set
4. ✅ Verify `package.json` has `"start": "node server.js"` script
5. ✅ Make sure `server.js` exists in `backend/` directory

---

## 🔐 Security Checklist

Before going live, ensure:

- [ ] Changed default admin password (`Admin123!`)
- [ ] `JWT_SECRET` is a strong random string
- [ ] MongoDB has authentication enabled
- [ ] MongoDB IP whitelist is configured (or use `0.0.0.0/0` with auth)
- [ ] Environment variables are set in both Render and Vercel
- [ ] No hardcoded secrets in code
- [ ] CORS is configured correctly (backend allows your Vercel domain)

---

## 📝 Quick Reference

### Backend (Render)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `PORT`

### Frontend (Vercel)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_API_URL`

### Default Admin Credentials
- **Email**: `admin@lawenforcement.com`
- **Password**: `Admin123!`
- ⚠️ **Change this immediately after first login!**

---

## 🆘 Need Help?

If you're still having issues:

1. Check Render logs: Render Dashboard → Your Service → Logs
2. Check Vercel logs: Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs
3. Check browser console: F12 → Console tab
4. Test backend directly: Use Postman or curl to test API endpoints

---

**Good luck with your deployment! 🚀**

