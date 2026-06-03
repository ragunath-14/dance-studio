// checkFees.js – list all students with their age and fee
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Student = require('../models/Student'); // path from backend/scripts to models

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dance-studio';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    const students = await Student.find({}).select('studentName studentAge fee').lean();
    console.log('Students and fees:');
    students.forEach(s => {
      console.log(`- ${s.studentName || 'Unnamed'} | Age: ${s.studentAge || 'N/A'} | Fee: ${s.fee}`);
    });
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
