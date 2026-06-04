import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import PaymentList from './components/PaymentList';
import RegistrationList from './components/students/RegistrationList';
import ActivityLog from './components/ActivityLog';

import Login from './pages/Login';
import { useTheme } from './context/ThemeContext';
import './App.css';
import './AdminBase.css';

const AdminRoot = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div className="admin-root" data-theme={theme}>
      {children}
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminModule = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuth') === 'true';
  });

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('isAdminAuth', 'true');
    } else {
      localStorage.removeItem('isAdminAuth');
      localStorage.removeItem('adminToken');
    }
  };

  return (
    <ThemeProvider>
      <AdminRoot>
        <DataProvider isAuthenticated={isAuthenticated}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            
            <Route path="/*" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={() => handleLogin(false)}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="payments" element={<PaymentList />} />
                    <Route path="registrations" element={<RegistrationList />} />
                    <Route path="activity" element={<ActivityLog />} />

                    {/* Fallback to dashboard */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </DataProvider>
      </AdminRoot>
    </ThemeProvider>
  );
};

export default AdminModule;
