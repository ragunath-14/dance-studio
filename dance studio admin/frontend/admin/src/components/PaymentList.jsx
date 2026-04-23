import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Check, Bell, History, X, CreditCard, Calendar, TrendingDown } from 'lucide-react';
import API_URL from '../config';
import { useData } from '../context/DataContext';
import PaymentRow from './payments/PaymentRow';
import PaymentForm from './payments/PaymentForm';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import Button from './ui/Button';
import SkeletonRow from './ui/SkeletonRow';
import Pagination from './ui/Pagination';
import './List.css';

const PaymentList = () => {
  const { payments, students, loading, refreshData } = useData();
  const [activeTab, setActiveTab] = useState('paid');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    method: 'Cash',
    purpose: 'Monthly Fee',
    date: '',
    remainingFees: 0
  });
  const [currentDebt, setCurrentDebt] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alertState, setAlertState] = useState({ loading: false, message: '', type: '', results: [] });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, paymentId: null });
  const [confirmAlerts, setConfirmAlerts] = useState(false);
  const [historyStudent, setHistoryStudent] = useState(null); // student object for history modal

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredPayments = useMemo(() => {
    return payments.filter(p => 
      (p.studentId?.studentName || p.studentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.method || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);


  const unpaidStudents = useMemo(() => {
    const today = new Date();
    const getMonthlyFee = (classType) => classType === 'Fitness Class' ? 2500 : 3500;
    
    // Group monthly payments per student upfront (O(M)) to avoid O(N*M) nested loops
    const paymentsByStudent = new Map();
    for (const p of payments) {
      if (p.purpose === 'Monthly Fee') {
        const pStudentId = p.studentId?._id || p.studentId;
        if (pStudentId) {
          paymentsByStudent.set(pStudentId.toString(), (paymentsByStudent.get(pStudentId.toString()) || 0) + (p.amount || 0));
        }
      }
    }

    return students.map(student => {
      const rawJoinDate = student.createdAt || student.joinDate || new Date().toISOString();
      const joinDate = new Date(rawJoinDate);
      
      // Total cycles expected since joining (including current month if day has passed)
      let totalCycles = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth()) + 1;
      
      // If today is before join day of the month, the current month's cycle hasn't started yet
      if (today.getDate() < joinDate.getDate()) {
        totalCycles--;
      }

      // Count equivalent months paid by directly looking up from the map
      const totalPaidAmount = paymentsByStudent.get(student._id.toString()) || 0;

      const fee = getMonthlyFee(student.classType);
      const totalExpectedAmount = totalCycles * fee;
      const totalDue = Math.max(0, totalExpectedAmount - totalPaidAmount);
      const pendingMonths = Math.ceil(totalDue / fee);

      return {
        ...student,
        pendingMonths,
        totalDue
      };
    }).filter(student => {
      const studentName = student.studentName || student.name || '';
      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      return student.pendingMonths > 0 && matchesSearch;
    }).sort((a, b) => b.totalDue - a.totalDue); // Show highest debtors first
  }, [students, payments, searchTerm]);


  // Paginated Views
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const paginatedUnpaid = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return unpaidStudents.slice(start, start + itemsPerPage);
  }, [unpaidStudents, currentPage]);

  const totalPages = activeTab === 'paid' 
    ? Math.ceil(filteredPayments.length / itemsPerPage)
    : Math.ceil(unpaidStudents.length / itemsPerPage);

  // Effect to reset page when filtering changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Clear alert banner when switching tabs
  React.useEffect(() => {
    setAlertState({ loading: false, message: '', type: '', results: [] });
  }, [activeTab]);

  // ── Trigger today's scheduled fee-alert job immediately (manual test) ────────
  const handleSendAlerts = () => {
    setConfirmAlerts(true);
  };

  const executeSendAlerts = async () => {
    setConfirmAlerts(false);
    setAlertState({ loading: true, message: '', type: '', results: [] });
    try {
      // Use the send-pending-alerts endpoint which returns detailed per-student results
      const res = await axios.post(`${API_URL}/payments/send-pending-alerts`);
      const data = res.data;
      setAlertState({
        loading: false,
        message: data.message,
        type: 'success',
        results: data.results || []
      });
    } catch (err) {
      setAlertState({
        loading: false,
        message: err.response?.data?.message || 'Failed to trigger alert job.',
        type: 'error',
        results: []
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/payments/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/payments`, formData);
      }
      await refreshData();
      
      setActiveTab('paid');
      closeModals();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save payment. Please try again.';
      alert(errorMsg);
      console.error('Payment error:', err);
    }
  };

  const handlePay = (student) => {
    setCurrentDebt(student.totalDue);
    setFormData({
      studentId: student._id,
      amount: student.totalDue,
      method: 'Cash',
      purpose: 'Monthly Fee',
      date: new Date().toISOString().split('T')[0],
      remainingFees: 0
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleQuickPay = async (student) => {
    try {
      await axios.post(`${API_URL}/payments`, {
        studentId: student._id,
        amount: student.totalDue || (student.classType === 'Fitness Class' ? 2500 : 3500), // Pay full amount due
        method: 'Cash',
        purpose: 'Monthly Fee',
        remainingFees: 0,
        date: new Date().toISOString()
      });

      await refreshData();
      setActiveTab('paid');
    } catch (err) {
      alert('Failed to record quick payment.');
      console.error('Quick pay error:', err);
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ open: true, paymentId: id });
  };

  const executeDelete = async () => {
    const id = confirmDelete.paymentId;
    setConfirmDelete({ open: false, paymentId: null });
    try {
      await axios.delete(`${API_URL}/payments/${id}`);
      await refreshData();
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert('Failed to delete payment.');
    }
  };


  const handleEdit = (payment) => {
    setFormData({
      studentId: payment.studentId?._id || payment.studentId,
      amount: payment.amount,
      method: payment.method || 'Cash',
      purpose: payment.purpose || 'Monthly Fee',
      date: payment.date ? payment.date.split('T')[0] : '',
      remainingFees: payment.remainingFees || 0
    });
    setEditingId(payment._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setCurrentDebt(0);
    setFormData({ studentId: '', amount: '', method: 'Cash', purpose: 'Monthly Fee', date: '', remainingFees: 0 });
  };

  // ── Student Payment History ────────────────────────────────────────────────
  const getStudentHistory = (student) => {
    const getMonthlyFee = (ct) => ct === 'Fitness Class' ? 2500 : 3500;
    const today = new Date();
    const studentIdStr = student._id?.toString();

    const studentPayments = payments
      .filter(p => {
        const pid = p.studentId?._id?.toString() || p.studentId?.toString();
        return pid === studentIdStr;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const joinDate = new Date(student.createdAt || student.joinDate || today);
    let totalCycles = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth()) + 1;
    if (today.getDate() < joinDate.getDate()) totalCycles--;
    if (totalCycles < 0) totalCycles = 0;

    const fee = getMonthlyFee(student.classType);
    const totalPaid = studentPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalExpected = totalCycles * fee;
    const totalDue = Math.max(0, totalExpected - totalPaid);

    return { studentPayments, totalPaid, totalExpected, totalDue, fee, totalCycles, joinDate };
  };

  return (
    <div className="payment-list animate-fade-in">
      <div className="list-header">
        <div className="header-left-group">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'paid' ? 'active' : ''}`}
              onClick={() => setActiveTab('paid')}
            >
              Paid ({payments.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'unpaid' ? 'active' : ''}`}
              onClick={() => setActiveTab('unpaid')}
            >
              Unpaid ({unpaidStudents.length})
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeTab === 'unpaid' && unpaidStudents.length > 0 && (
            <Button
              id="send-pending-alerts-btn"
              variant="secondary"
              onClick={handleSendAlerts}
              disabled={alertState.loading}
              icon={alertState.loading ? null : Bell}
            >
              {alertState.loading ? 'Sending...' : '🔔 Run Alerts Now'}
            </Button>
          )}
          <Button onClick={() => setShowModal(true)} icon={Plus}>
            Record Payment
          </Button>
        </div>
      </div>

      {/* Alert feedback banner */}
      {alertState.message && (
        <div style={{
          margin: '0 0 12px 0',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          background: alertState.type === 'success' ? '#d1fae5' : '#fee2e2',
          color:      alertState.type === 'success' ? '#065f46'  : '#991b1b',
          border:     `1px solid ${alertState.type === 'success' ? '#6ee7b7' : '#fca5a5'}`
        }}>
          {alertState.type === 'success' ? '✅' : '❌'} {alertState.message}
          {alertState.results.length > 0 && (
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
              {alertState.results.map(r => (
                <li key={r.studentId}>
                  <strong>{r.studentName}</strong> — ₹{r.totalDue} ({r.pendingMonths} month{r.pendingMonths > 1 ? 's' : ''})
                  &nbsp;{r.alertSent ? '✅ Sent' : `⚠️ Not sent${r.alertReason ? ` (${r.alertReason})` : ''}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Auto-schedule info note */}
      {activeTab === 'unpaid' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 14px', borderRadius: '8px', marginBottom: '10px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          color: '#1d4ed8', fontSize: '0.8rem'
        }}>
          <Bell size={14} />
          <span>
            <strong>Auto-alerts are active.</strong> WhatsApp reminders are sent automatically at 06:00 AM on each student's monthly fee-due date.
            Use <em>Run Alerts Now</em> to trigger today's check immediately.
          </span>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            {activeTab === 'paid' ? (
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Purpose</th>
                <th>Actions</th>
              </tr>
            ) : (
              <tr>
                <th>Student Name</th>
                <th>Phone</th>
                <th>Pending</th>
                <th>Total Due</th>
                <th>Actions</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading && (payments.length === 0 || students.length === 0) ? (
              <>
                <SkeletonRow columns={activeTab === 'paid' ? 6 : 5} />
                <SkeletonRow columns={activeTab === 'paid' ? 6 : 5} />
                <SkeletonRow columns={activeTab === 'paid' ? 6 : 5} />
              </>
            ) : activeTab === 'paid' ? (
              paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <PaymentRow 
                    key={payment._id} 
                    payment={payment} 
                    onDelete={handleDelete} 
                    onEdit={handleEdit}
                    onViewHistory={(studentId) => {
                      const s = students.find(st => st._id === (payment.studentId?._id || payment.studentId));
                      if (s) setHistoryStudent(s);
                    }}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    {loading ? 'Refreshing...' : 'No payment records found'}
                  </td>
                </tr>
              )
            ) : (
              paginatedUnpaid.length > 0 ? (
                paginatedUnpaid.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <button className="student-name-link" onClick={() => setHistoryStudent(student)}>
                        {student.studentName || student.name}
                      </button>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{student.classType}</div>
                    </td>
                    <td>{student.phone}</td>
                    <td><span className="pending-badge">{student.pendingMonths} month{student.pendingMonths > 1 ? 's' : ''}</span></td>
                    <td className="amount due">₹{student.totalDue}</td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handlePay(student)}
                        >
                          Pay
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleQuickPay(student)}
                          title="Clear Full Amount"
                        >
                          <Check size={14} /> Clear All
                        </Button>
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => setHistoryStudent(student)}
                          title="View Payment History"
                          icon={History}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    {loading ? 'Refreshing...' : 'All students have paid!'}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      <Modal 
        isOpen={showModal} 
        onClose={closeModals} 
        title={isEditing ? "Edit Payment Detail" : "Record New Payment"}
      >
        <PaymentForm 
          formData={formData} 
          setFormData={setFormData} 
          students={students} 
          payments={payments}
          currentDebt={currentDebt}
          isEditing={isEditing}
          onSubmit={handleSubmit} 
          onCancel={closeModals} 
        />
      </Modal>

      {/* Confirm: Mark payment as unpaid (delete) */}
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title="Mark as Unpaid"
        message="This will delete the payment record. The student will appear in the Unpaid list again."
        confirmText="Yes, Mark Unpaid"
        cancelText="Cancel"
        danger={true}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ open: false, paymentId: null })}
      />

      {/* Confirm: Send WhatsApp fee alerts */}
      <ConfirmDialog
        isOpen={confirmAlerts}
        title="Send Fee Alerts"
        message={`Send WhatsApp pending-fee reminders to students whose fee day is TODAY and have pending fees?`}
        confirmText="Yes, Send Alerts"
        cancelText="Cancel"
        onConfirm={executeSendAlerts}
        onCancel={() => setConfirmAlerts(false)}
      />

      {/* ── Student Payment History Modal ────────────────────────────── */}
      {historyStudent && (() => {
        const { studentPayments, totalPaid, totalExpected, totalDue, fee, totalCycles, joinDate } = getStudentHistory(historyStudent);
        return (
          <div className="history-overlay" onClick={() => setHistoryStudent(null)}>
            <div className="history-modal" onClick={e => e.stopPropagation()}>
              <div className="history-header">
                <div>
                  <h2>{historyStudent.studentName || historyStudent.name}</h2>
                  <p>{historyStudent.classType} · Joined {joinDate.toLocaleDateString('en-GB')}</p>
                </div>
                <button className="history-close-btn" onClick={() => setHistoryStudent(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="history-summary">
                <div className="hs-card green">
                  <CreditCard size={18} />
                  <div>
                    <span>Total Paid</span>
                    <strong>₹{totalPaid.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="hs-card orange">
                  <Calendar size={18} />
                  <div>
                    <span>Months Billed</span>
                    <strong>{totalCycles} month{totalCycles !== 1 ? 's' : ''} × ₹{fee}</strong>
                  </div>
                </div>
                <div className={`hs-card ${totalDue > 0 ? 'red' : 'green'}`}>
                  <TrendingDown size={18} />
                  <div>
                    <span>Pending Dues</span>
                    <strong>{totalDue > 0 ? `₹${totalDue.toLocaleString()}` : 'Clear ✓'}</strong>
                  </div>
                </div>
              </div>

              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPayments.length > 0 ? studentPayments.map((p, i) => (
                      <tr key={i}>
                        <td>{new Date(p.date).toLocaleDateString('en-GB')}</td>
                        <td style={{ color: '#4CAF50', fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                        <td>{p.method || '—'}</td>
                        <td>{p.purpose || '—'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="text-center" style={{ padding: '24px', color: 'var(--text-muted)' }}>No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="history-footer">
                <Button variant="primary" onClick={() => { setHistoryStudent(null); handlePay(historyStudent); }}>Record Payment</Button>
                <Button variant="secondary" onClick={() => setHistoryStudent(null)}>Close</Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};


export default PaymentList;
