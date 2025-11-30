# Database Design
## Law Enforcement Management System

---

## Data Model

The system implements a comprehensive data model that represents essential entities in a law enforcement environment. The primary entities include 15 interconnected collections that manage cases, arrests, officers, evidence, and related information. The database uses MongoDB (NoSQL) with Mongoose ODM for schema management, allowing flexible document structures while maintaining data integrity through relationships and transactions.

---

## Entity Definitions

### 1. **Incidents**

- **Purpose**: Records of crime incidents that occur
- **Primary Key**: `incidentID` (String, unique, required)
- **Fields**:
  - `incidentID`: Unique identifier for the incident
  - `title`: Title/description of the incident (String, required)
  - `crimeType`: Type of crime committed (String, required)
  - `date`: Date when the incident occurred (String, required)
  - `locationID`: Reference to location where incident occurred (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - One-to-Many with **Cases** (one incident can have multiple cases)
  - Many-to-One with **Locations** (multiple incidents can occur at same location)
  - One-to-Many with **Weapons** (incidents can involve multiple weapons)

---

### 2. **Cases**

- **Purpose**: Criminal cases opened from incidents
- **Primary Key**: `caseID` (String, unique, required)
- **Fields**:
  - `caseID`: Unique identifier for the case
  - `incidentID`: Reference to the related incident (String, required)
  - `leadOfficerID`: Reference to the officer leading the case (String, required)
  - `status`: Case status - "open" or "closed" (String, required)
  - `openingDate`: Date when case was opened (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Incidents** (cases originate from incidents)
  - Many-to-One with **Officers** (each case has a lead officer)
  - One-to-Many with **Arrests** (one case can have multiple arrests)
  - One-to-Many with **Evidence** (cases can have multiple evidence items)
  - One-to-Many with **Forensics** (cases can have multiple forensic analyses)
  - One-to-Many with **Reports** (cases can have multiple reports)
  - One-to-Many with **Vehicles** (cases can involve multiple vehicles)
  - One-to-Many with **Sentences** (cases can result in multiple sentences)

---

### 3. **Arrests**

- **Purpose**: Records of arrests made in connection with cases
- **Primary Key**: `arrestID` (String, unique, required)
- **Fields**:
  - `arrestID`: Unique identifier for the arrest
  - `personID`: Reference to the person arrested (String, required)
  - `caseID`: Reference to the related case (String, required)
  - `date`: Date of the arrest (String, required)
  - `locationID`: Reference to location where arrest occurred (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **People** (arrests involve people)
  - Many-to-One with **Cases** (arrests are linked to cases)
  - Many-to-One with **Locations** (arrests occur at locations)
  - One-to-Many with **Charges** (one arrest can have multiple charges)

---

### 4. **Charges**

- **Purpose**: Criminal charges filed against arrested individuals
- **Primary Key**: `chargeID` (String, unique, required)
- **Fields**:
  - `chargeID`: Unique identifier for the charge
  - `arrestID`: Reference to the related arrest (String, required)
  - `description`: Description of the charge (String, required)
  - `isConvicted`: Whether the person was convicted (Boolean, required)
  - `statuteCode`: Legal statute code for the charge (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Arrests** (charges are filed for arrests)

---

### 5. **People**

- **Purpose**: Records of individuals involved in the system (suspects, witnesses, victims)
- **Primary Key**: `personID` (String, unique, required)
- **Fields**:
  - `personID`: Unique identifier for the person
  - `firstName`: First name of the person (String, required)
  - `lastName`: Last name of the person (String, required)
  - `dateOfBirth`: Date of birth (String, required)
  - `roles`: Array of roles (e.g., "suspect", "witness", "victim") (Array of Strings, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - One-to-Many with **Arrests** (people can have multiple arrests)
  - One-to-Many with **Sentences** (people can receive multiple sentences)
  - One-to-Many with **Weapons** (people can own multiple weapons)

---

### 6. **Officers**

- **Purpose**: Law enforcement officer records
- **Primary Key**: `officerID` (String, unique, required)
- **Fields**:
  - `officerID`: Unique identifier for the officer
  - `badgeNumber`: Officer's badge number (String, required)
  - `departmentID`: Reference to the officer's department (String, required)
  - `firstName`: First name of the officer (String, required)
  - `lastName`: Last name of the officer (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Departments** (officers belong to departments)
  - One-to-Many with **Cases** (officers can lead multiple cases)
  - One-to-Many with **Reports** (officers can author multiple reports)
  - One-to-One with **Departments** (one officer can be head of a department)

---

### 7. **Departments**

- **Purpose**: Law enforcement department/organization records
- **Primary Key**: `departmentID` (String, unique, required)
- **Fields**:
  - `departmentID`: Unique identifier for the department
  - `name`: Name of the department (String, required)
  - `locationID`: Reference to department location (String, required)
  - `headOfficerID`: Reference to the department head officer (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Locations** (departments are located at specific places)
  - One-to-Many with **Officers** (departments have multiple officers)
  - One-to-One with **Officers** (departments have one head officer)

---

### 8. **Locations**

- **Purpose**: Geographic location records
- **Primary Key**: `locationID` (String, unique, required)
- **Fields**:
  - `locationID`: Unique identifier for the location
  - `address`: Street address (String, optional)
  - `city`: City name (String, optional)
  - `state`: State name (String, optional)
  - `coordinates`: Geographic coordinates [latitude, longitude] (Array of Numbers, optional)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - One-to-Many with **Incidents** (locations can have multiple incidents)
  - One-to-Many with **Arrests** (locations can have multiple arrests)
  - One-to-Many with **Departments** (locations can have multiple departments)
  - One-to-Many with **Prisons** (locations can have multiple prisons)

---

### 9. **Evidence**

- **Purpose**: Physical evidence records collected in cases
- **Primary Key**: `evidenceID` (String, unique, required)
- **Fields**:
  - `evidenceID`: Unique identifier for the evidence
  - `caseID`: Reference to the related case (String, required)
  - `description`: Description of the evidence (String, required)
  - `storageLocation`: Where the evidence is stored (String, required)
  - `type`: Type of evidence (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Cases** (evidence is linked to cases)
  - One-to-Many with **Forensics** (evidence can have multiple forensic analyses)

---

### 10. **Forensics**

- **Purpose**: Forensic analysis records
- **Primary Key**: `forensicsID` (String, unique, required)
- **Fields**:
  - `forensicsID`: Unique identifier for the forensic analysis
  - `evidenceID`: Reference to the analyzed evidence (String, required)
  - `caseID`: Reference to the related case (String, required)
  - `analysisType`: Type of forensic analysis performed (String, required)
  - `dateAnalyzed`: Date when analysis was performed (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Evidence** (forensics analyze evidence)
  - Many-to-One with **Cases** (forensics are linked to cases)

---

### 11. **Reports**

- **Purpose**: Official reports filed in cases
- **Primary Key**: `reportID` (String, unique, required)
- **Fields**:
  - `reportID`: Unique identifier for the report
  - `caseID`: Reference to the related case (String, required)
  - `authorID`: Reference to the officer who authored the report (String, required)
  - `dateFiled`: Date when report was filed (String, required)
  - `reportType`: Type of report (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Cases** (reports are filed for cases)
  - Many-to-One with **Officers** (reports are authored by officers)

---

### 12. **Vehicles**

- **Purpose**: Vehicle records involved in cases
- **Primary Key**: `vehicleID` (String, unique, required)
- **Fields**:
  - `vehicleID`: Unique identifier for the vehicle
  - `caseID`: Reference to the related case (String, required)
  - `make`: Vehicle manufacturer (String, required)
  - `model`: Vehicle model (String, required)
  - `licensePlate`: License plate number (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Cases** (vehicles are linked to cases)

---

### 13. **Weapons**

- **Purpose**: Weapon records involved in incidents
- **Primary Key**: `weaponID` (String, unique, required)
- **Fields**:
  - `weaponID`: Unique identifier for the weapon
  - `incidentID`: Reference to the related incident (String, required)
  - `ownerID`: Reference to the weapon owner (person) (String, required)
  - `serialNumber`: Weapon serial number (String, required)
  - `type`: Type of weapon (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Incidents** (weapons are involved in incidents)
  - Many-to-One with **People** (weapons are owned by people)

---

### 14. **Prisons**

- **Purpose**: Prison facility records
- **Primary Key**: `prisonID` (String, unique, required)
- **Fields**:
  - `prisonID`: Unique identifier for the prison
  - `name`: Name of the prison facility (String, required)
  - `locationID`: Reference to prison location (String, required)
  - `securityLevel`: Security level of the prison (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Locations** (prisons are located at specific places)
  - One-to-Many with **Sentences** (prisons can house multiple sentenced individuals)

---

### 15. **Sentences**

- **Purpose**: Sentencing records for convicted individuals
- **Primary Key**: `sentenceID` (String, unique, required)
- **Fields**:
  - `sentenceID`: Unique identifier for the sentence
  - `caseID`: Reference to the related case (String, required)
  - `personID`: Reference to the sentenced person (String, required)
  - `duration`: Duration of the sentence (String, required)
  - `type`: Type of sentence (String, required)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Many-to-One with **Cases** (sentences result from cases)
  - Many-to-One with **People** (sentences are given to people)
  - Many-to-One with **Prisons** (sentences can be served at prisons)

---

### 16. **Users** (Authentication)

- **Purpose**: User accounts for system access
- **Primary Key**: `username` (String, unique, required)
- **Fields**:
  - `username`: Unique username for login (String, unique, required)
  - `password`: Hashed password (String, required)
  - `role`: User role - "officer" or "public" (String, enum, required)
  - `firstName`: First name (String, optional)
  - `lastName`: Last name (String, optional)
  - `badgeNumber`: Officer badge number if applicable (String, optional)
  - `email`: Email address (String, optional)
  - `createdAt`: Automatic timestamp (Date)
  - `updatedAt`: Automatic timestamp (Date)
- **Relationships**:
  - Independent entity for authentication (no foreign key relationships)

---

## Entity Relationship Diagram (Conceptual)

```
┌─────────────┐
│  Incidents  │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐    ┌─────────────┐
│    Cases    │    │   Weapons   │
└──────┬──────┘    └──────┬──────┘
       │                  │
       ├──────────┬───────┴───────┬──────────┬──────────┬──────────┐
       │          │               │          │          │          │
       ▼          ▼               ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Arrests  │ │ Evidence│  │ Reports  │ │ Vehicles │ │Sentences │ │ Forensics│
└────┬─────┘ └────┬─────┘  └────┬─────┘ └──────────┘ └────┬─────┘ └────┬─────┘
     │           │              │                          │           │
     │           │              │                          │           │
     ▼           ▼              ▼                          ▼           │
┌──────────┐ ┌──────────┐ ┌──────────┐            ┌──────────┐      │
│ Charges  │ │ Forensics│ │ Officers │            │  People  │      │
└──────────┘ └──────────┘ └────┬─────┘            └────┬──────┘      │
                               │                       │              │
                               ▼                       │              │
                          ┌──────────┐                │              │
                          │Departments│                │              │
                          └─────┬─────┘                │              │
                                │                      │              │
                                ▼                      │              │
                          ┌──────────┐                │              │
                          │ Locations│◄───────────────┴──────────────┘
                          └─────┬────┘
                                │
                                ▼
                          ┌──────────┐
                          │  Prisons │
                          └──────────┘
```

---

## Relationship Summary

### One-to-Many Relationships

1. **Incidents → Cases**: One incident can generate multiple cases
2. **Cases → Arrests**: One case can have multiple arrests
3. **Cases → Evidence**: One case can have multiple evidence items
4. **Cases → Forensics**: One case can have multiple forensic analyses
5. **Cases → Reports**: One case can have multiple reports
6. **Cases → Vehicles**: One case can involve multiple vehicles
7. **Cases → Sentences**: One case can result in multiple sentences
8. **Arrests → Charges**: One arrest can have multiple charges
9. **People → Arrests**: One person can have multiple arrests
10. **People → Sentences**: One person can receive multiple sentences
11. **People → Weapons**: One person can own multiple weapons
12. **Officers → Cases**: One officer can lead multiple cases
13. **Officers → Reports**: One officer can author multiple reports
14. **Departments → Officers**: One department can have multiple officers
15. **Locations → Incidents**: One location can have multiple incidents
16. **Locations → Arrests**: One location can have multiple arrests
17. **Locations → Departments**: One location can have multiple departments
18. **Locations → Prisons**: One location can have multiple prisons
19. **Evidence → Forensics**: One evidence item can have multiple forensic analyses
20. **Prisons → Sentences**: One prison can house multiple sentenced individuals

### Many-to-One Relationships

1. **Cases → Incidents**: Multiple cases can originate from one incident
2. **Cases → Officers**: Multiple cases can be led by one officer
3. **Arrests → People**: Multiple arrests can involve one person
4. **Arrests → Cases**: Multiple arrests can be linked to one case
5. **Arrests → Locations**: Multiple arrests can occur at one location
6. **Charges → Arrests**: Multiple charges can be filed for one arrest
7. **Officers → Departments**: Multiple officers belong to one department
8. **Reports → Officers**: Multiple reports can be authored by one officer
9. **Weapons → Incidents**: Multiple weapons can be involved in one incident
10. **Weapons → People**: Multiple weapons can be owned by one person

### One-to-One Relationships

1. **Departments → Officers**: One department has one head officer (headOfficerID)

---

## Database Schema Characteristics

### MongoDB Document Structure

- **Database Type**: NoSQL (MongoDB)
- **ODM**: Mongoose
- **Schema Flexibility**: `strict: false` allows additional fields beyond schema
- **Timestamps**: Automatic `createdAt` and `updatedAt` fields on all collections
- **ID Generation**: Custom string-based IDs (e.g., "CASE-001", "ARR-042")

### Indexing Strategy

- **Automatic Index Creation**: Indexes are created automatically based on:
  - Fields used in filters
  - Fields used for sorting
  - Fields used in grouping operations
- **Unique Indexes**: All primary key fields have unique indexes
- **Performance Optimization**: Indexes improve query performance for frequently accessed fields

### Data Integrity

- **Referential Integrity**: Maintained through application-level validation
- **Transactions**: MongoDB transactions ensure atomic operations across multiple collections
- **Validation**: Required fields and data types enforced at schema level
- **Foreign Key Relationships**: Implemented through string references (e.g., `caseID`, `personID`)

---

## Transaction Scenarios

### Arrest Registration Transaction

When registering a new arrest, the following collections are updated atomically:

1. **Arrests Collection**: Insert new arrest document
2. **Charges Collection**: Insert new charge document
3. **Cases Collection**: Update case status to "open"
4. **People Collection**: Update person roles to include "suspect"

**Transaction Flow**:
```
BEGIN TRANSACTION
  → Insert into Arrests
  → Insert into Charges
  → Update Cases (status = "open")
  → Update People (add role "suspect")
COMMIT TRANSACTION
```

If any step fails, all changes are rolled back to maintain data consistency.

---

## Data Access Patterns

### Common Queries

1. **Case Lookup with Related Data**:
   - Join Cases with Incidents, Officers, Locations
   - Aggregate related Arrests, Evidence, Reports

2. **Officer Department Lookup**:
   - Join Officers with Departments
   - Filter by departmentID

3. **Person Arrest History**:
   - Join People with Arrests
   - Join Arrests with Charges
   - Filter by personID

4. **Evidence Chain of Custody**:
   - Join Evidence with Cases
   - Join Evidence with Forensics
   - Track evidence through analysis

5. **Location-Based Queries**:
   - Join Locations with Incidents, Arrests, Departments
   - Filter by city, state, or coordinates

---

## Database Constraints

### Required Fields

All entities have required primary key fields and essential attributes. Optional fields are marked as such in the schema.

### Unique Constraints

- All `*ID` fields are unique (primary keys)
- `username` in Users collection is unique
- `badgeNumber` in Officers collection should be unique (enforced at application level)

### Data Type Constraints

- String fields: Text data
- Number fields: Numeric data (coordinates)
- Boolean fields: True/false values (isConvicted)
- Array fields: Lists of values (roles, coordinates)
- Date fields: Timestamp strings (stored as strings for flexibility)

---

## Database Deployment

- **Platform**: MongoDB Atlas (Cloud)
- **Connection**: Secure connection string via environment variables
- **Backup**: Automatic backups provided by MongoDB Atlas
- **Scaling**: Horizontal scaling capabilities
- **Security**: Network isolation and encryption at rest

---

## Summary

The database design consists of **16 collections** (15 data collections + 1 authentication collection) with **complex inter-relationships** that support comprehensive law enforcement operations. The NoSQL document-based structure provides flexibility while maintaining data integrity through:

- **String-based foreign keys** for relationships
- **MongoDB transactions** for atomic multi-collection updates
- **Automatic indexing** for performance optimization
- **Schema validation** for data consistency
- **Flexible schema** for future extensibility

The design supports efficient querying, data aggregation, and transaction-based workflows essential for law enforcement data management.

---

**Total Collections**: 16  
**Data Collections**: 15  
**Authentication Collections**: 1  
**Primary Relationships**: 20+ one-to-many relationships  
**Transaction Support**: Yes (MongoDB multi-document transactions)

