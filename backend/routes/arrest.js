const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const models = require('../models/allSchemas');

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
// Registers a new arrest with transaction support
router.post('/register', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

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
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: personID, caseID, arrestDate, locationID, chargeDescription, statuteCode' 
            });
        }

        // Verify person exists
        const person = await models.people.findOne({ personID }).session(session);
        if (!person) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: 'Person not found' });
        }

        // Verify case exists and is open
        const caseDoc = await models.cases.findOne({ caseID, status: { $regex: /^open$/i } }).session(session);
        if (!caseDoc) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: 'Case not found or not open' });
        }

        // Verify location exists
        const location = await models.locations.findOne({ locationID }).session(session);
        if (!location) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: 'Location not found' });
        }

        // Get existing IDs to generate unique ones
        const existingArrestIDs = await models.arrests.distinct('arrestID', {}, { session });
        const existingChargeIDs = await models.charges.distinct('chargeID', {}, { session });

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
        await newArrest.save({ session });

        // Step 2: Insert charge document
        const newCharge = new models.charges({
            chargeID,
            arrestID,
            description: chargeDescription,
            statuteCode,
            isConvicted: Boolean(isConvicted)
        });
        await newCharge.save({ session });

        // Step 3: Update case status to "open"
        await models.cases.updateOne(
            { caseID },
            { $set: { status: 'open' } },
            { session }
        );

        // Step 4: Update person roles to include "suspect" if not already present
        const currentRoles = person.roles || [];
        if (!currentRoles.includes('suspect')) {
            await models.people.updateOne(
                { personID },
                { $set: { roles: [...currentRoles, 'suspect'] } },
                { session }
            );
        }

        // Auto-create indexes (non-blocking, outside transaction)
        const indexPromises = [
            models.arrests.collection.createIndex({ personID: 1 }, { background: true }).catch(() => {}),
            models.arrests.collection.createIndex({ caseID: 1 }, { background: true }).catch(() => {}),
            models.arrests.collection.createIndex({ locationID: 1 }, { background: true }).catch(() => {}),
            models.charges.collection.createIndex({ arrestID: 1 }, { background: true }).catch(() => {}),
        ];
        Promise.all(indexPromises).catch(() => {}); // Fire and forget

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.json({
            success: true,
            message: 'Arrest successfully registered',
            data: {
                arrest: newArrest,
                charge: newCharge
            }
        });

    } catch (err) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();
        
        console.error('Arrest registration error:', err);
        res.status(500).json({
            success: false,
            error: 'Transaction failed, no data saved',
            details: err.message
        });
    }
});

module.exports = router;

