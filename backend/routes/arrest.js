const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const models = require('../models/allSchemas');
const { logActivity } = require('../middleware/activityLogger');
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

// Helper function to generate unique IDs
const generateID = (prefix, existingIDs) => {
    let counter = 1;
    let newID;
    do {
        newID = `${prefix}-${String(counter).padStart(3, '0')}`;
        counter++;
    } while (existingIDs.includes(newID));
    return newID;
};

// POST /api/arrest/register
// Registers a new arrest
router.post('/register', authenticateToken, logActivity, async (req, res) => {
    try {
        const {
            personID,
            caseID,
            arrestDate,
            locationID,
            chargeDescription,
            statuteCode,
            isConvicted = false,
            officerID // Optional: arresting officer
        } = req.body;

        // Validate required fields
        if (!personID || !caseID || !arrestDate || !locationID || !chargeDescription || !statuteCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: personID, caseID, arrestDate, locationID, chargeDescription, statuteCode' 
            });
        }

        // Verify person exists
        const person = await models.people.findOne({ personID });
        if (!person) {
            return res.status(404).json({ success: false, error: 'Person not found' });
        }

        // Verify case exists and is open
        const caseDoc = await models.cases.findOne({ caseID, status: { $regex: /^open$/i } });
        if (!caseDoc) {
            return res.status(404).json({ success: false, error: 'Case not found or not open' });
        }

        // Verify location exists
        const location = await models.locations.findOne({ locationID });
        if (!location) {
            return res.status(404).json({ success: false, error: 'Location not found' });
        }

        // Get existing IDs to generate unique ones
        const existingArrestIDs = await models.arrests.distinct('arrestID', {});
        const existingChargeIDs = await models.charges.distinct('chargeID', {});

        // Generate unique IDs
        const arrestID = generateID('ARR', existingArrestIDs);
        const chargeID = generateID('CHG', existingChargeIDs);

        // Format arrest date as string (YYYY-MM-DD)
        const formattedDate = typeof arrestDate === 'string' 
            ? arrestDate.split('T')[0] 
            : new Date(arrestDate).toISOString().split('T')[0];

        // Step 1: Insert arrest document
        const newArrest = new models.arrests({
            arrestID,
            personID,
            caseID,
            date: formattedDate,
            locationID,
            officerID: officerID || null
        });
        await newArrest.save();

        // Step 2: Insert charge document
        const newCharge = new models.charges({
            chargeID,
            arrestID,
            description: chargeDescription,
            statuteCode,
            isConvicted: Boolean(isConvicted)
        });
        await newCharge.save();

        // Step 3: Update case status to "open"
        await models.cases.updateOne(
            { caseID },
            { $set: { status: 'open' } }
        );

        // Step 4: Update person roles to include "suspect" if not already present
        const currentRoles = person.roles || [];
        if (!currentRoles.includes('suspect')) {
            await models.people.updateOne(
                { personID },
                { $set: { roles: [...currentRoles, 'suspect'] } }
            );
        }

        // Auto-create indexes (non-blocking)
        const indexPromises = [
            models.arrests.collection.createIndex({ personID: 1 }, { background: true }).catch(() => {}),
            models.arrests.collection.createIndex({ caseID: 1 }, { background: true }).catch(() => {}),
            models.arrests.collection.createIndex({ locationID: 1 }, { background: true }).catch(() => {}),
            models.charges.collection.createIndex({ arrestID: 1 }, { background: true }).catch(() => {}),
        ];
        Promise.all(indexPromises).catch(() => {}); // Fire and forget

        res.json({
            success: true,
            message: 'Arrest successfully registered',
            data: {
                arrest: newArrest,
                charge: newCharge
            }
        });

    } catch (err) {
        console.error('Arrest registration error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to register arrest',
            details: err.message
        });
    }
});

module.exports = router;

