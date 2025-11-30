# Project Modules
## Law Enforcement Management System

---

## Module Architecture Overview

The Law Enforcement Management System is organized into modular components that work together to provide a comprehensive solution. The system follows a **separation of concerns** principle with distinct modules for frontend, backend, and shared functionality.

---

## Frontend Modules

### 1. **Page Modules** (Collection Management)

#### 1.1 Dashboard Module (`Dashboard.tsx`)
- **Purpose**: Main analytics and statistics dashboard
- **Features**:
  - Real-time statistics cards (Active Cases, Total Arrests, Convicted, Total People)
  - Interactive pie chart for case status distribution
  - Bar chart for crime type distribution
  - Gradient styling and hover effects
- **Dependencies**: `statsAPI`, `recharts`, `@tanstack/react-query`
- **Key Functions**:
  - `getDashboard()` - Fetches dashboard statistics
  - Chart rendering with custom gradients
  - Responsive card layout

#### 1.2 Cases Module (`Cases.tsx`)
- **Purpose**: Manage criminal cases
- **Features**:
  - CRUD operations for cases
  - Filter by status (open/closed), crime type, location, opening date
  - Search functionality
  - Pagination
  - Cross-collection lookups (officers, incidents, locations)
- **Key Fields**: `caseID`, `incidentID`, `leadOfficerID`, `status`, `openingDate`
- **Filters**: Status dropdown, Crime Type, Location (by address), Opening Date picker

#### 1.3 Arrests Module (`Arrests.tsx`)
- **Purpose**: Manage arrest records
- **Features**:
  - View all arrests
  - Filter by arrest date, location, person, case
  - Search functionality
  - Integration with Arrest Registration Dialog
  - Pagination
- **Key Fields**: `arrestID`, `personID`, `caseID`, `date`, `locationID`
- **Filters**: Arrest Date picker, Location, Person, Case

#### 1.4 Officers Module (`Officers.tsx`)
- **Purpose**: Manage officer records
- **Features**:
  - CRUD operations for officers
  - Filter by department and badge number
  - Search functionality
  - Department lookup with filtered options (only departments with officers)
  - Pagination
- **Key Fields**: `officerID`, `badgeNumber`, `departmentID`, `firstName`, `lastName`
- **Filters**: Department dropdown, Badge Number search

#### 1.5 Departments Module (`Departments.tsx`)
- **Purpose**: Manage law enforcement departments
- **Features**:
  - CRUD operations for departments
  - Filter by location (city/state)
  - Search functionality
  - Location lookup
  - Pagination
- **Key Fields**: `departmentID`, `name`, `locationID`, `headOfficerID`
- **Filters**: Location (City/State)

#### 1.6 People Module (`People.tsx`)
- **Purpose**: Manage person records (suspects, witnesses, victims)
- **Features**:
  - CRUD operations for people
  - Filter by name, role, age range
  - Search functionality
  - Age calculation from date of birth
  - Pagination
- **Key Fields**: `personID`, `firstName`, `lastName`, `dateOfBirth`, `roles`
- **Filters**: Name search, Role dropdown, Age range

#### 1.7 Incidents Module (`Incidents.tsx`)
- **Purpose**: Manage crime incidents
- **Features**:
  - CRUD operations for incidents
  - Filter by crime type, date, location, officer
  - Search functionality
  - Pagination
- **Key Fields**: `incidentID`, `title`, `crimeType`, `date`, `locationID`
- **Filters**: Crime Type, Incident Date, Location, Officer

#### 1.8 Charges Module (`Charges.tsx`)
- **Purpose**: Manage criminal charges
- **Features**:
  - CRUD operations for charges
  - Filter by conviction status, description, statute code
  - Visual indicator for convicted status (red badge)
  - Search functionality
  - Pagination
- **Key Fields**: `chargeID`, `arrestID`, `description`, `isConvicted`, `statuteCode`
- **Filters**: Conviction Status, Description search, Statute Code search

#### 1.9 Locations Module (`Locations.tsx`)
- **Purpose**: Manage geographic locations
- **Features**:
  - CRUD operations for locations
  - Filter by city and state
  - Search functionality
  - Coordinate support (latitude/longitude)
  - Pagination
- **Key Fields**: `locationID`, `address`, `city`, `state`, `coordinates`
- **Filters**: City, State

#### 1.10 Evidence Module (`Evidence.tsx`)
- **Purpose**: Manage physical evidence
- **Features**:
  - CRUD operations for evidence
  - Filter by type and storage location
  - Search functionality
  - Case lookup
  - Pagination
- **Key Fields**: `evidenceID`, `caseID`, `description`, `storageLocation`, `type`
- **Filters**: Type, Storage Location, Case

#### 1.11 Forensics Module (`Forensics.tsx`)
- **Purpose**: Manage forensic analysis records
- **Features**:
  - CRUD operations for forensics
  - Filter by analysis type and date analyzed
  - Search functionality
  - Case and evidence lookup
  - Pagination
- **Key Fields**: `forensicsID`, `evidenceID`, `caseID`, `analysisType`, `dateAnalyzed`
- **Filters**: Analysis Type, Date Analyzed

#### 1.12 Reports Module (`Reports.tsx`)
- **Purpose**: Manage official reports
- **Features**:
  - CRUD operations for reports
  - Filter by report type and date filed
  - Search functionality
  - Case and author (officer) lookup
  - Pagination
- **Key Fields**: `reportID`, `caseID`, `authorID`, `dateFiled`, `reportType`
- **Filters**: Report Type, Date Filed

#### 1.13 Vehicles Module (`Vehicles.tsx`)
- **Purpose**: Manage vehicle records
- **Features**:
  - CRUD operations for vehicles
  - Filter by make/model, license plate, case
  - Search functionality
  - Pagination
- **Key Fields**: `vehicleID`, `caseID`, `make`, `model`, `licensePlate`
- **Filters**: Make/Model, License Plate, Case

#### 1.14 Weapons Module (`Weapons.tsx`)
- **Purpose**: Manage weapon records
- **Features**:
  - CRUD operations for weapons
  - Filter by weapon type, owner, incident
  - Search functionality
  - Person and incident lookup
  - Pagination
- **Key Fields**: `weaponID`, `incidentID`, `ownerID`, `serialNumber`, `type`
- **Filters**: Weapon Type, Owner, Incident

#### 1.15 Prisons Module (`Prisons.tsx`)
- **Purpose**: Manage prison facility records
- **Features**:
  - CRUD operations for prisons
  - Filter by security level and location
  - Search functionality
  - Location lookup
  - Pagination
- **Key Fields**: `prisonID`, `name`, `locationID`, `securityLevel`
- **Filters**: Security Level, Location

#### 1.16 Sentences Module (`Sentences.tsx`)
- **Purpose**: Manage sentencing records
- **Features**:
  - CRUD operations for sentences
  - Filter by sentence type, duration, case, person
  - Search functionality
  - Case and person lookup
  - Pagination
- **Key Fields**: `sentenceID`, `caseID`, `personID`, `duration`, `type`
- **Filters**: Sentence Type, Duration, Case, Person

#### 1.17 Authentication Module (`Auth.tsx`)
- **Purpose**: User authentication and authorization
- **Features**:
  - Login form with smooth slide animation
  - Registration form
  - Secure password handling
  - JWT token management
  - Protected route integration
- **Key Functions**:
  - `handleLogin()` - Authenticate user
  - `handleRegister()` - Register new user
  - Form validation
  - Error handling

#### 1.18 Generic Collection Page (`CollectionPage.tsx`)
- **Purpose**: Reusable page template for collections
- **Features**:
  - Dynamic collection rendering
  - Generic CRUD operations
  - Configurable filters
  - Extensible design

---

### 2. **Component Modules**

#### 2.1 Layout Components

##### 2.1.1 Dashboard Layout (`DashboardLayout.tsx`)
- **Purpose**: Main application layout wrapper
- **Features**:
  - Sidebar navigation
  - Header
  - Content area
  - Responsive design
- **Dependencies**: `AppSidebar`, `DashboardLayout`

##### 2.1.2 App Sidebar (`AppSidebar.tsx`)
- **Purpose**: Navigation sidebar
- **Features**:
  - Menu items for all collections
  - Active route highlighting
  - Expandable/collapsible sidebar
  - Icon-based navigation
  - Logout functionality
- **Menu Items**: Dashboard, Cases, Arrests, Officers, Departments, People, Incidents, Locations, Charges, Evidence, Forensics, Reports, Prisons, Vehicles, Weapons

#### 2.2 Feature Components

##### 2.2.1 Arrest Registration Dialog (`ArrestRegistrationDialog.tsx`)
- **Purpose**: Transaction-based arrest registration form
- **Features**:
  - Multi-step form (Arrestee → Charge → Case → Completed)
  - Person dropdown selection
  - Case dropdown (open cases only)
  - Location dropdown
  - Date picker for arrest date
  - Charge description and statute code
  - Conviction checkbox
  - Loading spinner during transaction
  - Step progress indicator
  - Success/error modals
- **Key Functions**:
  - `fetchOptions()` - Load dropdown options
  - `handleSubmit()` - Submit transaction
  - `resetForm()` - Clear form data
- **Transaction Flow**:
  1. Create arrest record
  2. Create charge record
  3. Update case status to "open"
  4. Update person roles

##### 2.2.2 Collection Form Dialog (`CollectionFormDialog.tsx`)
- **Purpose**: Generic form for creating/editing collection documents
- **Features**:
  - Dynamic form generation based on schema
  - Field type detection (String, Date, Number, Boolean)
  - Validation
  - Create and edit modes
  - Error handling

##### 2.2.3 Inline Filters (`InlineFilters.tsx`)
- **Purpose**: Reusable filter component
- **Features**:
  - Expandable/collapsible filter panel
  - Smooth animations
  - Multiple filter types (dropdown, date picker, text input)
  - Filter reset functionality
  - Collection-specific filter configurations

##### 2.2.4 Aggregation Builder (`AggregationBuilder.tsx`)
- **Purpose**: Build MongoDB aggregation pipelines
- **Features**:
  - Visual pipeline builder
  - Match, lookup, group, sort, project stages
  - Dynamic query construction

##### 2.2.5 Aggregation Results (`AggregationResults.tsx`)
- **Purpose**: Display aggregation query results
- **Features**:
  - Table view of results
  - Export functionality
  - Result formatting

##### 2.2.6 Index Manager (`IndexManager.tsx`)
- **Purpose**: View and manage database indexes
- **Features**:
  - List all indexes
  - Index creation status
  - Performance metrics

##### 2.2.7 Click Spark (`ClickSpark.tsx`)
- **Purpose**: Interactive click animation effect
- **Features**:
  - Sparkle animation on click
  - Customizable colors and size
  - Smooth animations

#### 2.3 UI Component Library (`ui/`)

The system uses **shadcn/ui** component library with 40+ pre-built components:

- **Form Components**: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- **Layout Components**: `card`, `separator`, `scroll-area`, `resizable`, `sheet`, `drawer`
- **Navigation**: `sidebar`, `navigation-menu`, `breadcrumb`, `pagination`, `tabs`
- **Overlays**: `dialog`, `popover`, `tooltip`, `hover-card`, `alert-dialog`, `dropdown-menu`
- **Feedback**: `toast`, `sonner`, `alert`, `progress`, `skeleton`
- **Data Display**: `table`, `badge`, `avatar`, `chart`
- **Date/Time**: `calendar`, `calendar-lume`
- **Special**: `shimmer-button`, `spotlight-card`, `tech-background`, `dotted-surface`

All components are:
- Built on Radix UI primitives
- Fully accessible (WCAG compliant)
- Customizable with Tailwind CSS
- TypeScript typed

---

### 3. **Core Frontend Modules**

#### 3.1 API Client Module (`api.ts`)
- **Purpose**: Centralized API communication
- **Features**:
  - Axios instance configuration
  - Base URL management (environment-based)
  - Request/response interceptors
  - Error handling
  - API endpoint definitions
- **Key APIs**:
  - `dynamicAPI` - CRUD and aggregation operations
  - `authAPI` - Authentication endpoints
  - `statsAPI` - Dashboard statistics
  - `arrestAPI` - Arrest registration
- **Configuration**: Uses `VITE_API_URL` environment variable

#### 3.2 Authentication Hook (`useAuth.tsx`)
- **Purpose**: Authentication state management
- **Features**:
  - User session management
  - Login/logout functions
  - Token storage (localStorage)
  - Protected route logic
  - Loading states
- **Key Functions**:
  - `login()` - Authenticate user
  - `logout()` - Clear session
  - `isAuthenticated` - Check auth status

#### 3.3 Type Definitions (`types/index.ts`)
- **Purpose**: TypeScript type definitions
- **Features**:
  - Interface definitions for all collections
  - Type safety across the application
  - API response types
- **Key Types**: `Case`, `Arrest`, `Officer`, `Department`, `Person`, `Incident`, `Charge`, `Location`, `Evidence`, `Forensic`, `Report`, `Prison`, `Sentence`, `Vehicle`, `Weapon`

#### 3.4 Utility Modules (`lib/`)
- **Purpose**: Shared utility functions
- **Modules**:
  - `utils.ts` - General utilities (cn, formatDate, etc.)
  - `mockData.ts` - Mock data for development

---

## Backend Modules

### 1. **Route Modules**

#### 1.1 Dynamic Routes Module (`routes/dynamic.js`)
- **Purpose**: Generic CRUD and aggregation endpoints for all collections
- **Endpoints**:
  - `GET /api/dynamic/:collectionName` - Get all documents
  - `POST /api/dynamic/:collectionName` - Create document
  - `PUT /api/dynamic/:collectionName/:id` - Update document
  - `DELETE /api/dynamic/:collectionName/:id` - Delete document
  - `POST /api/dynamic/:collectionName/aggregate` - Run aggregation pipeline
  - `GET /api/dynamic/:collectionName/schema` - Get collection schema
  - `POST /api/dynamic/:collectionName/math/group-by` - Group by field
- **Features**:
  - Dynamic model resolution
  - Automatic index creation
  - Aggregation pipeline building
  - Schema introspection
  - Error handling
- **Key Functions**:
  - `getModel()` - Resolve collection model
  - `ensureIndexes()` - Create indexes automatically
  - `buildAggregationPipeline()` - Construct MongoDB pipeline

#### 1.2 Authentication Routes Module (`routes/auth.js`)
- **Purpose**: User authentication endpoints
- **Endpoints**:
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration
- **Features**:
  - Password hashing with bcrypt
  - JWT token generation
  - User validation
  - Session management
- **Key Functions**:
  - `hashPassword()` - Encrypt passwords
  - `comparePassword()` - Verify passwords
  - `generateToken()` - Create JWT tokens

#### 1.3 Statistics Routes Module (`routes/stats.js`)
- **Purpose**: Dashboard statistics and analytics
- **Endpoints**:
  - `GET /api/stats/dashboard` - Get dashboard statistics
- **Features**:
  - Active cases count
  - Total arrests count
  - Convicted count
  - Total people count
  - Case status distribution
  - Crime type distribution
- **Key Functions**:
  - `getDashboardStats()` - Aggregate statistics
  - `getCaseStatusDistribution()` - Case status breakdown
  - `getCrimeTypeDistribution()` - Crime type breakdown

#### 1.4 Arrest Routes Module (`routes/arrest.js`)
- **Purpose**: Transaction-based arrest registration
- **Endpoints**:
  - `POST /api/arrest/register` - Register new arrest with transaction
- **Features**:
  - MongoDB transaction support
  - Multi-collection updates
  - Atomic operations
  - Error rollback
- **Transaction Steps**:
  1. Validate input data
  2. Verify person exists
  3. Verify case exists
  4. Generate unique IDs
  5. Create arrest record
  6. Create charge record
  7. Update case status to "open"
  8. Update person roles
  9. Commit transaction
- **Key Functions**:
  - `generateID()` - Create unique identifiers
  - `registerArrest()` - Main transaction handler

---

### 2. **Model Modules**

#### 2.1 Schema Definitions Module (`models/allSchemas.js`)
- **Purpose**: MongoDB schema definitions for all collections
- **Collections** (15 total):
  1. **Incidents** - Crime incident records
  2. **People** - Person records (suspects, witnesses, victims)
  3. **Arrests** - Arrest records
  4. **Charges** - Criminal charge records
  5. **Cases** - Criminal case records
  6. **Departments** - Law enforcement departments
  7. **Officers** - Officer records
  8. **Locations** - Geographic locations
  9. **Evidence** - Physical evidence records
  10. **Forensics** - Forensic analysis records
  11. **Reports** - Official report records
  12. **Prisons** - Prison facility records
  13. **Sentences** - Sentencing records
  14. **Vehicles** - Vehicle records
  15. **Weapons** - Weapon records
  16. **Users** - User accounts (authentication)

- **Schema Features**:
  - Unique ID fields
  - Required field validation
  - Flexible schema (`strict: false`)
  - Automatic timestamps (`createdAt`, `updatedAt`)
  - Field type definitions

#### 2.2 Model Export
- **Purpose**: Centralized model access
- **Features**:
  - Dictionary of all models
  - Lowercase key mapping
  - Collection name mapping
  - Reusable across routes

---

### 3. **Core Backend Modules**

#### 3.1 Server Module (`server.js`)
- **Purpose**: Express server configuration and startup
- **Features**:
  - Express app initialization
  - CORS configuration
  - JSON body parsing
  - MongoDB connection
  - Route registration
  - Error handling
  - Port configuration
- **Configuration**:
  - Environment variables (PORT, MONGODB_URI)
  - CORS settings
  - Middleware setup

#### 3.2 Database Connection
- **Purpose**: MongoDB Atlas connection management
- **Features**:
  - Connection string configuration
  - Retry logic
  - Error handling
  - Connection status logging
- **Configuration**: Uses `MONGODB_URI` environment variable

---

## Shared Modules

### 1. **Filter Module**
- **Purpose**: Unified filtering system
- **Features**:
  - Collection-specific filter configurations
  - Date filtering (single date and ranges)
  - Text search
  - Dropdown filters
  - Cross-collection lookups
  - Filter state management
  - Reset functionality

### 2. **Search Module**
- **Purpose**: Text-based search functionality
- **Features**:
  - Multi-field search
  - Real-time filtering
  - Case-insensitive matching
  - Regex support
  - Search highlighting

### 3. **Pagination Module**
- **Purpose**: Data pagination
- **Features**:
  - Page size configuration
  - Page navigation
  - Total count display
  - Skip/limit calculation
  - URL parameter support

### 4. **Index Management Module**
- **Purpose**: Automatic index creation
- **Features**:
  - Query pattern analysis
  - Index creation on-demand
  - Background processing
  - Performance optimization
  - Index status tracking

### 5. **Transaction Module**
- **Purpose**: MongoDB transaction management
- **Features**:
  - Session management
  - Transaction start/commit/abort
  - Error rollback
  - Atomic operations
  - Multi-collection updates

---

## Module Dependencies

### Frontend Dependencies
```
React → React Router → Pages
React → TanStack Query → API Client
React → Components → UI Library
Pages → Components → Feature Components
Components → API Client → Backend
```

### Backend Dependencies
```
Express → Routes → Models
Routes → MongoDB → Database
Routes → Authentication → Users Collection
Routes → Transactions → Multiple Collections
```

### Cross-Module Communication
```
Frontend API Client ↔ Backend Routes
Frontend Pages ↔ Backend Models (via API)
Frontend Components ↔ Backend Endpoints
```

---

## Module Integration Points

### 1. **Authentication Flow**
```
Auth Page → useAuth Hook → authAPI → Backend auth.js → Users Model → JWT Token → Protected Routes
```

### 2. **Data Flow**
```
Collection Page → API Client → Dynamic Routes → Models → MongoDB → Response → React Query Cache → UI Update
```

### 3. **Transaction Flow**
```
Arrest Dialog → arrestAPI → Arrest Routes → MongoDB Transaction → Multiple Models → Success/Error → UI Feedback
```

### 4. **Filter Flow**
```
Filter Component → State Update → useEffect → API Call → Aggregation Pipeline → Filtered Results → Table Update
```

---

## Module Responsibilities

### Frontend Modules
- **Pages**: User interface and interaction
- **Components**: Reusable UI elements
- **API Client**: HTTP communication
- **Hooks**: State management and side effects
- **Types**: Type safety

### Backend Modules
- **Routes**: Request handling and business logic
- **Models**: Data structure and validation
- **Server**: Application setup and configuration
- **Database**: Data persistence

### Shared Modules
- **Filtering**: Data filtering logic
- **Search**: Text search functionality
- **Pagination**: Data pagination
- **Transactions**: Data integrity

---

## Module Testing Considerations

### Frontend Testing
- Component unit tests
- Page integration tests
- API client mocking
- Hook testing
- UI interaction testing

### Backend Testing
- Route endpoint tests
- Model validation tests
- Transaction tests
- Error handling tests
- Authentication tests

### Integration Testing
- End-to-end workflows
- Cross-module communication
- Data flow validation
- Error propagation

---

## Module Maintenance

### Code Organization
- Modular file structure
- Clear separation of concerns
- Reusable components
- Consistent naming conventions

### Documentation
- Module purpose documentation
- API documentation
- Component prop documentation
- Function documentation

### Scalability
- Easy to add new collections
- Extensible filter system
- Modular route structure
- Component reusability

---

**Total Modules**: 50+ modules across frontend, backend, and shared functionality  
**Collection Modules**: 15 collection management modules  
**Component Modules**: 40+ UI components  
**Route Modules**: 4 backend route modules  
**Model Modules**: 16 schema definitions

