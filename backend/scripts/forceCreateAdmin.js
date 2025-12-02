require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const models = require('../models/allSchemas');
const User = models.users;

const MONGODB_URI = process.env.MONGODB_URI;

async function forceCreateAdmin() {
    try {
        await mongoose.connect(MONGODB_URI, {
            retryWrites: true,
            w: 'majority'
        });
        console.log('Connected to MongoDB\n');

        // Get user details from command line arguments or use defaults
        const email = process.argv[2] || 'admin@lawenforcement.com';
        const password = process.argv[3] || 'Admin123!';
        const firstName = process.argv[4] || 'Admin';
        const lastName = process.argv[5] || 'User';

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`❌ User with email "${email}" already exists!`);
            console.log('Please use a different email or delete the existing user first.\n');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const adminUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'admin',
            temporaryPassword: false
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Name:', `${firstName} ${lastName}`);
        console.log('Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Please change this password after first login!');
        console.log('\nYou can now log in to the application with these credentials.\n');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

forceCreateAdmin();

