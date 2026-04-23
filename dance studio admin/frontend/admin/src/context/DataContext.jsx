import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import API_URL from '../config';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [stuRes, payRes, regRes] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/payments`),
        axios.get(`${API_URL}/registrations/pending`)
      ]);
      
      setStudents(stuRes.data);
      setPayments(payRes.data);
      setRegistrations(regRes.data);
    } catch (err) {
      console.error('API connection failed.', err.message);
      // Don't clear state if refresh fails, keep old data
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchAllData();

    // Connect to Socket.io for real-time updates
    const socketUrl = API_URL.endsWith('/api')
      ? API_URL.slice(0, -4)
      : API_URL.replace(/\/api$/, '');
    const socket = io(socketUrl);

    socket.on('dataChanged', (data) => {
      fetchAllData(true); // Silent refresh
    });

    socket.on('registrationApproved', () => {
       fetchAllData(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const refreshData = () => fetchAllData();

  const approveRegistration = async (id) => {
    try {
      await axios.post(`${API_URL}/registrations/${id}/approve`);
      fetchAllData(true);
      return { success: true };
    } catch (err) {
      console.error('Approval failed:', err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const rejectRegistration = async (id) => {
    try {
      await axios.post(`${API_URL}/registrations/${id}/reject`);
      fetchAllData(true);
      return { success: true };
    } catch (err) {
      console.error('Rejection failed:', err);
      return { success: false, message: err.message };
    }
  };

  const toggleStudentStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/students/${id}/toggle-status`);
      fetchAllData(true);
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Toggle status failed:', err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return (
    <DataContext.Provider value={{ 
      students, 
      payments, 
      registrations,
      loading, 
      refreshData, 
      setStudents, 
      setPayments,
      approveRegistration,
      rejectRegistration,
      toggleStudentStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};
