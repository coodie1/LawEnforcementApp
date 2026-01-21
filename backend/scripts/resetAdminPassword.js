require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const models = require('../models/allSchemas');
const User = models.users;

const MONGODB_URI = process.env.MONGODB_URI;

async function resetAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ Connected to MongoDB\n');

        // Get email and password from command line or use defaults
        const email = process.argv[2] || 'admin@lawenforcement.com';
        const newPassword = process.argv[3] || 'Admin123!';

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User with email "${email}" not found!`);
            console.log('\nAvailable users:');
            const allUsers = await User.find({}, { email: 1, username: 1 }).lean();
            allUsers.forEach(u => {
                console.log(`   - ${u.email || u.username}`);
            });
            process.exit(1);
        }

        console.log(`📧 Found user: ${user.email}`);
        console.log(`🔑 Resetting password to: "${newPassword}"\n`);

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        user.temporaryPassword = false;
        await user.save();

        console.log('✅ Password reset successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', email);
        console.log('New Password:', newPassword);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  You can now log in with these credentials.');
        console.log('⚠️  IMPORTANT: Change this password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
}

resetAdminPassword();

