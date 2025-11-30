# Entity Relationships
## Law Enforcement Management System

---

## Overview

This document provides a comprehensive breakdown of all entity relationships in the Law Enforcement Management System database. Relationships are categorized into three types: **One-to-Many**, **One-to-One**, and **Many-to-Many**.

---

## Relationship Types

### 1. One-to-Many Relationships

A **One-to-Many** relationship exists when one entity can have multiple related records in another entity, but each record in the second entity belongs to only one record in the first entity.

#### 1.1 Incidents → Cases
- **Relationship**: One Incident can have Many Cases
- **Foreign Key**: `incidentID` in Cases collection
- **Description**: A single crime incident can generate multiple criminal cases. For example, one robbery incident might result in separate cases for different suspects.
- **Implementation**: 
  - Incidents: `incidentID` (Primary Key)
  - Cases: `incidentID` (Foreign Key, references Incidents.incidentID)
- **Example**: Incident "ROB-001" can have Cases "CASE-001", "CASE-002", "CASE-003"

#### 1.2 Cases → Arrests
- **Relationship**: One Case can have Many Arrests
- **Foreign Key**: `caseID` in Arrests collection
- **Description**: A single case can involve multiple arrests of different individuals or the same person at different times.
- **Implementation**:
  - Cases: `caseID` (Primary Key)
  - Arrests: `caseID` (Foreign Key, references Cases.caseID)
- **Example**: Case "CASE-001" can have Arrests "ARR-001", "ARR-002", "ARR-003"

#### 1.3 Cases → Evidence
- **Relationship**: One Case can have Many Evidence items
- **Foreign Key**: `caseID` in Evidence collection
- **Description**: Multiple pieces of evidence can be collected and linked to a single case.
- **Implementation**:
  - Cases: `caseID` (Primary Key)
  - Evidence: `caseID` (Foreign Key, references Cases.caseID)
- **Example**: Case "CASE-001" can have Evidence "EVI-001", "EVI-002", "EVI-003"

#### 1.4 Cases → Forensics
- **Relationship**: One Case can have Many Forensic analyses
- **Foreign Key**: `caseID` in Forensics collection
- **Description**: A single case can require multiple forensic analyses of different evidence items.
- **Implementation**:
  - Cases: `caseID` (Primary Key)
  - Forensics: `caseID` (Foreign Key, references Cases.caseID)
- **Example**: Case "CASE-001" can have Forensics "FOR-001", "FOR-002", "FOR-003"

#### 1.5 Cases → Reports
- **Relationship**: One Case can have Many Reports
- **Foreign Key**: `caseID` in Reports collection
- **Description**: Multiple official reports can be filed for a single case at different stages of investigation.
- **Implementation**:
  - Cases: `caseID` (Primary Key)
  - Reports: `caseID` (Foreign Key, references Cases.caseID)
- **Example**: Case "CASE-001" can have Reports "REP-001", "REP-002", "REP-003"

#### 1.6 Cases → Vehicles
- **Relationship**: One Case can involve Many Vehicles
- **Foreign Key**: `caseID` in Vehicles collection
- **Description**: A single case can involve multiple vehicles (e.g., getaway cars, victim vehicles).
- **Implementation**:
  - Cases: `caseID` (Primary Key)
  - Vehicles: `caseID` (Foreign Key, references Cases.caseID)
- **Example**: Case "CASE-001" can involve Vehicles "VEH-001", "VEH-002"

#### 1.7 Cases → Sentences
- **Relationship**: One Case can result in Many Sentences
- **Foreign Key**: `caseID` in Sentences collection
- **Description**: A single case can result in multiple sentences for different defendants or different charges.
- **Implementation**:
  - Cases: `caseID` (Primary Key)
  - Sentences: `caseID` (Foreign Key, references Cases.caseID)
- **Example**: Case "CASE-001" can result in Sentences "SEN-001", "SEN-002"

#### 1.8 Arrests → Charges
- **Relationship**: One Arrest can have Many Charges
- **Foreign Key**: `arrestID` in Charges collection
- **Description**: A single arrest can result in multiple criminal charges being filed against the arrested individual.
- **Implementation**:
  - Arrests: `arrestID` (Primary Key)
  - Charges: `arrestID` (Foreign Key, references Arrests.arrestID)
- **Example**: Arrest "ARR-001" can have Charges "CHG-001", "CHG-002", "CHG-003"

#### 1.9 People → Arrests
- **Relationship**: One Person can have Many Arrests
- **Foreign Key**: `personID` in Arrests collection
- **Description**: A single person can be arrested multiple times for different cases or incidents.
- **Implementation**:
  - People: `personID` (Primary Key)
  - Arrests: `personID` (Foreign Key, references People.personID)
- **Example**: Person "PER-001" can have Arrests "ARR-001", "ARR-002", "ARR-003"

#### 1.10 People → Sentences
- **Relationship**: One Person can receive Many Sentences
- **Foreign Key**: `personID` in Sentences collection
- **Description**: A single person can receive multiple sentences from different cases or charges.
- **Implementation**:
  - People: `personID` (Primary Key)
  - Sentences: `personID` (Foreign Key, references People.personID)
- **Example**: Person "PER-001" can receive Sentences "SEN-001", "SEN-002"

#### 1.11 People → Weapons
- **Relationship**: One Person can own Many Weapons
- **Foreign Key**: `ownerID` in Weapons collection
- **Description**: A single person can own multiple weapons that may be involved in different incidents.
- **Implementation**:
  - People: `personID` (Primary Key)
  - Weapons: `ownerID` (Foreign Key, references People.personID)
- **Example**: Person "PER-001" can own Weapons "WEP-001", "WEP-002"

#### 1.12 Officers → Cases
- **Relationship**: One Officer can lead Many Cases
- **Foreign Key**: `leadOfficerID` in Cases collection
- **Description**: A single officer can be assigned as the lead investigator for multiple cases.
- **Implementation**:
  - Officers: `officerID` (Primary Key)
  - Cases: `leadOfficerID` (Foreign Key, references Officers.officerID)
- **Example**: Officer "OFF-001" can lead Cases "CASE-001", "CASE-002", "CASE-003"

#### 1.13 Officers → Reports
- **Relationship**: One Officer can author Many Reports
- **Foreign Key**: `authorID` in Reports collection
- **Description**: A single officer can write multiple reports for different cases.
- **Implementation**:
  - Officers: `officerID` (Primary Key)
  - Reports: `authorID` (Foreign Key, references Officers.officerID)
- **Example**: Officer "OFF-001" can author Reports "REP-001", "REP-002", "REP-003"

#### 1.14 Departments → Officers
- **Relationship**: One Department can have Many Officers
- **Foreign Key**: `departmentID` in Officers collection
- **Description**: A single department employs multiple officers.
- **Implementation**:
  - Departments: `departmentID` (Primary Key)
  - Officers: `departmentID` (Foreign Key, references Departments.departmentID)
- **Example**: Department "DEPT-001" can have Officers "OFF-001", "OFF-002", "OFF-003"

#### 1.15 Locations → Incidents
- **Relationship**: One Location can have Many Incidents
- **Foreign Key**: `locationID` in Incidents collection
- **Description**: A single location can be the site of multiple crime incidents over time.
- **Implementation**:
  - Locations: `locationID` (Primary Key)
  - Incidents: `locationID` (Foreign Key, references Locations.locationID)
- **Example**: Location "LOC-001" can have Incidents "INC-001", "INC-002", "INC-003"

#### 1.16 Locations → Arrests
- **Relationship**: One Location can have Many Arrests
- **Foreign Key**: `locationID` in Arrests collection
- **Description**: A single location can be the site of multiple arrests.
- **Implementation**:
  - Locations: `locationID` (Primary Key)
  - Arrests: `locationID` (Foreign Key, references Locations.locationID)
- **Example**: Location "LOC-001" can have Arrests "ARR-001", "ARR-002"

#### 1.17 Locations → Departments
- **Relationship**: One Location can have Many Departments
- **Foreign Key**: `locationID` in Departments collection
- **Description**: A single location (e.g., a building or complex) can house multiple departments.
- **Implementation**:
  - Locations: `locationID` (Primary Key)
  - Departments: `locationID` (Foreign Key, references Locations.locationID)
- **Example**: Location "LOC-001" can have Departments "DEPT-001", "DEPT-002"

#### 1.18 Locations → Prisons
- **Relationship**: One Location can have Many Prisons
- **Foreign Key**: `locationID` in Prisons collection
- **Description**: A single location can contain multiple prison facilities.
- **Implementation**:
  - Locations: `locationID` (Primary Key)
  - Prisons: `locationID` (Foreign Key, references Locations.locationID)
- **Example**: Location "LOC-001" can have Prisons "PRI-001", "PRI-002"

#### 1.19 Evidence → Forensics
- **Relationship**: One Evidence item can have Many Forensic analyses
- **Foreign Key**: `evidenceID` in Forensics collection
- **Description**: A single piece of evidence can undergo multiple forensic analyses (e.g., DNA, fingerprint, ballistics).
- **Implementation**:
  - Evidence: `evidenceID` (Primary Key)
  - Forensics: `evidenceID` (Foreign Key, references Evidence.evidenceID)
- **Example**: Evidence "EVI-001" can have Forensics "FOR-001", "FOR-002", "FOR-003"

#### 1.20 Incidents → Weapons
- **Relationship**: One Incident can involve Many Weapons
- **Foreign Key**: `incidentID` in Weapons collection
- **Description**: A single incident can involve multiple weapons.
- **Implementation**:
  - Incidents: `incidentID` (Primary Key)
  - Weapons: `incidentID` (Foreign Key, references Incidents.incidentID)
- **Example**: Incident "INC-001" can involve Weapons "WEP-001", "WEP-002"

---

### 2. One-to-One Relationships

A **One-to-One** relationship exists when one record in an entity is associated with exactly one record in another entity, and vice versa.

#### 2.1 Departments → Officers (Head Officer)
- **Relationship**: One Department has One Head Officer
- **Foreign Key**: `headOfficerID` in Departments collection
- **Description**: Each department has exactly one head officer who leads the department. An officer can be the head of at most one department.
- **Implementation**:
  - Departments: `departmentID` (Primary Key), `headOfficerID` (Foreign Key, references Officers.officerID)
  - Officers: `officerID` (Primary Key)
- **Cardinality**: 
  - One Department → One Head Officer (required)
  - One Officer → Zero or One Department Head position (optional)
- **Example**: Department "DEPT-001" has Head Officer "OFF-001"
- **Note**: This is a special one-to-one relationship where the officer can exist without being a department head, but each department must have exactly one head officer.

---

### 3. Many-to-Many Relationships

A **Many-to-Many** relationship exists when records in one entity can be associated with multiple records in another entity, and vice versa. In MongoDB, many-to-many relationships are typically implemented through:
- Intermediate collections (junction/join tables)
- Array fields containing references
- Application-level relationship management

#### 3.1 People ↔ Cases (Indirect Many-to-Many)
- **Relationship**: Many People can be involved in Many Cases
- **Implementation**: Through intermediate entities (Arrests, Sentences)
- **Description**: 
  - A person can be involved in multiple cases (through arrests or as a witness/victim)
  - A case can involve multiple people (suspects, witnesses, victims)
- **Path 1**: People → Arrests → Cases
  - Person "PER-001" → Arrest "ARR-001" → Case "CASE-001"
  - Person "PER-001" → Arrest "ARR-002" → Case "CASE-002"
- **Path 2**: People → Sentences → Cases
  - Person "PER-001" → Sentence "SEN-001" → Case "CASE-001"
  - Person "PER-001" → Sentence "SEN-002" → Case "CASE-003"
- **Example**: 
  - Person "PER-001" is involved in Cases "CASE-001", "CASE-002", "CASE-003"
  - Case "CASE-001" involves People "PER-001", "PER-002", "PER-003"

#### 3.2 Officers ↔ Cases (Indirect Many-to-Many)
- **Relationship**: Many Officers can work on Many Cases
- **Implementation**: Through Reports and Case assignments
- **Description**:
  - An officer can work on multiple cases (as lead officer or by writing reports)
  - A case can involve multiple officers (lead officer + other officers writing reports)
- **Path 1**: Officers → Cases (as Lead Officer)
  - Officer "OFF-001" → Case "CASE-001" (as leadOfficerID)
- **Path 2**: Officers → Reports → Cases
  - Officer "OFF-002" → Report "REP-001" → Case "CASE-001"
  - Officer "OFF-003" → Report "REP-002" → Case "CASE-001"
- **Example**:
  - Officer "OFF-001" works on Cases "CASE-001", "CASE-002", "CASE-003"
  - Case "CASE-001" involves Officers "OFF-001" (lead), "OFF-002" (reports), "OFF-003" (reports)

#### 3.3 People ↔ Incidents (Indirect Many-to-Many)
- **Relationship**: Many People can be involved in Many Incidents
- **Implementation**: Through Weapons and Cases
- **Description**:
  - A person can be involved in multiple incidents (as suspect, victim, or witness)
  - An incident can involve multiple people
- **Path 1**: People → Weapons → Incidents
  - Person "PER-001" → Weapon "WEP-001" → Incident "INC-001"
  - Person "PER-001" → Weapon "WEP-002" → Incident "INC-002"
- **Path 2**: People → Arrests → Cases → Incidents
  - Person "PER-001" → Arrest "ARR-001" → Case "CASE-001" → Incident "INC-001"
- **Example**:
  - Person "PER-001" is involved in Incidents "INC-001", "INC-002", "INC-003"
  - Incident "INC-001" involves People "PER-001", "PER-002", "PER-003"

#### 3.4 Cases ↔ Evidence ↔ Forensics (Many-to-Many Chain)
- **Relationship**: Many Cases can have Many Evidence items, and Many Evidence items can have Many Forensic analyses
- **Implementation**: Direct relationships with intermediate entities
- **Description**:
  - A case can have multiple evidence items
  - An evidence item can be linked to one case but analyzed multiple times
  - Multiple forensic analyses can be performed on evidence from multiple cases
- **Structure**:
  - Cases → Evidence (One-to-Many)
  - Evidence → Forensics (One-to-Many)
  - Cases → Forensics (One-to-Many, through Evidence)
- **Example**:
  - Case "CASE-001" has Evidence "EVI-001", "EVI-002", "EVI-003"
  - Evidence "EVI-001" has Forensics "FOR-001", "FOR-002"
  - Case "CASE-001" has Forensics "FOR-001", "FOR-002", "FOR-003", "FOR-004"

#### 3.5 People ↔ Locations (Indirect Many-to-Many)
- **Relationship**: Many People can be associated with Many Locations
- **Implementation**: Through Arrests and other location-based activities
- **Description**:
  - A person can be arrested at multiple locations
  - A location can be associated with multiple people (through arrests, incidents, etc.)
- **Path**: People → Arrests → Locations
  - Person "PER-001" → Arrest "ARR-001" → Location "LOC-001"
  - Person "PER-001" → Arrest "ARR-002" → Location "LOC-002"
- **Example**:
  - Person "PER-001" is associated with Locations "LOC-001", "LOC-002", "LOC-003"
  - Location "LOC-001" is associated with People "PER-001", "PER-002", "PER-003"

#### 3.6 Officers ↔ Locations (Indirect Many-to-Many)
- **Relationship**: Many Officers can be associated with Many Locations
- **Implementation**: Through Departments and Cases
- **Description**:
  - An officer can work at multiple locations (through different departments or case assignments)
  - A location can have multiple officers (through departments or case work)
- **Path 1**: Officers → Departments → Locations
  - Officer "OFF-001" → Department "DEPT-001" → Location "LOC-001"
- **Path 2**: Officers → Cases → Incidents → Locations
  - Officer "OFF-001" → Case "CASE-001" → Incident "INC-001" → Location "LOC-002"
- **Example**:
  - Officer "OFF-001" is associated with Locations "LOC-001", "LOC-002"
  - Location "LOC-001" is associated with Officers "OFF-001", "OFF-002", "OFF-003"

---

## Relationship Summary Table

| Relationship Type | Count | Examples |
|-------------------|-------|----------|
| **One-to-Many** | 20 | Cases → Arrests, People → Arrests, Officers → Cases |
| **One-to-One** | 1 | Departments → Officers (Head Officer) |
| **Many-to-Many** | 6+ | People ↔ Cases, Officers ↔ Cases, People ↔ Incidents |

---

## Relationship Implementation Details

### Foreign Key Strategy

The system uses **string-based foreign keys** rather than MongoDB ObjectIds for the following reasons:
- **Human-readable IDs**: Easier to understand and debug (e.g., "CASE-001" vs ObjectId)
- **Flexibility**: Allows custom ID generation patterns
- **Cross-collection consistency**: Uniform ID format across all collections
- **Application-level validation**: Foreign key relationships are validated at the application level

### Lookup Operations

The system implements **MongoDB $lookup** operations to join related collections:
- **Dynamic Lookups**: Lookups are performed dynamically based on filter requirements
- **Nested Field Access**: After lookup, nested fields can be accessed (e.g., `incident.crimeType`)
- **Performance**: Indexes are automatically created on foreign key fields to optimize lookups

### Transaction Support

**MongoDB transactions** ensure data integrity when updating multiple related collections:
- **Atomic Operations**: All related updates succeed or fail together
- **Example**: When registering an arrest, the transaction updates:
  - Arrests collection (insert)
  - Charges collection (insert)
  - Cases collection (update status)
  - People collection (update roles)

---

## Relationship Cardinality Rules

### Required Relationships
- **Cases must have an Incident**: `incidentID` is required
- **Cases must have a Lead Officer**: `leadOfficerID` is required
- **Arrests must have a Person**: `personID` is required
- **Arrests must have a Case**: `caseID` is required
- **Charges must have an Arrest**: `arrestID` is required
- **Departments must have a Head Officer**: `headOfficerID` is required

### Optional Relationships
- **Officers can exist without being a Department Head**: Not all officers are department heads
- **People can exist without Arrests**: People can be witnesses or victims without being arrested
- **Cases can exist without Arrests**: Cases can be opened before any arrests are made

---

## Query Patterns for Relationships

### Finding Related Records

1. **Get all arrests for a case**:
   ```javascript
   Arrests.find({ caseID: "CASE-001" })
   ```

2. **Get all charges for an arrest**:
   ```javascript
   Charges.find({ arrestID: "ARR-001" })
   ```

3. **Get all cases for a person** (through arrests):
   ```javascript
   // Step 1: Find arrests for person
   const arrests = await Arrests.find({ personID: "PER-001" })
   // Step 2: Get unique caseIDs
   const caseIDs = [...new Set(arrests.map(a => a.caseID))]
   // Step 3: Find cases
   const cases = await Cases.find({ caseID: { $in: caseIDs } })
   ```

4. **Get all officers in a department**:
   ```javascript
   Officers.find({ departmentID: "DEPT-001" })
   ```

5. **Get all evidence for a case**:
   ```javascript
   Evidence.find({ caseID: "CASE-001" })
   ```

### Aggregation with Lookups

The system uses MongoDB aggregation pipelines with `$lookup` to join collections:

```javascript
Cases.aggregate([
  { $match: { caseID: "CASE-001" } },
  {
    $lookup: {
      from: "incidents",
      localField: "incidentID",
      foreignField: "incidentID",
      as: "incident"
    }
  },
  {
    $lookup: {
      from: "officers",
      localField: "leadOfficerID",
      foreignField: "officerID",
      as: "leadOfficer"
    }
  }
])
```

---

## Relationship Integrity

### Referential Integrity

- **Application-Level Validation**: Foreign key references are validated before insert/update operations
- **Transaction Rollback**: If a referenced entity doesn't exist, the transaction is rolled back
- **Cascade Considerations**: Deletion of parent entities requires handling of child entities (application-level logic)

### Data Consistency

- **Transaction Support**: Multi-document transactions ensure related data stays consistent
- **Atomic Updates**: Related collections are updated atomically
- **Validation Rules**: Required foreign keys prevent orphaned records

---

## Summary

The Law Enforcement Management System database contains:

- **20 One-to-Many Relationships**: The most common relationship type, representing hierarchical and ownership relationships
- **1 One-to-One Relationship**: Special relationship for department head officers
- **6+ Many-to-Many Relationships**: Complex relationships implemented through intermediate entities or multiple paths

All relationships are implemented using **string-based foreign keys** with **application-level validation** and **MongoDB transaction support** to ensure data integrity and consistency across the system.

---

**Total Relationships**: 27+  
**One-to-Many**: 20  
**One-to-One**: 1  
**Many-to-Many**: 6+  
**Transaction Support**: Yes  
**Lookup Operations**: Dynamic MongoDB $lookup

