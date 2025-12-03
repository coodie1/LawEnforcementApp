const models = require('../models/allSchemas');
const ActivityLog = models.activitylogs;

/**
 * Middleware to log user activities (create, update, delete operations)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logActivity = async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override res.json to capture response data
    res.json = function(data) {
        // Call original json method
        originalJson(data);
        
        // Log activity asynchronously (don't block response)
        setImmediate(async () => {
            try {
                // Only log if user is authenticated and operation was successful
                if (req.userId && res.statusCode >= 200 && res.statusCode < 300) {
                    const action = getActionFromMethod(req.method);
                    const entityType = req.params.collectionName || getEntityTypeFromPath(req.path);
                    
                    if (!action || !entityType) {
                        return; // Skip logging if we can't determine action or entity type
                    }
                    
                    // Get user info
                    const User = models.users;
                    const user = await User.findById(req.userId);
                    if (!user) return;
                    
                    // Extract entity identifier from response or request
                    let entityId = req.params.id || data?.result?._id || data?.result?.id || data?.data?.arrest?._id || data?.data?.charge?._id;
                    let entityName = null;
                    
                    // Try to get a human-readable identifier (e.g., caseID, arrestID)
                    if (data?.result) {
                        const result = data.result;
                        // Common ID fields
                        entityName = result.caseID || result.arrestID || result.evidenceID || 
                                    result.forensicsID || result.reportID || result.personID || 
                                    result.officerID || result.departmentID || result.locationID ||
                                    result.chargeID || result.incidentID || result.prisonID ||
                                    result.sentenceID || result.vehicleID || result.weaponID ||
                                    result._id || result.id;
                    } else if (data?.data) {
                        // Handle arrest registration response structure
                        const arrestData = data.data;
                        if (arrestData.arrest) {
                            entityName = arrestData.arrest.arrestID || arrestData.arrest._id;
                            entityId = arrestData.arrest._id || entityId;
                        }
                    } else if (data?.user) {
                        // Handle user creation/update response
                        entityName = data.user.email || data.user.id;
                        entityId = data.user.id || entityId;
                    }
                    
                    // For updates, capture changed fields
                    let changes = null;
                    if (action === 'update' && req.body) {
                        // Store relevant changed fields (exclude sensitive data)
                        const sensitiveFields = ['password', 'token', 'secret'];
                        changes = {};
                        for (const key in req.body) {
                            if (!sensitiveFields.includes(key.toLowerCase())) {
                                changes[key] = req.body[key];
                            }
                        }
                    }
                    
                    // Create activity log entry
                    await ActivityLog.create({
                        userId: req.userId.toString(),
                        userEmail: user.email || 'unknown',
                        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                        action: action,
                        entityType: entityType,
                        entityId: entityId?.toString() || 'unknown',
                        entityName: entityName?.toString() || null,
                        changes: changes,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('user-agent') || 'unknown',
                    });
                }
            } catch (err) {
                // Don't let logging errors break the application
                console.error('Activity log error:', err.message);
            }
        });
    };
    
    next();
};

/**
 * Helper function to determine action from HTTP method
 */
function getActionFromMethod(method) {
    switch (method.toUpperCase()) {
        case 'POST':
            return 'create';
        case 'PUT':
        case 'PATCH':
            return 'update';
        case 'DELETE':
            return 'delete';
        default:
            return null;
    }
}

/**
 * Helper function to extract entity type from request path
 */
function getEntityTypeFromPath(path) {
    // Extract collection name from paths like /api/dynamic/cases or /api/arrest/register
    const match = path.match(/\/(cases|arrests|evidence|forensics|reports|prisons|sentences|vehicles|weapons|officers|departments|people|incidents|locations|charges|users|arrest)/i);
    if (match) {
        const entityType = match[1].toLowerCase();
        // Normalize 'arrest' to 'arrests' for consistency
        return entityType === 'arrest' ? 'arrests' : entityType;
    }
    return null;
}

module.exports = { logActivity };

