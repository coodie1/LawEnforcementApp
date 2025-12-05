# Law Enforcement System

**Developed by: Muhammad Umair Arif**  
**Company: CodeClad**

A comprehensive law enforcement management system with dynamic data aggregation, automatic indexing, and modern UI components.

**Built by Codeclad.**

**Copyright (c) 2025 Muhammad Umair Arif. All Rights Reserved.**

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Creating First User](#creating-first-user)
- [Running the Application](#running-the-application)
- [Accessing the Application](#accessing-the-application)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Features](#features)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download here](https://www.mongodb.com/try/download/community) or [Atlas here](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js) or **yarn**

### Verify Installation

Open your terminal/command prompt and verify:

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
mongod --version  # Should show MongoDB version (if installed locally)
```

---

## Installation

### Step 1: Clone or Download the Project

If you have the project in a repository:
```bash
git clone <repository-url>
cd LawEnforcementApp
```

If you have the project as a ZIP file, extract it and navigate to the folder.

### Step 2: Install Backend Dependencies

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install all required packages:
   ```bash
   npm install
   ```

   This will install all dependencies listed in `package.json` (Express, Mongoose, bcrypt, etc.)

### Step 3: Install Frontend Dependencies

1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```

2. Install all required packages:
   ```bash
   npm install
   ```

   This will install all dependencies (React, TypeScript, Vite, Tailwind CSS, etc.)

---

## Environment Setup

### Step 1: Create Backend Environment File

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create a new file named `.env`:
   ```bash
   # On Windows (PowerShell)
   New-Item -Path .env -ItemType File

   # On Windows (CMD)
   type nul > .env

   # On Mac/Linux
   touch .env
   ```

3. Open the `.env` file in a text editor and add the following:

   ```env
   # MongoDB Connection String
   # For local MongoDB:
   MONGODB_URI=mongodb://localhost:27017/lawenforcement

   # For MongoDB Atlas (replace with your connection string):
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lawenforcement?retryWrites=true&w=majority

   # Server Port (optional, defaults to 5000)
   PORT=5000

   # JWT Secret Key (change this to a random secure string)
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

   # Email Configuration (optional, for password reset emails)
   # EMAIL_USER=your-email@gmail.com
   # EMAIL_PASS=your-app-password

   # Frontend URL (optional, for email links)
   # FRONTEND_URL=http://localhost:5173
   ```

4. **Important**: Replace the values with your actual:
   - MongoDB connection string (local or Atlas)
   - A secure JWT secret key (use a random string generator)
   - Email credentials if you want password reset functionality

### Step 2: Create Frontend Environment File (Optional)

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Create a new file named `.env`:
   ```bash
   # On Windows (PowerShell)
   New-Item -Path .env -ItemType File

   # On Windows (CMD)
   type nul > .env

   # On Mac/Linux
   touch .env
   ```

3. Open the `.env` file and add:

   ```env
   # Backend API URL (optional, defaults to http://localhost:5000/api)
   VITE_API_URL=http://localhost:5000/api
   ```

   **Note**: If your backend runs on a different port, update this accordingly.

---

## Database Setup

### Option 1: Local MongoDB

1. **Install MongoDB** (if not already installed):
   - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your operating system

2. **Start MongoDB Service**:
   - **Windows**: MongoDB should start automatically as a service, or run:
     ```bash
     net start MongoDB
     ```
   - **Mac/Linux**: 
     ```bash
     sudo systemctl start mongod
     # or
     mongod
     ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # or
   mongo
   ```
   If you see the MongoDB shell, you're good to go!

4. **Update `.env` file**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lawenforcement
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create a MongoDB Atlas account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a new cluster**:
   - Click "Build a Database"
   - Choose the free tier (M0)
   - Select your preferred region

3. **Create a database user**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)

4. **Whitelist your IP address**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your specific IP

5. **Get your connection string**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Update `.env` file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lawenforcement?retryWrites=true&w=majority
   ```

---

## Creating First User

Before you can log in, you need to create an admin user in the database.

### Method 1: Using the Script (Recommended)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Run the create first user script:
   ```bash
   npm run create-first-user
   ```

   This will create a default admin user with:
   - **Email**: `admin@lawenforcement.com`
   - **Password**: `Admin123!`
   - **Role**: `admin`

3. **Custom User Creation**:
   You can also specify custom credentials:
   ```bash
   node scripts/createFirstUser.js <email> <password> <firstName> <lastName>
   ```
   
   Example:
   ```bash
   node scripts/createFirstUser.js admin@example.com MySecurePass123 Admin User
   ```

### Method 2: Manual Creation via MongoDB

If you prefer to create the user manually:

1. Connect to your MongoDB database (using MongoDB Compass or `mongosh`)
2. Navigate to the `users` collection
3. Insert a document with the following structure (password must be hashed using bcrypt):
   ```json
   {
     "email": "admin@lawenforcement.com",
     "password": "<bcrypt-hashed-password>",
     "firstName": "Admin",
     "lastName": "User",
     "role": "admin",
     "temporaryPassword": false
   }
   ```

**⚠️ Important**: After first login, change the default password!

---

## Running the Application

### Step 1: Start the Backend Server

1. Open a terminal/command prompt
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npx nodemon server.js
   ```

4. You should see:
   ```
   >>> MongoDB Atlas database connection established successfully! <<<
   Server is running on port 5000
   ```

   If you see this, the backend is running successfully! ✅

### Step 2: Start the Frontend Development Server

1. Open a **new** terminal/command prompt window
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. You should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

   The frontend is now running! ✅

---

## Accessing the Application

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. You should see the login page
4. Log in with the credentials you created:
   - **Email**: `admin@lawenforcement.com` (or your custom email)
   - **Password**: `Admin123!` (or your custom password)

5. After successful login, you'll be redirected to the dashboard

---

## Troubleshooting

### Backend Issues

#### ❌ "MongoDB connection error"
- **Solution**: 
  - Verify MongoDB is running (local) or your Atlas connection string is correct
  - Check your `.env` file has the correct `MONGODB_URI`
  - Ensure your IP is whitelisted (for Atlas)
  - Verify your database user credentials

#### ❌ "Port 5000 already in use"
- **Solution**: 
  - Change the `PORT` in `backend/.env` to a different port (e.g., `5001`)
  - Update `VITE_API_URL` in `frontend/.env` to match the new port
  - Or stop the process using port 5000

#### ❌ "Cannot find module 'dotenv'"
- **Solution**: 
  ```bash
  cd backend
  npm install
  ```

### Frontend Issues

#### ❌ "Cannot connect to API" or "Network Error"
- **Solution**: 
  - Verify the backend server is running
  - Check `VITE_API_URL` in `frontend/.env` matches your backend URL
  - Ensure CORS is properly configured (should be automatic)

#### ❌ "Vite cache error" or "EPERM: operation not permitted"
- **Solution**: 
  ```bash
  cd frontend
  rmdir /s node_modules\.vite\deps
  npm run dev
  ```
  Or on Mac/Linux:
  ```bash
  rm -rf node_modules/.vite
  npm run dev
  ```

#### ❌ "Module not found" errors
- **Solution**: 
  ```bash
  cd frontend
  rm -rf node_modules
  npm install
  ```

### Login Issues

#### ❌ "Invalid credentials"
- **Solution**: 
  - Verify the user exists in the database
  - Run `npm run create-first-user` again if needed
  - Check that the password is correct (case-sensitive)

#### ❌ "User not found"
- **Solution**: 
  - Create the first user using the script (see [Creating First User](#creating-first-user))
  - Verify the user exists in MongoDB

### General Issues

#### ❌ "npm install" fails
- **Solution**: 
  - Clear npm cache: `npm cache clean --force`
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again
  - Try using `npm install --legacy-peer-deps` if peer dependency errors occur

#### ❌ Build errors
- **Solution**: 
  - Ensure you're using Node.js v18 or higher
  - Delete `node_modules` and reinstall
  - Check for TypeScript errors: `cd frontend && npm run lint`

---

## Project Structure

```
LawEnforcementApp/
├── backend/
│   ├── models/
│   │   └── allSchemas.js          # MongoDB schemas
│   ├── routes/
│   │   ├── auth.js                # Authentication
│   │   ├── dynamic.js             # Dynamic CRUD operations
│   │   ├── stats.js               # Statistics
│   │   └── ...
│   ├── scripts/
│   │   └── createFirstUser.js     # First user creation script
│   ├── server.js                  # Express server
│   ├── package.json
│   └── .env                       # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── api.ts                 # API client
│   │   └── ...
│   ├── package.json
│   └── .env                       # Environment variables (optional)
│
└── README.md                      # This file
```

---

## Features

- ✅ **Dynamic Collection Management**: CRUD operations for all collections
- ✅ **Advanced Filtering**: Collection-specific filters with animations
- ✅ **Search Functionality**: Cross-collection search
- ✅ **Automatic Indexing**: MongoDB indexes created automatically
- ✅ **User Authentication**: Secure login with JWT tokens
- ✅ **Role-Based Access Control**: Admin, officer, and read-only roles
- ✅ **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- ✅ **Responsive Design**: Works on all device sizes
- ✅ **Form Validation**: Comprehensive client-side validation
- ✅ **Auto-Generated IDs**: Logical primary keys (e.g., CAS101, INC102)

---

## Additional Resources

- [Automatic Index Creation Logic](./backend/INDEX_CREATION_LOGIC.md)
- [Filter Animations Implementation](./FILTER_ANIMATIONS.md)
- [Changelog](./CHANGELOG.md)
- [NoSQL Injection Demo](./NOSQL_INJECTION_DEMO.md)

---

## License

**PROPRIETARY LICENSE** - Copyright (c) 2025 Muhammad Umair Arif. All Rights Reserved.

See [LICENSE.md](./LICENSE.md) for full terms and conditions.

---

## Support

For issues or questions, please contact the project maintainer.

**Happy Coding! 🚀**
