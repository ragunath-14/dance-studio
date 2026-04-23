const Student  = require('../models/Student');
const Payment  = require('../models/Payment');
const whatsapp = require('../services/whatsappService');

// ─── Fee helper ──────────────────────────────────────────────────────────────
const getMonthlyFee = (classType) => classType === 'Fitness Class' ? 2500 : 3500;

// ─── Format mongoose validation errors ───────────────────────────────────────
const formatValidationErrors = (err) =>
  Object.values(err.errors).map((e) => e.message);

// ─── GET /api/students ───────────────────────────────────────────────────────
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    res.json(students);
  } catch (err) {
    console.error('getAllStudents error:', err);
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
};

// ─── POST /api/students ──────────────────────────────────────────────────────
exports.createStudent = async (req, res) => {
  try {
    const data = { ...req.body };

    // Field-name compatibility shims
    if (!data.studentName && data.name)     data.studentName = data.name;
    if (!data.createdAt   && data.joinDate) data.createdAt   = data.joinDate;

    // Explicit required-field check (better error messages than Mongoose default)
    if (!data.studentName?.trim())
      return res.status(400).json({ message: 'Student name is required.' });
    if (!data.phone?.trim())
      return res.status(400).json({ message: 'Phone number is required.' });

    // Duplicate phone guard
    const existing = await Student.findOne({ phone: data.phone.trim() });
    if (existing)
      return res.status(409).json({ message: 'A student with this phone number is already registered.' });

    const student    = new Student(data);
    const newStudent = await student.save();

    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'student', action: 'create' });

    res.status(201).json(newStudent);
  } catch (err) {
    console.error('createStudent error:', err);
    if (err.name === 'ValidationError')
      return res.status(400).json({ message: formatValidationErrors(err).join('. ') });
    if (err.code === 11000)
      return res.status(409).json({ message: 'A student with this information already exists.' });
    res.status(500).json({ message: 'Server error. Could not add student.' });
  }
};

// ─── PUT /api/students/:id ───────────────────────────────────────────────────
exports.updateStudent = async (req, res) => {
  try {
<<<<<<< HEAD
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Emit real-time update
=======
    const { id } = req.params;

    // Phone-change duplicate guard
    if (req.body.phone) {
      const dup = await Student.findOne({ phone: req.body.phone.trim(), _id: { $ne: id } });
      if (dup)
        return res.status(409).json({ message: 'Another student already has this phone number.' });
    }

    const updated = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Student not found.' });

>>>>>>> f230228 (ragu)
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'student', action: 'update' });

    res.json(updated);
  } catch (err) {
    console.error('updateStudent error:', err);
    if (err.name === 'CastError')
      return res.status(400).json({ message: 'Invalid student ID format.' });
    if (err.name === 'ValidationError')
      return res.status(400).json({ message: formatValidationErrors(err).join('. ') });
    res.status(500).json({ message: 'Server error. Could not update student.' });
  }
};

// ─── PATCH /api/students/:id/toggle-status ───────────────────────────────────
exports.toggleStatus = async (req, res) => {
  try {
<<<<<<< HEAD
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'student', action: 'delete' });

    res.json({ success: true, message: 'Student deleted successfully.' });
=======
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    student.isActive = !student.isActive;
    await student.save();

    // Send rejoin WhatsApp when student is marked inactive
    if (!student.isActive) {
      const num = student.whatsappNumber || student.phone;
      if (num) {
        whatsapp.sendRejoinMessage(num, student.studentName, student.classType)
          .catch((e) => console.error('WhatsApp rejoin error:', e));
      }
    }

    const io = req.app.get('socketio');
    if (io) io.emit('dataChanged', { type: 'student', action: 'statusToggle' });

    res.json({
      message: `Student marked as ${student.isActive ? 'Active' : 'Inactive'}`,
      student
    });
>>>>>>> f230228 (ragu)
  } catch (err) {
    console.error('toggleStatus error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /api/students/:id ────────────────────────────────────────────────
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // Cascade delete related payments
    await Payment.deleteMany({ studentId: studentId });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('dataChanged', { type: 'student', action: 'delete' });
      io.emit('dataChanged', { type: 'payment', action: 'delete' }); // Notify that payments might have changed
    }

    res.json({ success: true, message: 'Student and related details deleted successfully.' });
  } catch (err) {
    console.error('deleteStudent error:', err);
    if (err.name === 'CastError')
      return res.status(400).json({ message: 'Invalid student ID format.' });
    res.status(500).json({ message: err.message });
  }
};

