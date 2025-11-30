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
            crimeTypeData,
            caseStatusData
        ] = await Promise.all([
            // Case-insensitive match for active cases (only Open)
            models.cases.countDocuments({ 
                status: { $regex: /^open$/i }
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
            ]),
            models.cases.aggregate([
                // Normalize status to lowercase before grouping
                {
                    $project: {
                        normalizedStatus: {
                            $cond: {
                                if: { $eq: [{ $toLower: "$status" }, "open"] },
                                then: "open",
                                else: {
                                    $cond: {
                                        if: { $eq: [{ $toLower: "$status" }, "closed"] },
                                        then: "closed",
                                        else: null
                                    }
                                }
                            }
                        }
                    }
                },
                // Filter out null statuses (non-open/closed)
                { $match: { normalizedStatus: { $ne: null } } },
                // Group by normalized status
                { $group: { _id: "$normalizedStatus", count: { $sum: 1 } } }
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

        // Format case status distribution - capitalize first letter
        const caseStatusDistribution = caseStatusData.map(item => {
            const status = item._id || 'Unknown';
            // Capitalize first letter: "open" -> "Open", "closed" -> "Closed"
            const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            return {
                status: normalizedStatus,
                count: item.count
            };
        }).filter(item => item.status === 'Open' || item.status === 'Closed');

        res.json({
            activeCases,
            totalArrests,
            convictedCount,
            totalPeople,
            arrestsByLocation,
            crimeTypeDistribution,
            caseStatusDistribution
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

module.exports = router;
