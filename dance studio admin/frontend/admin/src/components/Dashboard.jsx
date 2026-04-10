import React, { useMemo } from 'react';
import { Users, CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Dashboard.css';

const Dashboard = () => {
  const { students, payments, loading } = useData();

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const paidStudentIds = new Set(payments.map(p => p.studentId?._id || p.studentId));
    const paidCount = paidStudentIds.size;
    const unpaidCount = totalStudents - paidCount;

    const activeBatches = new Set(students.map(s => s.classType)).size;

    return [
      { label: 'Total Students', value: totalStudents, icon: <Users size={24} />, color: '#FF8C00' },
      { label: 'Paid Students', value: paidCount, icon: <CheckCircle size={24} />, color: '#4CAF50' },
      { label: 'Active Classes', value: loading && students.length === 0 ? '...' : activeBatches, icon: <TrendingUp size={24} />, color: '#2196F3' },
      { label: 'Unpaid Students', value: unpaidCount, icon: <AlertCircle size={24} />, color: '#F44336' },
    ];

  }, [students, payments]);

  const recentTransactions = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return payments
      .filter(pay => new Date(pay.date) >= twentyFourHoursAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments]);

  return (
    <div className="dashboard animate-fade-in">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{loading && students.length === 0 ? '...' : stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-content single-col">
        <div className="card">
          <h2>Recent Activity (Last 24h)</h2>
          <div className="activity-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((pay, i) => (
                <div key={i} className="activity-item">
                  <span className="dot" style={{ backgroundColor: '#4CAF50' }}></span>
                  <p>
                    <strong>{pay.studentId?.studentName || pay.studentId?.name || 'A student'}</strong> paid ₹{pay.amount} for {pay.purpose}
                  </p>
                  <span className="time">{new Date(pay.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            ) : (
              <p className="placeholder-text">No transactions in the last 24 hours.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




export default Dashboard;
