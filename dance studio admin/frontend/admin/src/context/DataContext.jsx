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
  const [loading, setLoading] = useState(false);

  const fetchAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [stuRes, payRes] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/payments`)
      ]);
      
      setStudents(stuRes.data);
      setPayments(payRes.data);
    } catch (err) {
      console.error('API connection failed.', err.message);
      setStudents([]);
      setPayments([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchAllData();

    // Connect to Socket.io for real-time updates
    const socketUrl = API_URL.replace('/api', '');
    const socket = io(socketUrl);

    socket.on('dataChanged', (data) => {
      console.log('⚡ Real-time update received:', data);
      fetchAllData(true); // Silent refresh
    });

    // Fallback polling every 30 seconds (can be slower now since we have sockets)
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);



  const refreshData = () => fetchAllData();


  return (
    <DataContext.Provider value={{ students, payments, loading, refreshData, setStudents, setPayments }}>
      {children}
    </DataContext.Provider>
  );
};
