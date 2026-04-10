const Student = require('../models/Student');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create a student (used for registration)
exports.createStudent = async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Handle both 'name' and 'studentName' for compatibility
    if (!data.studentName && data.name) {
      data.studentName = data.name;
    }
    
    // Handle both 'createdAt' and 'joinDate' for compatibility
    if (!data.createdAt && data.joinDate) {
      data.createdAt = data.joinDate;
    }

    const { phone } = data;
    
    // Check if student already exists with this phone number
    if (phone) {
      const existingStudent = await Student.findOne({ phone });
      if (existingStudent) {
        return res.status(400).json({ message: 'A student with this phone number is already registered.' });
      }
    }

    const student = new Student(data);
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
