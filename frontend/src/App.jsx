import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GenericCollectionTable from './components/GenericCollectionTable';
import { CircularProgress, Box } from '@mui/material';

import './App.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
            
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
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;