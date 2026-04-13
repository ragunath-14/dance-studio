import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Check } from 'lucide-react';
import API_URL from '../config';
import { useData } from '../context/DataContext';
import PaymentRow from './payments/PaymentRow';
import PaymentForm from './payments/PaymentForm';
import Modal from './ui/Modal';
import Button from './ui/Button';
import SkeletonRow from './ui/SkeletonRow';
import Pagination from './ui/Pagination';
import './List.css';

const PaymentList = () => {
  const { payments, students, loading, refreshData, setPayments } = useData();
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
    const MONTHLY_FEE = 1500; // Standard fee
    
    return students.map(student => {
      const rawJoinDate = student.createdAt || student.joinDate || new Date().toISOString();
      const joinDate = new Date(rawJoinDate);
      
      // Total cycles expected since joining (including current month if day has passed)
      let totalCycles = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth()) + 1;
      
      // If today is before join day of the month, the current month's cycle hasn't started yet
      if (today.getDate() < joinDate.getDate()) {
        totalCycles--;
      }

      // Count equivalent months paid by summing total amounts
      const totalPaidAmount = payments.filter(p => {
        const pStudentId = p.studentId?._id || p.studentId;
        return pStudentId === student._id && p.purpose === 'Monthly Fee';
      }).reduce((sum, p) => sum + (p.amount || 0), 0);

      const totalExpectedAmount = totalCycles * MONTHLY_FEE;
      const totalDue = Math.max(0, totalExpectedAmount - totalPaidAmount);
      const pendingMonths = Math.ceil(totalDue / MONTHLY_FEE);

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
        amount: student.totalDue || 1500, // Pay full amount due
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    
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
    setFormData({ studentId: '', amount: '', method: 'Cash', purpose: 'Monthly Fee', date: '' });
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
        <Button onClick={() => setShowModal(true)} icon={Plus}>
          Record Payment
        </Button>
      </div>

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
                    <td>{student.studentName || student.name}</td>
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
          currentDebt={currentDebt}
          isEditing={isEditing}
          onSubmit={handleSubmit} 
          onCancel={closeModals} 
        />
      </Modal>
    </div>
  );
};


export default PaymentList;
