import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { X, CreditCard, Calendar, TrendingDown } from 'lucide-react';
import API_URL from '../../config';
import Button from '../ui/Button';

// Render inside .admin-root so CSS-scoped styles apply (same pattern as Modal.jsx)
const getPortalRoot = () => {
  let portalRoot = document.getElementById('admin-history-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'admin-history-portal';
    const adminRoot = document.querySelector('.admin-root');
    if (adminRoot) {
      adminRoot.appendChild(portalRoot);
    } else {
      document.body.appendChild(portalRoot);
    }
  }
  return portalRoot;
};

const PaymentHistoryModal = ({ student, onClose, onRecordPayment }) => {
  const [studentPayments, setStudentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalRoot, setPortalRoot] = useState(null);

  const studentIdStr = student?._id?.toString();

  // Setup portal root
  useEffect(() => {
    if (student) {
      setPortalRoot(getPortalRoot());
    }
  }, [student]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && student) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [student, onClose]);

  useEffect(() => {
    if (!studentIdStr) {
      setStudentPayments([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    axios.get(`${API_URL}/payments/student/${studentIdStr}`)
      .then(res => {
        if (isMounted) {
          setStudentPayments(res.data || []);
        }
      })
      .catch(err => {
        console.error('Failed to fetch student payments:', err);
        if (isMounted) setStudentPayments([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [studentIdStr]);

  if (!student || !portalRoot) return null;

  // Age-based fee: Kids (≤9) → ₹1500, Adults (>9) → ₹2500 — matches backend exactly
  const getMonthlyFee = (s) => {
    if (s?.fee && s.fee > 0) return s.fee;
    const age = parseInt(s?.studentAge, 10);
    return !isNaN(age) && age <= 9 ? 1500 : 2500;
  };
  const today = new Date();

  const joinDate = new Date(student.createdAt || student.joinDate || today);
  let totalCycles = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth()) + 1;
  if (today.getDate() < joinDate.getDate()) totalCycles--;
  if (totalCycles < 0) totalCycles = 0;

  const fee = getMonthlyFee(student);
  const totalPaid = studentPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalExpected = totalCycles * fee;
  const totalDue = Math.max(0, totalExpected - totalPaid);

  const modalContent = (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal" onClick={e => e.stopPropagation()}>
        <div className="history-header">
          <div>
            <h2>{student.studentName || student.name}</h2>
            <p>{student.classType} · {student.dayType || ''} · Joined {joinDate.toLocaleDateString('en-GB')}</p>
          </div>
          <button className="history-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="history-metadata">
          <div className="metadata-item">
            <span>Phone:</span>
            <strong>{student.phone || '—'}</strong>
          </div>
          <div className="metadata-item">
            <span>Email:</span>
            <strong>{student.email || '—'}</strong>
          </div>
          <div className="metadata-item">
            <span>Batch:</span>
            <strong>{student.batchTiming || '—'}</strong>
          </div>
          <div className="metadata-item">
            <span>Location:</span>
            <strong>{student.location || '—'}</strong>
          </div>
          {student.whatsappNumber && student.whatsappNumber !== student.phone && (
            <div className="metadata-item full-width">
              <span>WhatsApp:</span>
              <strong>{student.whatsappNumber}</strong>
            </div>
          )}
        </div>

        <div className="history-summary">
          <div className="hs-card green">
            <CreditCard size={18} />
            <div>
              <span>Total Paid</span>
              <strong>{loading ? '...' : `₹${totalPaid.toLocaleString()}`}</strong>
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
              <strong>{loading ? '...' : (totalDue > 0 ? `₹${totalDue.toLocaleString()}` : 'Clear ✓')}</strong>
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
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: '24px', color: 'var(--text-muted)' }}>
                    Loading payment records...
                  </td>
                </tr>
              ) : studentPayments.length > 0 ? (
                studentPayments.map((p, i) => (
                  <tr key={i}>
                    <td>{new Date(p.date).toLocaleDateString('en-GB')}</td>
                    <td style={{ color: '#4CAF50', fontWeight: 700 }}>₹{(p.amount || 0).toLocaleString()}</td>
                    <td>{p.method || '—'}</td>
                    <td>{p.purpose || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💸</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>No payments done yet</div>
                    <div style={{ fontSize: '0.82rem', opacity: 0.7 }}>Use "Record Payment" below to add a payment entry.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="history-footer">
          <Button variant="primary" onClick={() => { onClose(); if (onRecordPayment) onRecordPayment(student); }}>Record Payment</Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalRoot);
};

export default PaymentHistoryModal;
