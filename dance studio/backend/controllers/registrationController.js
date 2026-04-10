const Student = require('../models/Registration');

// Helper: Format mongoose validation errors into readable messages
const formatValidationErrors = (error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return messages;
  }
  return [error.message || 'An unexpected error occurred'];
};

// @desc    Register a new student (Public registration form)
// @route   POST /api/register
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    const { studentName, phone } = req.body;

    // -- Server-side validation --
    if (!studentName || !studentName.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student name is required.',
        field: 'studentName'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required.',
        field: 'phone'
      });
    }

    // Check for duplicate phone number
    const existingStudent = await Student.findOne({ phone: phone.trim() });
    if (existingStudent) {
      return res.status(409).json({ 
        success: false, 
        message: 'A student with this phone number is already registered. Please contact us if you need to update your details.',
        field: 'phone'
      });
    }

    // Clean the data
    const cleanData = { ...req.body };
    delete cleanData.whatsappSame; // Remove frontend-only field

    const student = new Student(cleanData);
    await student.save();

    // Emit event for real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'registration', name: student.studentName });

    res.status(201).json({ 
      success: true, 
      message: 'Registration submitted successfully! We will contact you soon.',
      data: { id: student._id, studentName: student.studentName }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = formatValidationErrors(error);
      return res.status(400).json({ 
        success: false, 
        message: messages.join('. '),
        errors: messages
      });
    }

    // Handle duplicate key errors (e.g. unique index)
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'This registration already exists.'
      });
    }

    // Generic server error
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later or contact us directly.'
    });
  }
};

// @desc    Get all students/registrations
// @route   GET /api/registrations
// @access  Private (Admin)
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Student.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error('Fetch registrations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Could not fetch records. Please try again.'
    });
  }
};
