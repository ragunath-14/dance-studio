const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentName: { 
    type: String, 
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  studentAge: { 
    type: String, 
    trim: true 
  },
  classType: { 
    type: String, 
    enum: {
      values: ['Regular Class', 'Summer Class'],
      message: '{VALUE} is not a valid class type'
    },
    default: 'Regular Class' 
  },
  danceStyle: { 
    type: String, 
    trim: true 
  },
  danceForFitness: { 
    type: String, 
    trim: true 
  },
  whatsappNumber: { 
    type: String, 
    trim: true 
  },
  location: { 
    type: String, 
    trim: true 
  },
  parentName: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // email is optional
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
      validator: function(v) {
        // Allow digits, spaces, +, - and must be at least 10 chars
        return /^[\d\s+\-()]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number (at least 10 digits)'
    }
  },
  notes: { 
    type: String, 
    trim: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
});

// Use 'students' collection explicitly so both registration and admin share the same collection
module.exports = mongoose.model('Student', StudentSchema, 'students');
