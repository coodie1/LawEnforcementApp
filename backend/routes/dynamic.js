const router = require('express').Router();
// Import the master dictionary of all our Mongoose models
const models = require('../models/allSchemas');

// === HELPER FUNCTION ===
// Safely get the correct Model based on the collection name URL parameter
const getModel = (collectionName, res) => {
    const lowerCaseName = collectionName.toLowerCase();
    const Model = models[lowerCaseName];
    if (!Model) {
        // If the collection name doesn't exist in our master file, send an error
        res.status(404).json(`Error: Collection/Model '${collectionName}' not found.`);
        return null;
    }
    return Model;
};


// ==========================================
//  NEW: SCHEMA DEFINITION ENDPOINT
// ==========================================
// GET /api/dynamic/:collectionName/schema
// Tells the frontend what fields exist and what type they are (String, Date, Number)
router.route('/:collectionName/schema').get((req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        // Look at the Mongoose schema paths to figure out fields and types
        const schemaPaths = Model.schema.paths;
        const fields = [];

        for (const key in schemaPaths) {
            // Skip internal Mongoose fields that users shouldn't edit directly
            if (key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') {
                continue;
            }
            
            // Get the type name (e.g., 'String', 'Date', 'Number')
            const pathType = schemaPaths[key].instance;
            
            fields.push({
                name: key,
                type: pathType,
                required: schemaPaths[key].isRequired || false
            });
        }

        res.json(fields);
    } catch (err) {
        res.status(400).json('Error fetching schema: ' + err.message);
    }
});


// ==========================================
//  THE "MATH" SECTION (Aggregation Pipeline)
// ==========================================
// POST /api/dynamic/:collectionName/math/group-by
router.route('/:collectionName/math/group-by').post(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    const groupByField = req.body.groupByField;
    if (!groupByField) return res.status(400).json("Error: Missing 'groupByField'.");

    try {
        const report = await Model.aggregate([
            { $group: { _id: "$" + groupByField, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(report);
    } catch (err) { res.status(400).json('Aggregation Error: ' + err.message); }
});


// ==========================================
//  THE UNIVERSAL Mongoose CRUD SECTION
// ==========================================

// --- READ (GET ALL) ---
router.route('/:collectionName').get(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        const data = await Model.find().sort({ createdAt: -1 }).limit(200);
        res.json(data);
    } catch (err) { res.status(400).json('Error fetching data: ' + err.message); }
});

// --- CREATE (POST) ---
router.route('/:collectionName').post(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        const newItem = new Model(req.body);
        const savedItem = await newItem.save();
        res.json({ message: 'Document created successfully!', result: savedItem });
    } catch (err) { 
        res.status(400).json('Validation Error: ' + err.message); 
    }
});

// --- UPDATE (PUT) ---
router.route('/:collectionName/:id').put(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        const updatedItem = await Model.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true }
        );
        if (!updatedItem) return res.status(404).json('Document not found.');
        res.json({ message: 'Document updated successfully!', result: updatedItem });
    } catch (err) { res.status(400).json('Update Error: ' + err.message); }
});

// --- DELETE (DELETE) ---
router.route('/:collectionName/:id').delete(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        const deletedItem = await Model.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json('Document not found.');
        res.json({ message: 'Document deleted successfully!', result: deletedItem });
    } catch (err) { res.status(400).json('Delete Error: ' + err.message); }
});

module.exports = router;