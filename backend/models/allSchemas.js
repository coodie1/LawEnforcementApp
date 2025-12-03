const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const incidentSchema = new Schema({
    incidentID: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    crimeType: { type: String, required: true },
    date: { type: String, required: true },
    locationID: { type: String, required: true },
}, { strict: false, timestamps: true });

const personSchema = new Schema({
    personID: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    roles: { type: [String], required: true },
}, { strict: false, timestamps: true });

const arrestSchema = new Schema({
    arrestID: { type: String, required: true, unique: true },
    personID: { type: String, required: true },
    caseID: { type: String, required: true },
    date: { type: String, required: true },
    locationID: { type: String, required: true },
}, { strict: false, timestamps: true });

const chargeSchema = new Schema({
    chargeID: { type: String, required: true, unique: true },
    arrestID: { type: String, required: true },
    description: { type: String, required: true },
    isConvicted: { type: Boolean, required: true },
    statuteCode: { type: String, required: true },
}, { strict: false, timestamps: true });

const caseSchema = new Schema({
    caseID: { type: String, required: true, unique: true },
    incidentID: { type: String, required: true },
    leadOfficerID: { type: String, required: true },
    status: { type: String, required: true },
    openingDate: { type: String, required: true },
}, { strict: false, timestamps: true });

const departmentSchema = new Schema({
    departmentID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    locationID: { type: String, required: true },
    headOfficerID: { type: String, required: true },
}, { strict: false, timestamps: true });

const officerSchema = new Schema({
    officerID: { type: String, required: true, unique: true },
    badgeNumber: { type: String, required: true },
    departmentID: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
}, { strict: false, timestamps: true });

const locationSchema = new Schema({
    locationID: { type: String, required: true, unique: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    coordinates: { type: [Number] }, // [latitude, longitude]
}, { strict: false, timestamps: true });

const evidenceSchema = new Schema({
    evidenceID: { type: String, required: true, unique: true },
    caseID: { type: String, required: true },
    description: { type: String, required: true },
    storageLocation: { type: String, required: true },
    type: { type: String, required: true },
}, { strict: false, timestamps: true });

const forensicSchema = new Schema({
    forensicsID: { type: String, required: true, unique: true },
    evidenceID: { type: String, required: true },
    caseID: { type: String, required: true },
    analysisType: { type: String, required: true },
    dateAnalyzed: { type: String, required: true },
}, { strict: false, timestamps: true });

const reportSchema = new Schema({
    reportID: { type: String, required: true, unique: true },
    caseID: { type: String, required: true },
    authorID: { type: String, required: true },
    dateFiled: { type: String, required: true },
    reportType: { type: String, required: true },
}, { strict: false, timestamps: true });

const prisonSchema = new Schema({
    prisonID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    locationID: { type: String, required: true },
    securityLevel: { type: String, required: true },
}, { strict: false, timestamps: true });

const sentenceSchema = new Schema({
    sentenceID: { type: String, required: true, unique: true },
    caseID: { type: String, required: true },
    personID: { type: String, required: true },
    duration: { type: String, required: true },
    type: { type: String, required: true },
}, { strict: false, timestamps: true });

const vehicleSchema = new Schema({
    vehicleID: { type: String, required: true, unique: true },
    caseID: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true },
}, { strict: false, timestamps: true });

const weaponSchema = new Schema({
    weaponID: { type: String, required: true, unique: true },
    incidentID: { type: String, required: true },
    ownerID: { type: String, required: true },
    serialNumber: { type: String, required: true },
    type: { type: String, required: true },
}, { strict: false, timestamps: true });

const userSchema = new Schema({
    username: { type: String, required: false, sparse: true }, // Removed unique constraint - email is the unique identifier
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'officer', 'analyst'], default: 'officer', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    badgeNumber: { type: String },
    email: { type: String, required: true, unique: true },
    temporaryPassword: { type: Boolean, default: false },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
}, { strict: false, timestamps: true });

const activityLogSchema = new Schema({
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true, enum: ['create', 'update', 'delete'] },
    entityType: { type: String, required: true }, // e.g., 'cases', 'arrests', 'evidence'
    entityId: { type: String, required: true },
    entityName: { type: String }, // Human-readable name/identifier (e.g., caseID, arrestID)
    changes: { type: Schema.Types.Mixed }, // Store changed fields for updates
    ipAddress: { type: String },
    userAgent: { type: String },
}, { strict: false, timestamps: true });


// ==============================================================================
//  CREATE MODELS & EXPORT AS A DICTIONARY
// ==============================================================================
// We map the lowercase, plural collection name to its corresponding Mongoose Model.
const models = {
    incidents: mongoose.model('Incident', incidentSchema, 'incidents'),
    people: mongoose.model('Person', personSchema, 'people'),
    arrests: mongoose.model('Arrest', arrestSchema, 'arrests'),
    charges: mongoose.model('Charge', chargeSchema, 'charges'),
    cases: mongoose.model('Case', caseSchema, 'cases'),
    departments: mongoose.model('Department', departmentSchema, 'departments'),
    officers: mongoose.model('Officer', officerSchema, 'officers'),
    locations: mongoose.model('Location', locationSchema, 'locations'),
    evidence: mongoose.model('Evidence', evidenceSchema, 'evidence'), // Explicitly use 'evidence' (singular) collection
    forensics: mongoose.model('Forensic', forensicSchema, 'forensics'), // Note: schema uses 'forensicsID' but model name is 'Forensic'
    reports: mongoose.model('Report', reportSchema, 'reports'),
    prisons: mongoose.model('Prison', prisonSchema, 'prisons'),
    sentences: mongoose.model('Sentence', sentenceSchema, 'sentences'),
    vehicles: mongoose.model('Vehicle', vehicleSchema, 'vehicles'),
    weapons: mongoose.model('Weapon', weaponSchema, 'weapons'),
    users: mongoose.model('User', userSchema, 'users'),
    activitylogs: mongoose.model('ActivityLog', activityLogSchema, 'activitylogs'),
};

module.exports = models;