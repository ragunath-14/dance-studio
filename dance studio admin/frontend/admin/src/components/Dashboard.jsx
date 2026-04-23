import React, { useMemo } from 'react';
import { Users, CreditCard, TrendingUp, AlertCircle, CheckCircle, Calendar, Music, UserPlus } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Dashboard.css';

const Dashboard = () => {
  const { students, payments, loading, registrations } = useData();

  const metrics = useMemo(() => {
    const getMonthlyFee = (classType) => classType === 'Fitness Class' ? 2500 : 3500;
    const today = new Date();
    const activeStudents = students.filter(s => s.isActive !== false);
    
    // Revenue Calculation (Total collections this month)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthRevenue = payments
      .filter(p => {
        const d = new Date(p.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Unpaid Students Calculation
    const paymentsByStudent = new Map();
    for (const p of payments) {
      if (p.purpose === 'Monthly Fee') {
        const sid = p.studentId?._id?.toString() || p.studentId?.toString();
        if (sid) paymentsByStudent.set(sid, (paymentsByStudent.get(sid) || 0) + (p.amount || 0));
      }
    }

    const overdueCount = activeStudents.filter(student => {
      const joinDate = new Date(student.createdAt || student.joinDate || today);
      let totalCycles = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth()) + 1;
      if (today.getDate() < joinDate.getDate()) totalCycles--;
      if (totalCycles <= 0) return false;
      const totalPaid = paymentsByStudent.get(student._id.toString()) || 0;
      const fee = getMonthlyFee(student.classType);
      return (totalCycles * fee - totalPaid) > 0;
    }).length;

    return {
      total: students.length,
      revenue: monthRevenue,
      overdue: overdueCount,
      pending: registrations.length,
      classTypes: {
        regular: activeStudents.filter(s => s.classType === 'Regular Class').length,
        summer: activeStudents.filter(s => s.classType === 'Summer Class').length,
        fitness: activeStudents.filter(s => s.classType === 'Fitness Class').length,
      }
    };
  }, [students, payments, registrations]);

  const recentActivity = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Combine payments and new registrations into one feed, filtering for last 24h
    const acts = [
      ...payments
        .filter(p => new Date(p.date) >= twentyFourHoursAgo)
        .map(p => ({ 
          type: 'payment', 
          date: new Date(p.date), 
          title: p.studentId?.studentName || 'Student', 
          desc: `Paid ₹${p.amount} for ${p.purpose}`,
          icon: <CreditCard size={14} />,
          color: '#4CAF50'
        })),
      ...registrations
        .filter(r => new Date(r.createdAt) >= twentyFourHoursAgo)
        .map(r => ({
          type: 'reg',
          date: new Date(r.createdAt),
          title: r.studentName,
          desc: `New registration for ${r.classType}`,
          icon: <UserPlus size={14} />,
          color: '#2196F3'
        }))
    ];
    // Return sorted items, capped at 8 for the UI
    return acts.sort((a, b) => b.date - a.date).slice(0, 8);
  }, [payments, registrations]);

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div className="welcome">
          <h1>Welcome back, Admin</h1>
          <p>Here's what's happening today at Expressionz Dance Academy.</p>
        </div>
        <div className="date-display">
          <Calendar size={18} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <div className="stats-grid">
        <StatCard 
          label="Active Students" 
          value={metrics.total} 
          icon={<Users />} 
          color="#FF8C00" 
          trend="+4.2%" 
          loading={loading && students.length === 0}
        />
        <StatCard 
          label="This Month's Revenue" 
          value={`₹${metrics.revenue.toLocaleString()}`} 
          icon={<TrendingUp />} 
          color="#4CAF50" 
          trend="Target: ₹50k"
          loading={loading && payments.length === 0}
        />
        <StatCard 
          label="Pending Approvals" 
          value={metrics.pending} 
          icon={<AlertCircle />} 
          color="#2196F3" 
          trend="New Enquiries"
          loading={loading}
        />
        <StatCard 
          label="Overdue Fees" 
          value={metrics.overdue} 
          icon={<AlertCircle />} 
          color="#F44336" 
          trend="Needs Attention"
          loading={loading}
        />
      </div>
      
      <div className="dashboard-layout">
        <div className="dashboard-main">
          <div className="card class-breakdown">
            <div className="card-header">
              <h2>Class Distribution</h2>
              <Music size={20} className="text-muted" />
            </div>
            <div className="class-pills">
              <div className="pill regular">
                <span>Regular</span>
                <div className="pill-bar-wrap">
                  <div className="pill-bar" style={{ width: `${(metrics.classTypes.regular / (metrics.total || 1)) * 100}%` }}></div>
                </div>
                <strong>{metrics.classTypes.regular}</strong>
              </div>
              <div className="pill summer">
                <span>Summer</span>
                <div className="pill-bar-wrap">
                  <div className="pill-bar" style={{ width: `${(metrics.classTypes.summer / (metrics.total || 1)) * 100}%` }}></div>
                </div>
                <strong>{metrics.classTypes.summer}</strong>
              </div>
              <div className="pill fitness">
                <span>Fitness</span>
                <div className="pill-bar-wrap">
                  <div className="pill-bar" style={{ width: `${(metrics.classTypes.fitness / (metrics.total || 1)) * 100}%` }}></div>
                </div>
                <strong>{metrics.classTypes.fitness}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="card">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <TrendingUp size={20} className="text-muted" />
            </div>
            <div className="activity-feed">
              {recentActivity.length > 0 ? (
                recentActivity.map((act, i) => (
                  <div key={i} className="activity-entry">
                    <div className="activity-icon" style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                      {act.icon}
                    </div>
                    <div className="activity-details">
                      <h4>{act.title}</h4>
                      <p>{act.desc}</p>
                      <span className="activity-time">{new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round((Date.now() - act.date) / (1000 * 60 * 60)), 'hour')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="placeholder-text">No recent activity detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, trend, loading }) => (
  <div className="stat-card">
    <div className="stat-card-inner">
      <div className="stat-icon-wrap" style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{loading ? '...' : value}</h3>
        {trend && <span className="stat-trend" style={{ color: color }}>{trend}</span>}
      </div>
    </div>
  </div>
);

export default Dashboard;
