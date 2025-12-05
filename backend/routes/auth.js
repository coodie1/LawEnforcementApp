const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const models = require('../models/allSchemas');
const User = models.users;
const { logCustomActivity } = require('../middleware/activityLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, firstName, lastName, email, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            email,
            role: role || 'public'
        });

        await newUser.save();

        // Create token
        const token = jwt.sign(
            { id: newUser._id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role
            }
        });
        await logCustomActivity({
            req,
            action: 'create',
            entityType: 'auth/register',
            entityId: newUser._id?.toString() || 'unknown',
            entityName: newUser.email || newUser.username,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login - Support both email and username for backward compatibility
router.post('/login', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Support both email and username login
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (username) {
            user = await User.findOne({ username });
        } else {
            return res.status(400).json({ message: 'Email or username is required' });
        }

        if (!user) {
            await logCustomActivity({
                req,
                action: 'login_failure',
                entityType: 'auth',
                entityId: 'unknown',
                entityName: email || username || 'unknown',
                userOverride: {
                    userId: 'unknown',
                    userEmail: email || username || 'unknown',
                    userName: email || username || 'unknown',
                },
            });
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await logCustomActivity({
                req,
                action: 'login_failure',
                entityType: 'auth',
                entityId: user._id?.toString() || 'unknown',
                entityName: email || username || user.email,
                userOverride: {
                    userId: user._id?.toString() || 'unknown',
                    userEmail: user.email || email || username || 'unknown',
                    userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'unknown',
                },
            });
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                temporaryPassword: user.temporaryPassword,
                dateOfBirth: user.dateOfBirth,
                bloodGroup: user.bloodGroup
            }
        });
        await logCustomActivity({
            req,
            action: 'login_success',
            entityType: 'auth',
            entityId: user._id?.toString() || 'unknown',
            entityName: user.email,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { password, firstName, lastName, dateOfBirth, bloodGroup } = req.body;
        const userId = req.userId;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update name fields
        if (firstName !== undefined) user.firstName = firstName || null;
        if (lastName !== undefined) user.lastName = lastName || null;
        
        // Update date of birth
        if (dateOfBirth !== undefined) {
            user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        }
        
        // Update blood group
        if (bloodGroup !== undefined) {
            user.bloodGroup = bloodGroup || null;
        }

        // Update password if provided
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            
            // If user had a temporary password, set it to false (status changes to Active)
            if (user.temporaryPassword) {
                user.temporaryPassword = false;
            }
        }

        await user.save();

        res.json({
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                temporaryPassword: user.temporaryPassword,
                dateOfBirth: user.dateOfBirth,
                bloodGroup: user.bloodGroup
            }
        });
        await logCustomActivity({
            req,
            action: 'update',
            entityType: 'auth/profile',
            entityId: user._id?.toString() || 'unknown',
            entityName: user.email || user.username,
            changes: req.body || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
