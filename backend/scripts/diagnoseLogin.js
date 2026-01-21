require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const models = require('../models/allSchemas');
const User = models.users;

const MONGODB_URI = process.env.MONGODB_URI;

async function diagnoseLogin() {
    try {
        console.log('🔍 Starting Login Diagnosis...\n');
        
        // 1. Check MongoDB connection
        console.log('1️⃣ Checking MongoDB connection...');
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI is not set in .env file!');
            process.exit(1);
        }
        console.log('✅ MONGODB_URI found in .env');
        
        await mongoose.connect(MONGODB_URI, {
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ Connected to MongoDB\n');
        
        // 2. Check if any users exist
        console.log('2️⃣ Checking users in database...');
        const userCount = await User.countDocuments();
        console.log(`   Found ${userCount} user(s) in database\n`);
        
        if (userCount === 0) {
            console.log('⚠️  No users found in database!');
            console.log('   Run: npm run create-first-user\n');
            process.exit(1);
        }
        
        // 3. List all users
        console.log('3️⃣ Listing all users:');
        const allUsers = await User.find({}, { 
            email: 1, 
            username: 1, 
            firstName: 1, 
            lastName: 1, 
            role: 1,
            password: 1,
            mfaEnabled: 1,
            _id: 1
        }).lean();
        
        allUsers.forEach((user, index) => {
            console.log(`\n   User ${index + 1}:`);
            console.log(`   - ID: ${user._id}`);
            console.log(`   - Email: ${user.email || '(not set)'}`);
            console.log(`   - Username: ${user.username || '(not set)'}`);
            console.log(`   - Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || '(not set)');
            console.log(`   - Role: ${user.role || '(not set)'}`);
            console.log(`   - MFA Enabled: ${user.mfaEnabled ? 'Yes' : 'No'}`);
            console.log(`   - Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'MISSING!'}`);
        });
        
        // 4. Test default credentials
        console.log('\n4️⃣ Testing default credentials:');
        const testEmail = 'admin@lawenforcement.com';
        const testPassword = 'Admin123!';
        
        const testUser = await User.findOne({ email: testEmail });
        if (!testUser) {
            console.log(`   ❌ User with email "${testEmail}" not found`);
            console.log(`   💡 Try logging in with one of the emails listed above`);
        } else {
            console.log(`   ✅ User found: ${testUser.email}`);
            console.log(`   Testing password: "${testPassword}"`);
            
            if (!testUser.password) {
                console.log(`   ❌ User has no password hash!`);
            } else {
                const isMatch = await bcrypt.compare(testPassword, testUser.password);
                if (isMatch) {
                    console.log(`   ✅ Password matches! Login should work.`);
                } else {
                    console.log(`   ❌ Password does NOT match!`);
                    console.log(`   💡 The password in database is different from "Admin123!"`);
                    console.log(`   💡 Try resetting the password or creating a new user`);
                }
            }
        }
        
        // 5. Test login with provided credentials
        const testEmail2 = process.argv[2];
        const testPassword2 = process.argv[3];
        
        if (testEmail2 && testPassword2) {
            console.log(`\n5️⃣ Testing provided credentials:`);
            console.log(`   Email: ${testEmail2}`);
            console.log(`   Password: ${testPassword2}`);
            
            const testUser2 = await User.findOne({ 
                $or: [
                    { email: testEmail2 },
                    { username: testEmail2 }
                ]
            });
            
            if (!testUser2) {
                console.log(`   ❌ User not found with email/username: "${testEmail2}"`);
            } else {
                console.log(`   ✅ User found: ${testUser2.email || testUser2.username}`);
                if (!testUser2.password) {
                    console.log(`   ❌ User has no password hash!`);
                } else {
                    const isMatch2 = await bcrypt.compare(testPassword2, testUser2.password);
                    if (isMatch2) {
                        console.log(`   ✅ Password matches! Login should work.`);
                    } else {
                        console.log(`   ❌ Password does NOT match!`);
                    }
                }
            }
        }
        
        // 6. Check database connection status
        console.log('\n6️⃣ Database connection status:');
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        console.log(`   Status: ${states[dbState]} (${dbState})`);
        
        console.log('\n✅ Diagnosis complete!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during diagnosis:', error);
        process.exit(1);
    }
}

diagnoseLogin();

