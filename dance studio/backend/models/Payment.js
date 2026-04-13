const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: [true, 'Student reference is required'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  method: { 
    type: String,
    trim: true
  },
  purpose: { 
    type: String,
    trim: true
  },
  remainingFees: { 
    type: Number, 
    default: 0 
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);
