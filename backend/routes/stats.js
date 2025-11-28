const express = require('express');
const router = express.Router();
const models = require('../models/allSchemas');

router.get('/dashboard', async (req, res) => {
    try {
        // Parallel execution for performance
        const [
            activeCases,
            totalArrests,
            convictedCount,
            totalPeople,
            arrestsByLocationData,
            crimeTypeData
        ] = await Promise.all([
            // Case-insensitive match for active cases (Open, open, Under Investigation, etc.)
            models.cases.countDocuments({ 
                $or: [
                    { status: { $regex: /^open$/i } },
                    { status: { $regex: /under.*investigation/i } },
                    { status: { $regex: /pending/i } }
                ]
            }),
            models.arrests.countDocuments(),
            // Case-insensitive match for closed cases
            models.cases.countDocuments({ status: { $regex: /^closed$/i } }),
            models.people.countDocuments(),
            models.arrests.aggregate([
                { $group: { _id: "$locationID", count: { $sum: 1 } } },
                { $limit: 5 } // Top 5 locations
            ]),
            models.incidents.aggregate([
                { $group: { _id: "$crimeType", count: { $sum: 1 } } },
                { $limit: 5 } // Top 5 crime types
            ])
        ]);

        // Format aggregation results
        const arrestsByLocation = arrestsByLocationData.map(item => ({
            location: item._id || 'Unknown',
            count: item.count
        }));

        const crimeTypeDistribution = crimeTypeData.map(item => ({
            type: item._id || 'Unknown',
            count: item.count
        }));

        res.json({
            activeCases,
            totalArrests,
            convictedCount,
            totalPeople,
            arrestsByLocation,
            crimeTypeDistribution
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

module.exports = router;
