const router = require('express').Router();
// Import the blueprint we just created
let Incident = require('../models/Incident');

// --- NEW ADVANCED ROUTE: Aggregation Report ---
// Action: Count incidents grouped by their crimeType
// URL: localhost:5000/api/incidents/report/count-by-type
router.route('/report/count-by-type').get(async (req, res) => {
    try {
        // This is the MongoDB Aggregation Pipeline
        const report = await Incident.aggregate([
            {
                // Step 1: Group documents together by the 'crimeType' field
                $group: {
                    _id: "$crimeType", // The field to group by
                    count: { $sum: 1 }  // For each match, add 1 to a 'count' total
                }
            },
            {
                // Step 2: (Optional) Sort them by count in descending order (biggest first)
                $sort: { count: -1 }
            }
        ]);

        res.json(report);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});
// ---------------------------------------------



// Action 1: GET ALL Incidents
// This handles requests to the main door of this service window (e.g., /api/incidents/)
router.route('/').get(async (req, res) => {
    try {
        // Ask the librarian to find ALL documents using the Incident blueprint
        const incidents = await Incident.find();
        // If successful, send the list back as JSON
        res.json(incidents);
    } catch (err) {
        // If something goes wrong, send an error message
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;
// ... existing GET route code above ...

// Action 2: CREATE a New Incident (POST)
// This handles POST requests to /api/incidents/
router.route('/').post(async (req, res) => {
    try {
        // 1. Get the new data out of the request body
        const incidentID = req.body.incidentID;
        const title = req.body.title;
        const crimeType = req.body.crimeType;
        const date = Date.parse(req.body.date); // Convert string date to real Date
        const locationID = req.body.locationID;

        // 2. Create a new Incident "book" using our blueprint
        const newIncident = new Incident({
            incidentID,
            title,
            crimeType,
            date,
            locationID,
        });

        // 3. Save the new book to the library shelves (database)
        await newIncident.save();

        // 4. Send a success message back
        res.json('Incident added successfully!');

    } catch (err) {
        // If there's an error (like a duplicate incidentID), send it back
        res.status(400).json('Error: ' + err);
    }
});

// --- Place the new code ABOVE this line ---
module.exports = router;