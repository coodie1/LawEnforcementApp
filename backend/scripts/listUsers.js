require('dotenv').config();
const mongoose = require('mongoose');
const models = require('../models/allSchemas');
const User = models.users;

const MONGODB_URI = process.env.MONGODB_URI;

async function listUsers() {
    try {
        await mongoose.connect(MONGODB_URI, {
            retryWrites: true,
            w: 'majority'
        });
        console.log('Connected to MongoDB\n');

        const users = await User.find({}).select('email firstName lastName role createdAt');
        
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log(`Found ${users.length} user(s):\n`);
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
}

listUsers();

