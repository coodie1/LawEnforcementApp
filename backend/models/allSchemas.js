const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ==============================================================================
//  DEFINE ALL 15 SCHEMAS
// ==============================================================================
// We use 'strict: false' for flexibility, so fields not defined here won't cause errors.
// 'timestamps: true' automatically adds 'createdAt' and 'updatedAt' fields.

const incidentSchema = new Schema({
    incidentID: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    crimeType: { type: String, required: true },
    date: { type: Date, required: true },
    locationID: { type: String },
}, { strict: false, timestamps: true });

const personSchema = new Schema({
    personID: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    contactInfo: { type: String },
    address: { type: String },
}, { strict: false, timestamps: true });

const arrestSchema = new Schema({
    arrestID: { type: String, required: true, unique: true },
    personID: { type: String, required: true },
    incidentID: { type: String, required: true },
    date: { type: Date, required: true },
    charges: { type: String },
    officerID: { type: String },
}, { strict: false, timestamps: true });

const chargeSchema = new Schema({
    chargeID: { type: String, required: true, unique: true },
    arrestID: { type: String, required: true },
    crimeType: { type: String, required: true },
    description: { type: String },
    severity: { type: String },
}, { strict: false, timestamps: true });

const caseSchema = new Schema({
    caseID: { type: String, required: true, unique: true },
    incidentID: { type: String, required: true },
    status: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    court: { type: String },
    judge: { type: String },
}, { strict: false, timestamps: true });

const departmentSchema = new Schema({
    departmentID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    locationID: { type: String },
    headOfficerID: { type: String },
}, { strict: false, timestamps: true });

const officerSchema = new Schema({
    officerID: { type: String, required: true, unique: true },
    personID: { type: String, required: true },
    badgeNumber: { type: String, required: true },
    departmentID: { type: String },
    rank: { type: String },
    startDate: { type: Date },
}, { strict: false, timestamps: true });

const locationSchema = new Schema({
    locationID: { type: String, required: true, unique: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
}, { strict: false, timestamps: true });

const evidenceSchema = new Schema({
    evidenceID: { type: String, required: true, unique: true },
    incidentID: { type: String },
    description: { type: String },
    collectionDate: { type: Date },
    collectedByOfficerID: { type: String },
    locationID: { type: String },
    type: { type: String },
}, { strict: false, timestamps: true });

const forensicSchema = new Schema({
    forensicID: { type: String, required: true, unique: true },
    evidenceID: { type: String, required: true },
    analysisDate: { type: Date },
    analystName: { type: String },
    results: { type: String },
    labReportID: { type: String },
}, { strict: false, timestamps: true });

const reportSchema = new Schema({
    reportID: { type: String, required: true, unique: true },
    incidentID: { type: String },
    reportingOfficerID: { type: String },
    dateCreated: { type: Date },
    content: { type: String },
    type: { type: String },
}, { strict: false, timestamps: true });

const prisonSchema = new Schema({
    prisonID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    locationID: { type: String },
    capacity: { type: Number },
    warden: { type: String },
}, { strict: false, timestamps: true });

const sentenceSchema = new Schema({
    sentenceID: { type: String, required: true, unique: true },
    caseID: { type: String, required: true },
    personID: { type: String, required: true },
    prisonID: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    terms: { type: String },
}, { strict: false, timestamps: true });

const vehicleSchema = new Schema({
    vehicleID: { type: String, required: true, unique: true },
    make: { type: String },
    model: { type: String },
    year: { type: Number },
    color: { type: String },
    licensePlate: { type: String },
    ownerPersonID: { type: String },
}, { strict: false, timestamps: true });

const weaponSchema = new Schema({
    weaponID: { type: String, required: true, unique: true },
    type: { type: String },
    make: { type: String },
    model: { type: String },
    serialNumber: { type: String },
    associatedEvidenceID: { type: String },
}, { strict: false, timestamps: true });

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['officer', 'public'], default: 'public', required: true },
    firstName: { type: String },
    lastName: { type: String },
    badgeNumber: { type: String },
    email: { type: String },
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
    forensics: mongoose.model('Forensic', forensicSchema, 'forensics'),
    reports: mongoose.model('Report', reportSchema, 'reports'),
    prisons: mongoose.model('Prison', prisonSchema, 'prisons'),
    sentences: mongoose.model('Sentence', sentenceSchema, 'sentences'),
    vehicles: mongoose.model('Vehicle', vehicleSchema, 'vehicles'),
    weapons: mongoose.model('Weapon', weaponSchema, 'weapons'),
    users: mongoose.model('User', userSchema, 'users'),
};

module.exports = models;