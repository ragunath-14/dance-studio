const Payment = require('../models/Payment');

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('studentId', 'studentName').sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a payment
exports.createPayment = async (req, res) => {
  const payment = new Payment(req.body);
  try {
    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
