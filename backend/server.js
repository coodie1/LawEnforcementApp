require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- THE SMART FIX: Permissive CORS Configuration ---
app.use(cors({
    origin: true, // Allow any domain to connect (great for dev)
    credentials: true, // Allow cookies/sessions if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Explicitly allow all CRUD verbs
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Database Connection
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("❌ ERROR: MONGODB_URI is not set in environment variables!");
    console.error("   Please create a .env file in the backend directory with:");
    console.error("   MONGODB_URI=your_mongodb_connection_string");
    process.exit(1);
}

mongoose.connect(uri, {
    // MongoDB Atlas connection options
    retryWrites: true,
    w: 'majority'
})
    // IF YOU SEE THIS MESSAGE IN TERMINAL, MONGODB IS WORKING FINE:
    .then(() => {
        console.log(">>> MongoDB Atlas database connection established successfully! <<<");
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        console.error("   Please check your MONGODB_URI in .env file");
        process.exit(1);
    });


// ==================================================
//  --- Health Check & Status Routes ---
// ==================================================
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'CrimeDB Unified Backend is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check endpoint for deployment monitoring
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// ==================================================


// Routes
// All API requests go to the one dynamic router
const dynamicRouter = require('./routes/dynamic');
const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const arrestRouter = require('./routes/arrest');
const usersRouter = require('./routes/users');
const activityLogsRouter = require('./routes/activityLogs');
const diagnosticRouter = require('./routes/diagnostic');

app.use('/api/dynamic', dynamicRouter);
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);
app.use('/api/arrest', arrestRouter);
app.use('/api/users', usersRouter);
app.use('/api/activity-logs', activityLogsRouter);
app.use('/api/diagnostic', diagnosticRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});