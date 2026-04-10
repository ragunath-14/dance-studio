const Payment = require('../models/Payment');
const Student = require('../models/Registration');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('studentId', 'studentName')
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payments.' 
    });
  }
};

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private (Admin)
exports.createPayment = async (req, res) => {
  try {
    const { studentId, amount } = req.body;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student is required for payment.' 
      });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A valid payment amount is required.' 
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found. Cannot record payment.' 
      });
    }

    const payment = new Payment(req.body);
    const newPayment = await payment.save();
    
    // Populate student name before returning
    await newPayment.populate('studentId', 'studentName');
    
    res.status(201).json(newPayment);

  } catch (err) {
    console.error('Error creating payment:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join('. ') 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error. Could not record payment.' 
    });
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found.' 
      });
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Payment deleted successfully.' 
    });

  } catch (err) {
    console.error('Error deleting payment:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment ID format.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error. Could not delete payment.' 
    });
  }
};
