const express = require('express');
const router = express.Router();
const models = require('../models/allSchemas');
const ActivityLog = models.activitylogs;
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken || ((req, res, next) => {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
});

// Require admin role for viewing activity logs
const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// GET /api/activity-logs
// Get all activity logs with optional filtering
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            userId,
            entityType,
            action,
            startDate,
            endDate,
            limit = 100,
            page = 1
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (userId) {
            filter.userId = userId;
        }
        
        if (entityType) {
            filter.entityType = entityType;
        }
        
        if (action) {
            filter.action = action;
        }
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch logs with pagination
        const logs = await ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get total count for pagination
        const total = await ActivityLog.countDocuments(filter);

        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error fetching activity logs:', err);
        res.status(500).json({ message: 'Error fetching activity logs', error: err.message });
    }
});

// GET /api/activity-logs/stats
// Get statistics about activity logs
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stats = await ActivityLog.aggregate([
            {
                $group: {
                    _id: {
                        action: '$action',
                        entityType: '$entityType'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const userStats = await ActivityLog.aggregate([
            {
                $group: {
                    _id: '$userId',
                    userName: { $first: '$userName' },
                    userEmail: { $first: '$userEmail' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            actionStats: stats,
            topUsers: userStats
        });
    } catch (err) {
        console.error('Error fetching activity log stats:', err);
        res.status(500).json({ message: 'Error fetching activity log stats', error: err.message });
    }
});

module.exports = router;




