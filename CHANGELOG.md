# Changelog

All notable changes to the LawEnforcementApp project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Completed ✅
- **All 15 collection pages now have dedicated filter implementations!**
  - Cases, Arrests, Officers, Departments, Incidents, Charges, People
  - Locations, Evidence, Forensics, Vehicles, Weapons, Reports, Prisons, Sentences

### Added
- Comprehensive filter system for ALL 15 collection pages
- Filters implemented for: Cases, Arrests, Officers, Departments, Incidents, Charges, People, Locations, Evidence, Forensics, Vehicles, Weapons, Reports, Prisons, Sentences
- Filter panels with smooth animations (expand/collapse)
- Active filter badges display
- Cross-collection lookups for advanced filtering (e.g., filtering arrests by officer via case lookup, filtering weapons by owner via person lookup)
- Age calculation for People page based on date of birth
- Duration range filtering for Sentences page
- Date range filters for multiple collections (Incidents, Arrests, Evidence, Forensics, Reports)
- All pages follow consistent design pattern with filter button, collapsible panels, and active filter indicators

### Changed
- Pie chart now displays "Case Status Distribution" instead of "Crime Type Distribution"
- Shows distribution of cases by status (Open, Closed, Under Investigation, Pending)
- Crime type data is still available in the bar chart, avoiding duplication
- Replaced yellow/amber color with red in pie chart color palette

### Fixed
- Index creation now only triggers when user applies filters or sorts, not on every aggregation request
- Prevents unnecessary index creation when fetching filter dropdown options (e.g., unique crime types)
- Index creation messages will no longer appear in terminal when just loading pages or fetching options
- Fixed black background appearing on bar chart tooltip hover - now uses white background with proper styling

### Added
- Filter animation system with smooth expand/collapse transitions
- Filter button with icon rotation and state highlighting
- Active filter badges display
- Comprehensive documentation in README.md and FILTER_ANIMATIONS.md

### Fixed
- Date filtering for `openingDate` field - fixed format matching between frontend and database
- Nested field matching after lookup operations (e.g., `incident.crimeType`)
- Regex pattern matching for string-based date fields
- Filter panel now appears only when "Filters" button is clicked

### Changed
- Filter UI moved from always-visible to collapsible panel
- Filter button styling with active state indication
- Improved date format handling in aggregation pipeline

### Technical Details
- Added `showFilters` state management in Cases.tsx
- Implemented CSS transitions for smooth animations (300ms duration)
- Enhanced backend aggregation to handle nested fields after $lookup stages
- Added $unwind stages for lookup results to enable nested field matching

---

## Documentation Updates

### 2024 - Filter Animations Implementation
- Created FILTER_ANIMATIONS.md documenting the animation system
- Updated README.md with project structure and features
- Documented CSS transition properties and animation states

### 2024 - Automatic Indexing
- Created backend/INDEX_CREATION_LOGIC.md
- Documented automatic index creation based on query patterns
- Explained index creation triggers and rules

---

## Notes for Future Updates

When making changes, please document:
1. **What was changed** - Feature, bug fix, or enhancement
2. **Why it was changed** - Problem solved or improvement made
3. **How it works** - Technical implementation details
4. **Files modified** - List of changed files
5. **Breaking changes** - Any API or behavior changes
6. **Dependencies** - New packages or requirements

