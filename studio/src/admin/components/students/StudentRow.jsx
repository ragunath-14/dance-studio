import React, { useMemo, useState } from 'react';
import { Edit2, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, History } from 'lucide-react';
import Button from '../ui/Button';

const StudentRow = ({ student, onEdit, onDelete, onToggleStatus, onViewHistory }) => {
  const [toggling, setToggling] = useState(false);
  const isActive = student.isActive !== false; // default true for existing students

  const isPaid = useMemo(() => {
    const today = new Date();
    const getMonthlyFee = (student) => student.fee ?? (student.classType === 'Fitness Class' ? 2500 : 3500);
    
    const rawJoinDate = student.createdAt || student.joinDate || new Date().toISOString();
    const joinDate = new Date(rawJoinDate);
    
    // Total cycles expected since joining (consistent with PaymentList)
    let totalCycles = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth()) + 1;
    if (today.getDate() < joinDate.getDate()) {
      totalCycles--;
    }

    if (totalCycles <= 0) return true;

    const totalPaid = student.totalPaid || 0;
    const fee = getMonthlyFee(student);
    const totalExpected = totalCycles * fee;
    
    return totalPaid >= totalExpected;
  }, [student]);

  const handleToggle = async () => {
    setToggling(true);
    await onToggleStatus(student._id);
    setToggling(false);
  };

  return (
    <tr className={!isActive ? 'inactive-row' : ''}>
      <td>
        <div className="student-name-cell">
          <button className="student-name-link" onClick={() => onViewHistory(student)}>
            {student.studentName || student.name}
          </button>
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
      <td style={{ textAlign: 'right' }}>
        <div className="action-buttons" style={{ justifyContent: 'flex-end', paddingRight: '24px' }}>
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
          <Button variant="icon" onClick={() => onViewHistory(student)} icon={History} title="View Payment History" />
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
