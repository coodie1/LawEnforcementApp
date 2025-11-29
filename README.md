# LawEnforcementApp

A comprehensive law enforcement management system with dynamic data aggregation, automatic indexing, and modern UI components.

## Features

- **Dynamic Collection Management**: CRUD operations for all collections (Cases, Arrests, Evidence, Officers, Departments, etc.)
- **Advanced Filtering**: Collection-specific filters with smooth animations
- **Search Functionality**: Cross-collection search with lookup capabilities
- **Automatic Indexing**: MongoDB indexes created automatically based on query patterns
- **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui components
- **Responsive Design**: Works seamlessly across all device sizes

## Documentation

- [Automatic Index Creation Logic](./backend/INDEX_CREATION_LOGIC.md) - How indexes are automatically created based on query patterns
- [Filter Animations Implementation](./FILTER_ANIMATIONS.md) - Smooth animation system for filter panels
- [Changelog](./CHANGELOG.md) - History of all changes and updates

## Project Structure

```
LawEnforcementApp/
├── backend/
│   ├── models/
│   │   └── allSchemas.js          # MongoDB schemas for all collections
│   ├── routes/
│   │   ├── auth.js                # Authentication routes
│   │   ├── dynamic.js             # Dynamic CRUD and aggregation endpoints
│   │   └── stats.js               # Statistics endpoints
│   └── server.js                  # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── layout/            # Layout components
│   │   │   └── CollectionFormDialog.tsx
│   │   ├── pages/
│   │   │   ├── Cases.tsx          # Cases page with filters
│   │   │   ├── Arrests.tsx        # Arrests page
│   │   │   ├── Evidence.tsx       # Evidence page
│   │   │   ├── Officers.tsx       # Officers page
│   │   │   ├── Departments.tsx   # Departments page
│   │   │   └── CollectionPage.tsx # Generic collection page
│   │   ├── api.ts                 # API client
│   │   └── hooks/                 # Custom React hooks
│   └── package.json
└── README.md
```

## Key Features

### 1. Dynamic Aggregation Builder

The backend provides a flexible aggregation endpoint that builds MongoDB aggregation pipelines dynamically:

- **Match Filters**: Filter documents by any field
- **Lookup Joins**: Join with related collections for cross-collection search
- **Grouping**: Group and aggregate data
- **Sorting**: Sort results by any field
- **Projection**: Select specific fields to return

### 2. Automatic Index Creation

Indexes are created automatically when:
- Users filter by fields
- Users sort by fields
- Users group by fields

This improves query performance without manual index management.

### 3. Collection-Specific Filters

Each collection page has tailored filters:

- **Cases**: Filter by status, crime type, location (by address), opening date
- **Arrests**: Filter by date, conviction status
- **Evidence**: Filter by type, forensics analysis date
- **Officers**: Filter by department
- **Departments**: Filter by location

### 4. Smooth Animations

Filter panels use smooth CSS transitions:
- Expand/collapse animations
- Icon rotation feedback
- Button state highlighting
- 300ms duration for responsive feel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Configuration

1. Update MongoDB connection string in `backend/server.js`
2. Configure API endpoints in `frontend/src/api.ts`

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

## API Endpoints

### Dynamic Collection Endpoints

- `GET /api/dynamic/:collectionName` - Get all documents
- `POST /api/dynamic/:collectionName` - Create new document
- `PUT /api/dynamic/:collectionName/:id` - Update document
- `DELETE /api/dynamic/:collectionName/:id` - Delete document
- `POST /api/dynamic/:collectionName/aggregate` - Run aggregation pipeline

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- date-fns
- axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt (for authentication)

## Recent Updates

### Filter Animations (Latest)
- Implemented smooth expand/collapse animations for filter panels
- Added icon rotation and button highlighting for visual feedback
- 300ms duration for responsive feel

### Date Filtering Fix
- Fixed date format matching between frontend and database
- Improved nested field matching after lookup operations
- Enhanced regex pattern matching for date strings

### Automatic Indexing
- Indexes created automatically based on query patterns
- Non-blocking background index creation
- Improved query performance over time

## License

This project is for educational purposes.
