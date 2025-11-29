# Automatic Index Creation Logic

## Overview
The system automatically creates MongoDB indexes based on query patterns when users filter, sort, or group data. This improves query performance without manual index management.

## How It Works

### 1. **Trigger Point**
Indexes are created automatically when:
- A user applies filters (uses aggregation endpoint with `match` conditions)
- A user sorts results (uses `sort` in aggregation)
- A user groups data (uses `groupBy` in aggregation)

### 2. **Index Creation Rules**

The `ensureIndexes()` function analyzes the aggregation pipeline and creates indexes for:

#### A. **Fields Used in $match (Filtering)**
- **When**: Any field used in filter conditions
- **Index Type**: Ascending (1)
- **Example**: 
  - Filter by `status = "open"` → Creates index on `status`
  - Filter by `openingDate = "2024-01-15"` → Creates index on `openingDate`
  - Filter by `incident.crimeType = "theft"` → Creates index on `incident.crimeType`

#### B. **Fields Used in $sort (Sorting)**
- **When**: Any field used for sorting results
- **Index Type**: Matches sort direction (1 for ascending, -1 for descending)
- **Example**:
  - Sort by `count DESC` → Creates index on `count: -1`
  - Sort by `openingDate ASC` → Creates index on `openingDate: 1`

#### C. **Fields Used in $group (Grouping)**
- **When**: Any field used for grouping data
- **Index Type**: Ascending (1)
- **Example**:
  - Group by `status` → Creates index on `status`
  - Group by `locationID` → Creates index on `locationID`

### 3. **Exclusions**
Indexes are NOT created for:
- `_id` field (already indexed by MongoDB)
- `count` field (aggregation result, not a document field)

### 4. **Index Creation Process**

```javascript
// Step 1: Analyze query pattern
- Extract fields from $match stage
- Extract fields from $sort stage  
- Extract fields from $group stage

// Step 2: Build index specifications
- For each field, create index spec: { fieldName: direction }

// Step 3: Create indexes (non-blocking)
- Uses { background: true } to avoid blocking operations
- MongoDB automatically ignores duplicate indexes
- Errors are logged but don't fail the request
```

### 5. **Example Scenarios**

#### Scenario 1: Filter Cases by Status
```javascript
// User filters: status = "open"
// Aggregation: { match: { status: "open" } }
// Index Created: { status: 1 }
```

#### Scenario 2: Filter and Sort
```javascript
// User filters: status = "open", sorts by openingDate DESC
// Aggregation: { match: { status: "open" }, sort: { openingDate: -1 } }
// Indexes Created: 
//   - { status: 1 }
//   - { openingDate: -1 }
```

#### Scenario 3: Group by Location
```javascript
// User groups: groupBy: ["locationID"]
// Aggregation: { groupBy: ["locationID"] }
// Index Created: { locationID: 1 }
```

### 6. **Performance Benefits**

- **Faster Queries**: Indexed fields are searched much faster
- **Efficient Sorting**: Sorted fields use indexes instead of full collection scans
- **Optimized Grouping**: Grouped fields can use indexes for faster aggregation

### 7. **Safety Features**

- **Non-blocking**: Index creation runs in background (`background: true`)
- **Idempotent**: MongoDB ignores duplicate index creation attempts
- **Error Handling**: Index creation failures don't break the query
- **Logging**: All index creations are logged to console

### 8. **When Indexes Are Created**

Indexes are created **automatically** when:
1. User applies any filter (status, date, location, etc.)
2. User sorts results by any field
3. User groups data by any field

Indexes are created **asynchronously** (non-blocking), so:
- The query executes immediately
- Index creation happens in the background
- Future queries benefit from the new indexes

### 9. **Index Storage**

- Indexes are stored in MongoDB
- Each collection can have multiple indexes
- Indexes persist across server restarts
- View all indexes: `GET /api/dynamic/:collectionName/indexes`

## Summary

**The system learns from user behavior:**
- When you filter by a field → Index is created for that field
- When you sort by a field → Index is created for that field  
- When you group by a field → Index is created for that field

**Result:** Frequently queried fields automatically get indexes, improving performance over time without manual intervention.

