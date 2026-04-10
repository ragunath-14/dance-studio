import React, { useMemo } from 'react';
import { Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

const StudentRow = ({ student, payments, onEdit, onDelete, onSwitch }) => {
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

  return (
    <tr>
      <td>
        <div className="student-name-cell">
          {student.studentName || student.name}
          {isPaid ? (
            <span className="mini-badge paid"><CheckCircle size={12} /> Paid</span>
          ) : (
            <span className="mini-badge unpaid"><AlertCircle size={12} /> Unpaid</span>
          )}
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
          <Button 
            variant="icon" 
            onClick={() => onSwitch(student)} 
            icon={() => (
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                {student.classType === 'Regular Class' ? 'SUM' : 'REG'}
              </span>
            )} 
            title={`Move to ${student.classType === 'Regular Class' ? 'Summer' : 'Regular'}`}
          />
          <Button variant="icon" onClick={() => onEdit(student)} icon={Edit2} />
          <Button variant="icon" className="delete" onClick={() => onDelete(student._id)} icon={Trash2} />
        </div>
      </td>
    </tr>
  );
};


export default StudentRow;
