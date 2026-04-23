import React, { useMemo, useState } from 'react';
import { Edit2, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import Button from '../ui/Button';

const StudentRow = ({ student, payments, onEdit, onDelete, onToggleStatus }) => {
  const [toggling, setToggling] = useState(false);
  const isActive = student.isActive !== false; // default true for existing students

  const isPaid = useMemo(() => {
    const today = new Date();
    const rawJoinDate = student.createdAt || student.joinDate || new Date().toISOString();
    const joinDate = new Date(rawJoinDate);
    
    let monthsPassed = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth());
    const thisMonthAnniversary = new Date(today.getFullYear(), today.getMonth(), joinDate.getDate());
    if (thisMonthAnniversary.getMonth() !== today.getMonth()) {
      thisMonthAnniversary.setDate(0); 
    }
    if (today < thisMonthAnniversary) {
      monthsPassed--;
    }

    const cycleDate = new Date(joinDate);
    cycleDate.setMonth(cycleDate.getMonth() + monthsPassed);
    if (cycleDate.getDate() !== joinDate.getDate()) {
      cycleDate.setDate(0);
    }
    const currentCycleStartDate = cycleDate;

    return payments.some(p => {
      const paymentDate = new Date(p.date);
      const pStudentId = p.studentId?._id || p.studentId;
      return pStudentId === student._id && paymentDate >= currentCycleStartDate;
    });
  }, [student, payments]);

  const handleToggle = async () => {
    setToggling(true);
    await onToggleStatus(student._id);
    setToggling(false);
  };

  return (
    <tr className={!isActive ? 'inactive-row' : ''}>
      <td>
        <div className="student-name-cell">
          {student.studentName || student.name}
          <div className="badge-row">
            {isActive ? (
              isPaid ? (
                <span className="mini-badge paid"><CheckCircle size={12} /> Paid</span>
              ) : (
                <span className="mini-badge unpaid"><AlertCircle size={12} /> Unpaid</span>
              )
            ) : (
              <span className="mini-badge inactive-badge">Inactive</span>
            )}
          </div>
        </div>
      </td>
      <td>
        <div className="contact-info">
          {student.email && <span className="email">{student.email}</span>}
          <span className="phone">P: {student.phone}</span>
          {student.whatsappNumber && student.whatsappNumber !== student.phone && (
            <span className="phone">W: {student.whatsappNumber}</span>
          )}
        </div>
      </td>
      <td>
        <div className="dance-info">
          {student.danceStyle && <span>{student.danceStyle}</span>}
          {student.danceForFitness && (
            <span className="fitness-tag">{student.danceForFitness}</span>
          )}
        </div>
      </td>
      <td>
        <span className="join-date">
          {new Date(student.createdAt || student.joinDate).toLocaleDateString('en-GB')}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          <button 
            className={`status-toggle-btn ${isActive ? 'active' : 'inactive'}`}
            onClick={handleToggle}
            disabled={toggling}
            title={isActive ? 'Mark Inactive' : 'Mark Active'}
          >
            {toggling ? (
              <span className="toggle-spinner"></span>
            ) : isActive ? (
              <><ToggleRight size={16} /> Active</>
            ) : (
              <><ToggleLeft size={16} /> Inactive</>
            )}
          </button>
          <Button variant="icon" onClick={() => {
            onEdit(student);
          }} icon={Edit2} />
          <Button variant="icon" className="delete" onClick={() => {
            onDelete(student._id);
          }} icon={Trash2} />
        </div>
      </td>
    </tr>
  );
};


export default StudentRow;
