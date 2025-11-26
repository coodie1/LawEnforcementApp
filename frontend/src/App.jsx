import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';

// --- ONLY IMPORT THE UNIVERSAL COMPONENT NOW ---
// We have deleted IncidentList and IncidentForm.
// Everything uses this one powerful component.
import GenericCollectionTable from './components/GenericCollectionTable';

import './App.css';

// A simple placeholder for the home page dashboard
function DashboardPlaceholder() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      <p>Welcome to the CrimeDB Admin Panel.</p>
      <p>Select a module from the sidebar to manage data.</p>
      <p style={{marginTop: '20px', color: 'gray'}}>(Charts and stats will appear here)</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* The MainLayout wraps everything so the sidebar is always there */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPlaceholder />} />
            
            {/* === ALL 15 ROUTES ARE NOW UNIFIED === */}
            {/* They all use the same component, just passing a different name. */}
            
            <Route path="incidents" element={<GenericCollectionTable collectionName="incidents" />} />
            <Route path="people" element={<GenericCollectionTable collectionName="people" />} />
            <Route path="arrests" element={<GenericCollectionTable collectionName="arrests" />} />
            <Route path="charges" element={<GenericCollectionTable collectionName="charges" />} />
            <Route path="cases" element={<GenericCollectionTable collectionName="cases" />} />
            <Route path="departments" element={<GenericCollectionTable collectionName="departments" />} />
            <Route path="officers" element={<GenericCollectionTable collectionName="officers" />} />
            <Route path="locations" element={<GenericCollectionTable collectionName="locations" />} />
            <Route path="reports" element={<GenericCollectionTable collectionName="reports" />} />
            <Route path="prisons" element={<GenericCollectionTable collectionName="prisons" />} />
            <Route path="sentences" element={<GenericCollectionTable collectionName="sentences" />} />
            <Route path="vehicles" element={<GenericCollectionTable collectionName="vehicles" />} />
            <Route path="weapons" element={<GenericCollectionTable collectionName="weapons" />} />
            <Route path="evidence" element={<GenericCollectionTable collectionName="evidence" />} />
            <Route path="forensics" element={<GenericCollectionTable collectionName="forensics" />} />

            {/* Redirect any unknown URLs back to the dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;