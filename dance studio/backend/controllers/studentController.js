const Student = require('../models/Registration');

// Helper: Format mongoose validation errors
const formatValidationErrors = (error) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map(err => err.message);
  }
  return [error.message || 'An unexpected error occurred'];
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch students. Please try again.' 
    });
  }
};

// @desc    Create a student (Admin add)
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Handle field name compatibility
    if (!data.studentName && data.name) {
      data.studentName = data.name;
    }
    if (!data.createdAt && data.joinDate) {
      data.createdAt = data.joinDate;
    }

    // Validate required fields
    if (!data.studentName || !data.studentName.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student name is required.' 
      });
    }
    if (!data.phone || !data.phone.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required.' 
      });
    }

    // Check for duplicate phone number
    const existingStudent = await Student.findOne({ phone: data.phone.trim() });
    if (existingStudent) {
      return res.status(409).json({ 
        success: false, 
        message: 'A student with this phone number is already registered.' 
      });
    }

    const student = new Student(data);
    const newStudent = await student.save();
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'student_added', name: newStudent.studentName });

    res.status(201).json(newStudent);

  } catch (err) {
    console.error('Error creating student:', err);
    
    if (err.name === 'ValidationError') {
      const messages = formatValidationErrors(err);
      return res.status(400).json({ 
        success: false, 
        message: messages.join('. ') 
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'A student with this information already exists.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error. Could not add student.' 
    });
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found.' 
      });
    }

    // If phone is being changed, check for duplicates
    if (req.body.phone && req.body.phone !== student.phone) {
      const existing = await Student.findOne({ phone: req.body.phone.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ 
          success: false, 
          message: 'Another student already has this phone number.' 
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'student_updated', name: updatedStudent.studentName });

    res.json(updatedStudent);

  } catch (err) {
    console.error('Error updating student:', err);
    
    if (err.name === 'ValidationError') {
      const messages = formatValidationErrors(err);
      return res.status(400).json({ 
        success: false, 
        message: messages.join('. ') 
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid student ID format.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error. Could not update student.' 
    });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found.' 
      });
    }

    await Student.findByIdAndDelete(id);
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'student_deleted', id });

    res.json({ 
      success: true, 
      message: 'Student deleted successfully.' 
    });


  } catch (err) {
    console.error('Error deleting student:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid student ID format.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error. Could not delete student.' 
    });
  }
};
