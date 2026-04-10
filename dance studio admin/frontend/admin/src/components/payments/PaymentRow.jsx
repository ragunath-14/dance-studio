import { RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

const PaymentRow = ({ payment, onDelete }) => {
  return (
    <tr>
      <td>{new Date(payment.date).toLocaleDateString('en-GB')}</td>
      <td>{payment.studentId?.studentName || payment.studentId?.name || 'Unknown'}</td>
      <td className="amount">₹{payment.amount}</td>
      <td className="hide-mobile">
        <span className="method-badge">
          {payment.method}
        </span>
      </td>
      <td className="hide-mobile">{payment.purpose}</td>
      <td>
        <div className="action-buttons">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onDelete(payment._id)} 
            icon={RotateCcw} 
            title="Mark as Unpaid"
          >
            <span className="hide-mobile">Mark as Unpaid</span>
          </Button>
        </div>
      </td>
    </tr>

  );
};

export default PaymentRow;
