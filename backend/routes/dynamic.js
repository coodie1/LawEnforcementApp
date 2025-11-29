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
//  HELPER: Auto-create indexes based on query patterns
// ==========================================
// LOGIC: This function analyzes the aggregation pipeline to identify which fields
// are being queried, sorted, or grouped, then creates indexes for those fields.
// 
// INDEX CREATION RULES:
// 1. $match (filtering): Creates ascending index (1) on all filtered fields
//    - Example: Filter by status="open" → Creates index on { status: 1 }
// 2. $sort (sorting): Creates index matching sort direction (1 or -1)
//    - Example: Sort by date DESC → Creates index on { date: -1 }
// 3. $group (grouping): Creates ascending index (1) on all grouped fields
//    - Example: Group by locationID → Creates index on { locationID: 1 }
//
// WHY: Indexes dramatically speed up queries. By creating them automatically
// based on actual usage patterns, we optimize performance without manual intervention.
//
// SAFETY: 
// - Runs in background (non-blocking)
// - MongoDB ignores duplicate indexes
// - Errors don't break the query
const ensureIndexes = async (Model, matchStage, sortStage, groupBy) => {
    try {
        const indexesToCreate = [];
        
        // RULE 1: Index fields used in $match (filtering)
        // When user filters by a field, create an index on that field
        // This makes future filter queries on that field much faster
        if (matchStage && Object.keys(matchStage).length > 0) {
            for (const field of Object.keys(matchStage)) {
                // Skip _id (already indexed by MongoDB by default)
                // Skip MongoDB operators like $or, $and, $nor, $not, etc.
                if (field !== '_id' && !field.startsWith('$')) {
                    const fieldValue = matchStage[field];
                    // Only create index if it's not a MongoDB operator object
                    // (e.g., skip { $or: [...] }, { $regex: ... }, etc.)
                    if (typeof fieldValue !== 'object' || fieldValue === null || Array.isArray(fieldValue)) {
                        // Create ascending index for filtered fields
                        indexesToCreate.push({ [field]: 1 });
                    } else if (typeof fieldValue === 'object' && !fieldValue.$or && !fieldValue.$and && !fieldValue.$nor && !fieldValue.$not) {
                        // It's a simple operator object like { $regex: ... }, create index on the field
                        // But skip complex operators
                        indexesToCreate.push({ [field]: 1 });
                    }
                }
            }
        }
        
        // RULE 2: Index fields used in $sort (sorting)
        // When user sorts by a field, create an index matching the sort direction
        // This allows MongoDB to use the index for sorting instead of scanning all documents
        if (sortStage && Object.keys(sortStage).length > 0) {
            for (const field of Object.keys(sortStage)) {
                // Skip _id (already indexed) and count (aggregation result, not a document field)
                if (field !== '_id' && field !== 'count') {
                    // Create index matching sort direction (1 for ASC, -1 for DESC)
                    indexesToCreate.push({ [field]: sortStage[field] });
                }
            }
        }
        
        // RULE 3: Index fields used in $group (grouping)
        // When user groups by a field, create an index on that field
        // This speeds up the grouping operation
        if (groupBy && groupBy.length > 0) {
            for (const field of groupBy) {
                // Skip _id (already indexed)
                if (field !== '_id') {
                    // Create ascending index for grouped fields
                    indexesToCreate.push({ [field]: 1 });
                }
            }
        }
        
        // Create all identified indexes
        // MongoDB will automatically ignore if index already exists
        for (const indexSpec of indexesToCreate) {
            try {
                // background: true = non-blocking, doesn't lock the collection
                await Model.collection.createIndex(indexSpec, { background: true });
                console.log(`Auto-created index on ${Model.modelName}:`, indexSpec);
            } catch (indexErr) {
                // Index might already exist, ignore that error
                if (!indexErr.message.includes('already exists')) {
                    console.warn(`Index creation warning for ${Model.modelName}:`, indexErr.message);
                }
            }
        }
    } catch (err) {
        // Don't fail the request if index creation fails
        // Index creation is a performance optimization, not critical for functionality
        console.warn('Index creation error (non-fatal):', err.message);
    }
};

// ==========================================
//  DYNAMIC AGGREGATION BUILDER
// ==========================================
// POST /api/dynamic/:collectionName/aggregate
// Builds MongoDB aggregation pipeline from frontend filters
// Automatically creates indexes based on query patterns
router.route('/:collectionName/aggregate').post(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        const {
            match = {},           // Filter conditions: { field: value, dateRange: {...} }
            groupBy = [],         // Array of fields to group by: ["status", "locationID"]
            groupFields = {},     // Additional fields to include in $group: { totalAmount: { $sum: "$amount" } }
            sort = {},            // Sort: { field: "count", order: -1 }
            limit = null,         // Limit results
            project = null,       // Project specific fields
            lookup = []           // Lookup joins: [{ from: "collection", localField: "field", foreignField: "field", as: "alias" }]
        } = req.body;

        const pipeline = [];
        let matchStage = null;
        let sortStage = null;

        // Stage 1: $match - Apply filters (only non-nested fields)
        // Nested fields (with dots like "incident.crimeType") will be matched after lookups
        const nestedMatchFields = {};
        if (Object.keys(match).length > 0) {
            matchStage = {};
            
            for (const [key, value] of Object.entries(match)) {
                // Store nested fields (with dots) for after lookups
                // These reference fields from joined collections (e.g., "incident.crimeType")
                if (key.includes('.') && !key.startsWith('$')) {
                    nestedMatchFields[key] = value;
                    continue;
                }
                
                // Handle MongoDB operators ($or, $and, $nor, etc.) - pass through as-is
                if (key.startsWith('$')) {
                    matchStage[key] = value;
                    continue;
                }
                
                if (key === 'dateRange') {
                    // Handle date range filtering (for Date fields)
                    const { field, start, end } = value;
                    if (field && (start || end)) {
                        matchStage[field] = {};
                        if (start) {
                            matchStage[field].$gte = new Date(start);
                        }
                        if (end) {
                            matchStage[field].$lte = new Date(end);
                        }
                    }
                } else if (key === 'openingDate' || key === 'date' || key === 'dateOfBirth' || key === 'dateFiled' || key === 'dateAnalyzed') {
                    // Handle string date fields - dates are stored as strings in database
                    // Support both exact match and regex patterns
                    if (typeof value === 'object' && value !== null && value.$regex) {
                        // Already a regex object, use it directly
                        matchStage[key] = value;
                    } else if (typeof value === 'string') {
                        // Use regex to match date string (handles different formats like YYYY-MM-DD, MM/DD/YYYY, etc.)
                        // Escape special regex characters and match the date pattern
                        const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        matchStage[key] = { $regex: escapedValue, $options: 'i' };
                    } else {
                        matchStage[key] = value;
                    }
                } else if (Array.isArray(value)) {
                    // Handle array filters (e.g., multiple status values)
                    matchStage[key] = { $in: value };
                } else if (typeof value === 'object' && value !== null) {
                    // Handle MongoDB operators (e.g., { $regex: "...", $options: "i" })
                    matchStage[key] = value;
                } else {
                    // Simple equality match
                    matchStage[key] = value;
                }
            }
            
            // Only add initial match for non-nested fields
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
        }

        // Stage 2: $lookup - Join with other collections
        if (Array.isArray(lookup) && lookup.length > 0) {
            for (const join of lookup) {
                const LookupModel = models[join.from.toLowerCase()];
                if (LookupModel) {
                    pipeline.push({
                        $lookup: {
                            from: join.from,
                            localField: join.localField,
                            foreignField: join.foreignField,
                            as: join.as || join.from
                        }
                    });
                    // Unwind the lookup result to make it an object instead of array
                    // This allows us to match on nested fields like "incident.crimeType"
                    pipeline.push({
                        $unwind: {
                            path: `$${join.as || join.from}`,
                            preserveNullAndEmptyArrays: true
                        }
                    });
                }
            }
        }

        // Stage 2.5: $match on nested fields (after lookups)
        // This handles fields like "incident.crimeType" that reference looked-up data
        if (Object.keys(nestedMatchFields).length > 0) {
            pipeline.push({ $match: nestedMatchFields });
        }

        // Stage 3: $group - Group by fields
        if (groupBy.length > 0 || Object.keys(groupFields).length > 0) {
            const groupStage = { _id: {} };
            
            // Build _id object for grouping
            if (groupBy.length === 1) {
                groupStage._id = `$${groupBy[0]}`;
            } else if (groupBy.length > 1) {
                groupBy.forEach(field => {
                    groupStage._id[field] = `$${field}`;
                });
            } else {
                // If no groupBy but has groupFields, group all together
                groupStage._id = null;
            }

            // Add count by default
            groupStage.count = { $sum: 1 };

            // Add custom group fields
            Object.assign(groupStage, groupFields);

            pipeline.push({ $group: groupStage });
        }

        // Stage 4: $project - Select specific fields
        if (project) {
            pipeline.push({ $project: project });
        }

        // Stage 5: $sort - Sort results
        if (Object.keys(sort).length > 0) {
            sortStage = {};
            if (sort.field) {
                sortStage[sort.field] = sort.order === 1 ? 1 : -1;
            } else {
                // Sort by all keys in sort object
                Object.assign(sortStage, sort);
            }
            pipeline.push({ $sort: sortStage });
        }

        // Stage 6: $limit - Limit results
        if (limit && limit > 0) {
            pipeline.push({ $limit: parseInt(limit) });
        }

        // Auto-create indexes based on query pattern (async, non-blocking)
        // Only create indexes if there are actual user filters or sorts applied
        // Skip index creation for:
        // - Option fetching queries (groupBy without filters)
        // - Empty queries (no match, no sort, no meaningful groupBy)
        const hasFilters = matchStage && Object.keys(matchStage).length > 0;
        const hasSort = sortStage && Object.keys(sortStage).length > 0;
        const hasGroup = Array.isArray(groupBy) && groupBy.length > 0;
        
        // Only create indexes when:
        // 1. User has applied filters (match stage)
        // 2. User has applied sorting (sort stage)
        // 3. User has grouped WITH filters (not just fetching unique values)
        // Skip: groupBy-only queries (used for fetching filter dropdown options)
        if (hasFilters || hasSort) {
            ensureIndexes(Model, matchStage, sortStage, groupBy).catch(err => {
                console.warn('Background index creation failed:', err.message);
            });
        } else if (hasGroup && hasFilters) {
            // Only create index for groupBy if there are also filters
            ensureIndexes(Model, matchStage, sortStage, groupBy).catch(err => {
                console.warn('Background index creation failed:', err.message);
            });
        }
        // Otherwise, skip index creation (likely just fetching options)

        // Execute aggregation
        const results = await Model.aggregate(pipeline);
        res.json({ results, pipeline: pipeline }); // Return both results and pipeline for debugging
    } catch (err) {
        console.error('Aggregation error:', err);
        res.status(400).json({ error: 'Aggregation Error: ' + err.message });
    }
});

// ==========================================
//  INDEX CREATION ENDPOINT
// ==========================================
// POST /api/dynamic/:collectionName/index
// Creates indexes on specified fields
router.route('/:collectionName/index').post(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        const { fields, options = {} } = req.body;
        
        if (!fields || !Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({ error: "Fields array is required" });
        }

        // Build index specification
        const indexSpec = {};
        fields.forEach(field => {
            if (typeof field === 'string') {
                indexSpec[field] = 1; // Ascending by default
            } else if (typeof field === 'object') {
                Object.assign(indexSpec, field);
            }
        });

        // Create index
        const indexName = await Model.collection.createIndex(indexSpec, options);
        
        res.json({ 
            message: 'Index created successfully', 
            indexName,
            fields: indexSpec,
            options 
        });
    } catch (err) {
        console.error('Index creation error:', err);
        res.status(400).json({ error: 'Index Creation Error: ' + err.message });
    }
});

// ==========================================
//  GET INDEXES ENDPOINT
// ==========================================
// GET /api/dynamic/:collectionName/indexes
// Returns all indexes for a collection
router.route('/:collectionName/indexes').get(async (req, res) => {
    const Model = getModel(req.params.collectionName, res);
    if (!Model) return;

    try {
        const indexes = await Model.collection.indexes();
        res.json({ indexes });
    } catch (err) {
        res.status(400).json({ error: 'Error fetching indexes: ' + err.message });
    }
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