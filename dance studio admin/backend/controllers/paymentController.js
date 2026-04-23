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
  try {
    const { studentId, amount } = req.body;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({ message: 'Student is required for payment.' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid payment amount is required.' });
    }

    const payment = new Payment(req.body);
    const newPayment = await payment.save();

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'payment', action: 'create' });

    res.status(201).json(newPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'payment', action: 'delete' });

    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'payment', action: 'update' });

    res.json(updatedPayment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
