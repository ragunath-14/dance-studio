import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import PaymentList from './components/PaymentList';
import RegistrationList from './components/students/RegistrationList';
import './App.css';

function App() {
  return (
    <Router>
      <DataProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/registrations" element={<RegistrationList />} />
          </Routes>
        </Layout>
      </DataProvider>
    </Router>
  );
}

export default App;
