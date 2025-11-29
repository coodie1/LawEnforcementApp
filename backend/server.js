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
mongoose.connect(uri, {
    // MongoDB Atlas connection options
    retryWrites: true,
    w: 'majority'
})
    // IF YOU SEE THIS MESSAGE IN TERMINAL, MONGODB IS WORKING FINE:
    .then(() => console.log(">>> MongoDB Atlas database connection established successfully! <<<"))
    .catch(err => console.error("MongoDB connection error:", err));


// ==================================================
//  --- NEW: ADD THIS BASIC HOMEPAGE ROUTE BACK ---
// ==================================================
app.get('/', (req, res) => {
    res.send('CrimeDB Unified Backend is running! Go to frontend to use the app.');
});
// ==================================================


// Routes
// All API requests go to the one dynamic router
const dynamicRouter = require('./routes/dynamic');
const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const arrestRouter = require('./routes/arrest');

app.use('/api/dynamic', dynamicRouter);
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);
app.use('/api/arrest', arrestRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});