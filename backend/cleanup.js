const mongoose = require('mongoose');
const models = require('./models/allSchemas');
require('dotenv').config();

const cleanData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Clear the data we added
        await models.incidents.deleteMany({});
        await models.arrests.deleteMany({});
        await models.cases.deleteMany({});
        await models.people.deleteMany({});
        await models.officers.deleteMany({});

        console.log('Sample data removed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup error:', err);
        process.exit(1);
    }
};

cleanData();
