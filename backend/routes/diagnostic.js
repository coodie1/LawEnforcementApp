const express = require('express');
const router = express.Router();
const models = require('../models/allSchemas');

// Diagnostic route to check case status values
router.get('/cases/status-check', async (req, res) => {
    try {
        // Get all cases with their status values
        const allCases = await models.cases.find({}, { status: 1, caseID: 1, _id: 0 }).lean();
        
        // Count by exact status value
        const statusCounts = {};
        allCases.forEach(c => {
            const status = c.status || 'null';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Count using different query methods
        const exactOpen = await models.cases.countDocuments({ status: "Open" });
        const exactOpenLower = await models.cases.countDocuments({ status: "open" });
        const exactOpenUpper = await models.cases.countDocuments({ status: "OPEN" });
        const regexOpen = await models.cases.countDocuments({ status: { $regex: /^open$/i } });
        const regexOpenPartial = await models.cases.countDocuments({ status: { $regex: /open/i } });
        
        // Get sample cases with different status values
        const samples = {};
        Object.keys(statusCounts).forEach(status => {
            const sample = allCases.find(c => c.status === status);
            if (sample) {
                samples[status] = {
                    caseID: sample.caseID,
                    status: sample.status,
                    statusLength: sample.status?.length,
                    statusTrimmed: sample.status?.trim(),
                    hasWhitespace: sample.status !== sample.status?.trim()
                };
            }
        });
        
        res.json({
            totalCases: allCases.length,
            statusDistribution: statusCounts,
            queryResults: {
                exactOpen: exactOpen,
                exactOpenLower: exactOpenLower,
                exactOpenUpper: exactOpenUpper,
                regexExactOpen: regexOpen,
                regexPartialOpen: regexOpenPartial
            },
            samples: samples,
            message: "Check the statusDistribution to see all unique status values in the database"
        });
    } catch (err) {
        console.error('Status check error:', err);
        res.status(500).json({ error: 'Error checking case statuses: ' + err.message });
    }
});

module.exports = router;

