require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to DB');

    // Get all students
    const students = await Student.find({}).lean();
    console.log(`Found ${students.length} students\n`);

    let fixed = 0;
    for (const s of students) {
      const age = parseInt(s.studentAge, 10);
      if (!isNaN(age)) {
        const correctFee = age <= 9 ? 1500 : 2500;
        if (s.fee !== correctFee) {
          await Student.findByIdAndUpdate(s._id, { fee: correctFee });
          console.log(`✅ Fixed: ${s.studentName} | Age: ${age} | Old fee: ${s.fee} → New fee: ${correctFee}`);
          fixed++;
        } else {
          console.log(`✔  OK: ${s.studentName} | Age: ${age} | Fee: ${s.fee}`);
        }
      } else {
        console.log(`⚠  Skipped: ${s.studentName} | Age: "${s.studentAge}" (cannot parse)`);
      }
    }

    console.log(`\nDone! Fixed ${fixed} student(s).`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
})();
