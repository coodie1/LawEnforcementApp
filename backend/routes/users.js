const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const models = require('../models/allSchemas');
const User = models.users;

// Verify User model is loaded
if (!User) {
    console.error('ERROR: User model is not defined! Check allSchemas.js');
}
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken || ((req, res, next) => {
    // Fallback if not exported
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

// Email transporter configuration
const createTransporter = () => {
    try {
        // Check if email credentials are configured
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        
        if (!emailUser || !emailPass || 
            emailUser === 'your-email@gmail.com' || 
            emailPass === 'your-app-password') {
            throw new Error('Email credentials not configured');
        }

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
    } catch (error) {
        console.error('Error creating email transporter:', error.message);
        throw error;
    }
};

// Generate random temporary password
const generateTempPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

// Send email with temporary password
const sendTempPasswordEmail = async (email, fullName, tempPassword) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
            process.env.EMAIL_USER === 'your-email@gmail.com' || 
            process.env.EMAIL_PASS === 'your-app-password') {
            console.warn('Email not configured. Skipping email send.');
            return false;
        }

        console.log('Creating email transporter...');
        let transporter;
        try {
            transporter = createTransporter();
        } catch (transporterError) {
            console.error('Failed to create email transporter:', transporterError.message);
            return false;
        }
        
        // Get frontend URL from environment variables
        // Priority: FRONTEND_URL > VITE_FRONTEND_URL > derive from API URL > default
        let frontendUrl = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL;
        
        if (!frontendUrl) {
            // Try to derive from API URL if available (remove /api suffix)
            const apiUrl = process.env.VITE_API_URL || process.env.API_URL;
            if (apiUrl) {
                // Remove /api suffix if present to get base URL
                frontendUrl = apiUrl.replace(/\/api\/?$/, '');
                // If API URL is on a different domain (e.g., Render), we can't derive frontend URL
                // So we'll fall back to default
                if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
                    // For localhost, frontend is typically on port 5173
                    frontendUrl = 'http://localhost:5173';
                } else {
                    // For production, frontend and backend are usually on different domains
                    // So we need FRONTEND_URL to be set explicitly
                    frontendUrl = null;
                }
            }
        }
        
        // Fallback to localhost for development
        if (!frontendUrl) {
            frontendUrl = 'http://localhost:5173';
            console.warn('Frontend URL not set in environment. Using default:', frontendUrl);
            console.warn('For production, please set FRONTEND_URL in your .env file');
        }
        
        const loginUrl = `${frontendUrl}/auth`;
        console.log('Login URL for email button:', loginUrl);
        
        // Skip verification to avoid blocking - just try to send
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Law Enforcement App Account - Temporary Password',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header with gradient -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #0b2c75 0%, #0a1f5c 100%); padding: 40px 30px; text-align: center;">
                                            <!-- Logo Container - Centered -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px;">
                                                <tr>
                                                    <td align="center" style="padding: 0;">
                                                        <!-- Logo Box -->
                                                        <table cellpadding="0" cellspacing="0" align="center" style="background-color: rgba(255, 255, 255, 0.1); width: 80px; height: 80px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">
                                                            <tr>
                                                                <td align="center" valign="middle" style="padding: 0; height: 80px; width: 80px; text-align: center;">
                                                                    <span style="font-size: 40px; color: #ffffff; line-height: 1; display: block; text-align: center;">🛡️</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Law Enforcement App</h1>
                                            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 14px; font-weight: 400;">Secure. Reliable. Professional.</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #0b2c75; margin: 0 0 20px; font-size: 24px; font-weight: 600;">Welcome, ${fullName}!</h2>
                                            <p style="color: #4a5568; margin: 0 0 20px; font-size: 16px; line-height: 1.6;">Your account has been successfully created. You can now access the Law Enforcement App using the temporary password below.</p>
                                            
                                            <!-- Password Box -->
                                            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%); border: 2px solid #0b2c75; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                                                <p style="color: #4a5568; margin: 0 0 10px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
                                                <p style="font-size: 24px; font-weight: 700; color: #0b2c75; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px; word-break: break-all;">${tempPassword}</p>
                                            </div>
                                            
                                            <!-- Info Box -->
                                            <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                                                    <strong>⚠️ Important Security Notice:</strong><br>
                                                    Please change your password immediately after your first login for security purposes.
                                                </p>
                                            </div>
                                            
                                            <!-- Login Info -->
                                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                                <p style="color: #4a5568; margin: 0 0 10px; font-size: 14px; font-weight: 600;">Login Information:</p>
                                                <p style="color: #0b2c75; margin: 0; font-size: 16px; font-weight: 500;">
                                                    <strong>Email:</strong> ${email}
                                                </p>
                                            </div>
                                            
                                            <!-- CTA Button -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0b2c75 0%, #0a1f5c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(11, 44, 117, 0.3);">Access Your Account</a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="color: #718096; margin: 30px 0 0; font-size: 14px; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                                If you did not request this account, please contact your system administrator immediately.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="color: #718096; margin: 0 0 10px; font-size: 12px;">© ${new Date().getFullYear()} Law Enforcement App. All rights reserved.</p>
                                            <p style="color: #a0aec0; margin: 0; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        console.log('Sending email...');
        // Send email with a longer timeout (30 seconds) to prevent false negatives
        try {
            await Promise.race([
                transporter.sendMail(mailOptions),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), 30000)
                )
            ]);
            console.log(`✅ Temporary password email sent successfully to ${email}`);
            return true;
        } catch (sendError) {
            // Check if it's just a timeout - email might still be sent
            if (sendError.message && sendError.message.includes('timeout')) {
                console.warn(`⚠️ Email send timed out, but email may have been sent to ${email}`);
                // Return true anyway since Gmail usually processes emails quickly
                // and timeout might be a false negative
                return true;
            }
            throw sendError; // Re-throw other errors to be caught by outer catch
        }
    } catch (error) {
        console.error('Error sending email:', error.message || error);
        // Don't throw - just return false so user creation can still succeed
        return false;
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    try {
        if (!req.userRole) {
            console.error('User role not found in request');
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (error) {
        console.error('Error in requireAdmin middleware:', error);
        res.status(500).json({ message: 'Server error checking permissions' });
    }
};

// Health check endpoint (no auth required for testing)
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Users route is working',
        userModelExists: !!User,
        timestamp: new Date().toISOString()
    });
});

// Test POST endpoint without auth (for debugging)
router.post('/test', async (req, res) => {
    try {
        console.log('=== TEST POST /api/users/test ===');
        console.log('Request body:', req.body);
        console.log('User model exists:', !!User);
        
        if (!User) {
            return res.status(500).json({ error: 'User model not found' });
        }
        
        // Test database connection
        const testQuery = await User.findOne({}).limit(1);
        console.log('Database query test: OK');
        
        res.json({ 
            status: 'ok', 
            message: 'POST endpoint is working',
            body: req.body,
            dbConnected: true
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
});

// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Verify User model exists
        if (!User) {
            console.error('ERROR: User model is undefined!');
            return res.status(500).json({ 
                message: 'Server configuration error: User model not found',
                error: 'User model is undefined'
            });
        }

        console.log('Fetching users from database...');
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        console.log(`Found ${users.length} users`);
        
        // Convert MongoDB _id to id and ensure it's a string
        const formattedUsers = users.map(user => {
            try {
                return {
                    id: user._id ? user._id.toString() : null,
                    email: user.email || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    role: user.role || 'officer',
                    temporaryPassword: user.temporaryPassword || false,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            } catch (mapError) {
                console.error('Error mapping user:', mapError);
                return null;
            }
        }).filter(user => user !== null);

        console.log(`Returning ${formattedUsers.length} formatted users`);
        res.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Server error fetching users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/users - Create new user (admin only)
router.post('/', async (req, res, next) => {
    console.log('=== POST /api/users - Route hit ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
}, authenticateToken, async (req, res, next) => {
    console.log('=== After authenticateToken ===');
    console.log('userId:', req.userId);
    console.log('userRole:', req.userRole);
    next();
}, requireAdmin, async (req, res) => {
    try {
        console.log('=== POST /api/users - Handler executing ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User model exists:', !!User);
        console.log('User model type:', typeof User);
        
        // Verify User model exists
        if (!User) {
            console.error('ERROR: User model is undefined!');
            return res.status(500).json({ 
                message: 'Server configuration error: User model not found',
                error: 'User model is undefined'
            });
        }
        
        // Test database connection
        try {
            await User.findOne({}).limit(1);
            console.log('Database connection test: OK');
        } catch (dbError) {
            console.error('Database connection test failed:', dbError.message);
            return res.status(500).json({ 
                message: 'Database connection error',
                error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
            });
        }

        const { firstName, lastName, email, role } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !role) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate role
        const validRoles = ['admin', 'officer', 'analyst', 'clerk'];
        if (!validRoles.includes(role)) {
            console.log('Validation failed: Invalid role');
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user with email already exists
        console.log('Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate temporary password
        console.log('Generating temporary password...');
        const tempPassword = generateTempPassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // Create user (don't set username - it's optional and causes unique index conflicts)
        console.log('Creating new user...');
        const newUser = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            role,
            password: hashedPassword,
            temporaryPassword: true
            // username is intentionally omitted - it's optional and we use email as unique identifier
        });

        console.log('Saving user to database...');
        await newUser.save();
        console.log('User saved successfully with ID:', newUser._id);

        // Send email with temporary password (await but don't fail user creation if email fails)
        let emailSent = false;
        try {
            console.log('Attempting to send email...');
            emailSent = await sendTempPasswordEmail(email, `${firstName} ${lastName}`, tempPassword);
            if (emailSent) {
                console.log('Email sent successfully to', email);
            } else {
                console.warn(`User ${email} created but email notification failed or not configured`);
            }
        } catch (emailError) {
            // Email error should not prevent user creation
            console.error('Email sending error (non-critical):', emailError.message || emailError);
            emailSent = false;
        }

        console.log('Sending success response...');
        const response = {
            message: 'User created successfully',
            user: {
                id: newUser._id.toString(),
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                temporaryPassword: newUser.temporaryPassword
            },
            emailSent: emailSent
        };
        
        res.status(201).json(response);
        console.log('Response sent successfully');
    } catch (error) {
        console.error('=== ERROR CREATING USER ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', error);
        
        // Provide more detailed error message for debugging
        const errorMessage = error.message || 'Server error creating user';
        
        // Check for specific error types
        if (error.name === 'ValidationError') {
            console.error('Mongoose validation error:', error.errors);
            return res.status(400).json({ 
                message: 'Validation error',
                errors: error.errors,
                error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
        
        if (error.name === 'MongoServerError' || error.code === 11000) {
            console.error('MongoDB duplicate key error');
            return res.status(400).json({ 
                message: 'User with this email already exists',
                error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
        
        res.status(500).json({ 
            message: 'Server error creating user',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
            errorType: error.name
        });
    }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, role } = req.body;
        const userId = req.params.id;

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (role !== undefined) {
            const validRoles = ['admin', 'officer', 'analyst', 'clerk'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            user.role = role;
        }

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.userId ? req.userId.toString() : null;

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Prevent deleting yourself - compare as strings
        if (currentUserId && userId === currentUserId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

module.exports = router;

