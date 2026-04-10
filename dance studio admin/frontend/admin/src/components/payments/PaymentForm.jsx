import React, { useState, useMemo } from 'react';
import Button from '../ui/Button';
import { Search, User } from 'lucide-react';

const PaymentForm = ({ formData, setFormData, students, onSubmit, onCancel }) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return [];
    return students.filter(s => 
      s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.phone.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.danceStyle.toLowerCase().includes(studentSearch.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  }, [students, studentSearch]);

  const handleSelectStudent = (student) => {
    setFormData({ ...formData, studentId: student._id });
    setStudentSearch(student.studentName);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={onSubmit} onClick={() => setShowSuggestions(false)}>
      <div className="form-group" onClick={(e) => e.stopPropagation()}>
        <label>Student Search</label>
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Type student name or email..."
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            required={!formData.studentId}
          />
        </div>
        
        {showSuggestions && filteredStudents.length > 0 && (
          <div className="suggestions-dropdown">
            {filteredStudents.map(s => (
              <div 
                key={s._id} 
                className={`suggestion-item ${formData.studentId === s._id ? 'selected' : ''}`}
                onClick={() => handleSelectStudent(s)}
              >
                <div className="suggestion-icon"><User size={14} /></div>
                <div className="suggestion-details">
                  <span className="name">{s.studentName}</span>
                  <span className="meta">{s.danceStyle} • {s.classType}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {formData.studentId && !showSuggestions && (
          <div className="selected-student-card">
            <div className="card-icon"><User size={18} /></div>
            <div className="card-info">
              <div className="name-row">
                <strong>{students.find(s => s._id === formData.studentId)?.studentName}</strong>
                <span className="badge">{students.find(s => s._id === formData.studentId)?.classType}</span>
              </div>
              <div className="meta-row">
                <span>{students.find(s => s._id === formData.studentId)?.danceStyle}</span>
                <span>•</span>
                <span>{students.find(s => s._id === formData.studentId)?.email}</span>
              </div>
            </div>
            <button type="button" className="clear-selection" onClick={() => {
              setFormData({...formData, studentId: ''});
              setStudentSearch('');
            }}>Change</button>
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount (₹)</label>
          <input 
            type="number" 
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Payment Date</label>
          <input 
            type="date" 
            value={formData.date ? formData.date.split('T')[0] : new Date().toISOString().split('T')[0]} 
            onChange={(e) => setFormData({...formData, date: e.target.value})} 
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Payment Method</label>
          <select 
            value={formData.method} 
            onChange={(e) => setFormData({...formData, method: e.target.value})}
          >
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
        <div className="form-group">
          <label>Purpose</label>
          <select 
            value={formData.purpose} 
            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
          >
            <option value="Monthly Fee">Monthly Fee</option>
            <option value="Registration">Registration</option>
            <option value="Uniform">Uniform</option>
            <option value="Workshop">Workshop</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Payment</Button>
      </div>

    </form>
  );
};

export default PaymentForm;
