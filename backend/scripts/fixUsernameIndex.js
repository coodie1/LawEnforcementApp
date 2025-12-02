require('dotenv').config();
const mongoose = require('mongoose');
const models = require('../models/allSchemas');
const User = models.users;

const MONGODB_URI = process.env.MONGODB_URI;

async function fixUsernameIndex() {
    try {
        await mongoose.connect(MONGODB_URI, {
            retryWrites: true,
            w: 'majority'
        });
        console.log('Connected to MongoDB\n');

        // Drop the old unique index on username
        try {
            await User.collection.dropIndex('username_1');
            console.log('✅ Dropped old username_1 unique index');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  Index username_1 does not exist (already dropped)');
            } else {
                console.error('Error dropping index:', error.message);
            }
        }

        // Create a new sparse index (non-unique) if needed
        try {
            await User.collection.createIndex({ username: 1 }, { sparse: true });
            console.log('✅ Created new sparse (non-unique) index on username');
        } catch (error) {
            console.error('Error creating index:', error.message);
        }

        console.log('\n✅ Username index fixed! You can now create users without username conflicts.\n');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing index:', error);
        process.exit(1);
    }
}

fixUsernameIndex();

