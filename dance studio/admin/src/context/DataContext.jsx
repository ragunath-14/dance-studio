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
  const [students, setStudents] = useState({ data: [], total: 0, page: 1, limit: 50 });
  const [unpaidStudents, setUnpaidStudents] = useState({ data: [], total: 0, page: 1, limit: 50 });
  const [allStudents, setAllStudents] = useState([]); // For dropdowns
  const [payments, setPayments] = useState({ data: [], total: 0, page: 1, limit: 50 });
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`, { params: { limit: 1000 } });
      setAllStudents(res.data.data);
    } catch (err) {
      console.error('All students fetch failed:', err);
    }
  };

  const fetchStudents = async (page = 1, limit = 50, search = '', classType = '') => {
    try {
      const res = await axios.get(`${API_URL}/students`, { params: { page, limit, search, classType } });
      setStudents(res.data);
    } catch (err) {
      console.error('Students fetch failed:', err);
    }
  };

  const fetchPayments = async (page = 1, limit = 50) => {
    try {
      const res = await axios.get(`${API_URL}/payments`, { params: { page, limit } });
      setPayments(res.data);
    } catch (err) {
      console.error('Payments fetch failed:', err);
    }
  };

  const fetchUnpaidStudents = async (page = 1, limit = 50) => {
    try {
      const res = await axios.get(`${API_URL}/students/unpaid`, { params: { page, limit } });
      setUnpaidStudents(res.data);
    } catch (err) {
      console.error('Unpaid fetch failed:', err);
    }
  };

  const fetchAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchAllStudents(),
        fetchStudents(1, 50),
        fetchPayments(1, 50),
        fetchUnpaidStudents(1, 50)
      ]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const socketUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL.replace(/\/api$/, '');
    const socket = io(socketUrl);

    socket.on('dataChanged', () => fetchAllData(true));
    socket.on('registrationApproved', () => fetchAllData(true));

    return () => socket.disconnect();
  }, []);

  const refreshData = () => fetchAllData();

  const approveRegistration = async (id) => {
    try {
      await axios.post(`${API_URL}/registrations/${id}/approve`);
      fetchAllData(true);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const rejectRegistration = async (id) => {
    try {
      await axios.post(`${API_URL}/registrations/${id}/reject`);
      fetchAllData(true);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleStudentStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/students/${id}/toggle-status`);
      fetchAllData(true);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return (
    <DataContext.Provider value={{ 
      students, 
      unpaidStudents,
      allStudents,
      payments, 
      registrations,
      stats,
      loading, 
      refreshData,
      fetchStudents,
      fetchPayments,
      fetchUnpaidStudents,
      approveRegistration,
      rejectRegistration,
      toggleStudentStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};
