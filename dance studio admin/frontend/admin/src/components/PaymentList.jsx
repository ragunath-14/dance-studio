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
    purpose: 'Monthly Fee'
  });

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
    
    return students.filter(student => {
      // FIX: Use createdAt if available, then joinDate, default to today
      const rawJoinDate = student.createdAt || student.joinDate || new Date().toISOString();
      const joinDate = new Date(rawJoinDate);
      
      // Calculate current cycle start date
      const cycleDate = new Date(joinDate);
      let monthsPassed = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth());
      
      const thisMonthAnniversary = new Date(today.getFullYear(), today.getMonth(), joinDate.getDate());
      if (thisMonthAnniversary.getMonth() !== today.getMonth()) {
        thisMonthAnniversary.setDate(0); 
      }

      if (today < thisMonthAnniversary) {
        monthsPassed--;
      }

      cycleDate.setMonth(cycleDate.getMonth() + monthsPassed);
      if (cycleDate.getDate() !== joinDate.getDate()) {
        cycleDate.setDate(0);
      }
      const currentCycleStartDate = cycleDate;

      // Check if student has a payment record in the current cycle
      const hasPaidForCurrentCycle = payments.some(p => {
        const paymentDate = new Date(p.date);
        const pStudentId = p.studentId?._id || p.studentId;
        return pStudentId === student._id && paymentDate >= currentCycleStartDate;
      });

      const studentName = student.studentName || student.name || '';
      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      return !hasPaidForCurrentCycle && matchesSearch;
    });
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
      await axios.post(`${API_URL}/payments`, formData);
      await refreshData();
      
      setActiveTab('paid');
      setShowModal(false);
      setFormData({ studentId: '', amount: '', method: 'Cash', purpose: 'Monthly Fee' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to record payment. Please try again.';
      alert(errorMsg);
      console.error('Payment error:', err);
    }
  };

  const handleQuickPay = async (student) => {
    try {
      await axios.post(`${API_URL}/payments`, {
        studentId: student._id,
        amount: 1500,
        method: 'Cash',
        purpose: 'Monthly Fee',
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


  const closeModals = () => {
    setShowModal(false);
    setFormData({ studentId: '', amount: '', method: 'Cash', purpose: 'Monthly Fee' });
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
                <th>Email</th>
                <th>Phone</th>
                <th>Dance Style</th>
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
                  <PaymentRow key={payment._id} payment={payment} onDelete={handleDelete} />
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
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td className="hide-mobile">{student.danceStyle}</td>
                    <td>

                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleQuickPay(student)}
                      >
                        <Check size={14} /> Mark as Paid
                      </Button>
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
        title="Record New Payment"
      >
        <PaymentForm 
          formData={formData} 
          setFormData={setFormData} 
          students={students} 
          onSubmit={handleSubmit} 
          onCancel={closeModals} 
        />
      </Modal>
    </div>
  );
};


export default PaymentList;
