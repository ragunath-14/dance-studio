const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  whatsappNumber: { type: String },
  danceStyle: { type: String },
  danceForFitness: { type: String },
  classType: { type: String, default: 'Regular Class' },
  studentAge: { type: String },
  parentName: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Student', StudentSchema);

