import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ListProvider } from './contexts/ListContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import your pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListDetail from './pages/ListDetail';
import CreateList from './pages/CreateList';
import EditList from './pages/EditList';

// Import styles
import './styles/app.css';

function App() {
  return (
    <AuthProvider>
      <ListProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lists/:id" element={<ListDetail />} />
                <Route path="/lists/create" element={<CreateList />} />
                <Route path="/lists/:id/edit" element={<EditList />} />
              </Route>
              
              {/* Redirect to login if no route matches */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </ListProvider>
    </AuthProvider>
  );
}

export default App;