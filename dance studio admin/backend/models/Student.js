const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
<<<<<<< HEAD
      validator: function(v) {
        if (!v) return true; // email is optional
=======
      validator: function (v) {
        if (!v) return true;
>>>>>>> f230228 (ragu)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
<<<<<<< HEAD
      validator: function(v) {
        return /^[\d\s+\-()]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number (at least 10 digits)'
    }
  },
  whatsappNumber: { type: String, trim: true },
  danceStyle: { type: String, trim: true },
=======
      validator: function (v) {
        return /^[\d\s+\-()]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number (at least 10 digits)'
    },
    index: true
  },
  whatsappNumber: { type: String, trim: true },
  danceStyle:     { type: String, trim: true },
>>>>>>> f230228 (ragu)
  danceForFitness: { type: String, trim: true },
  classType: {
    type: String,
    enum: {
<<<<<<< HEAD
      values: ['Regular Class', 'Summer Class'],
=======
      values: ['Regular Class', 'Summer Class', 'Fitness Class'],
>>>>>>> f230228 (ragu)
      message: '{VALUE} is not a valid class type'
    },
    default: 'Regular Class'
  },
<<<<<<< HEAD
  studentAge: { type: String, trim: true },
  parentName: { type: String, trim: true },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Explicitly use 'students' collection to share data with registration backend
module.exports = mongoose.model('Student', StudentSchema, 'students');
=======
  studentAge:  { type: String, trim: true },
  parentName:  { type: String, trim: true },
  notes:       { type: String, trim: true },
  isActive:    { type: Boolean, default: true, index: true },
  lastAlertSent: { type: Date },
  createdAt:   { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Student', StudentSchema);
>>>>>>> f230228 (ragu)
