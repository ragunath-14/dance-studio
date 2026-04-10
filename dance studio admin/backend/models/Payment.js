const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String },
  purpose: { type: String }
});

module.exports = mongoose.model('Payment', PaymentSchema);
