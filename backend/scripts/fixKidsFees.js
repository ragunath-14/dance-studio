// fixKidsFees.js – run once to correct fee values for kids (age <= 9)
// Usage: node fixKidsFees.js

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Student = require('../models/Student'); // adjust path as needed

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dance-studio';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    const result = await Student.updateMany(
      { studentAge: { $exists: true }, $expr: { $lte: [{ $toInt: '$studentAge' }, 9] } },
      { $set: { fee: 1500 } }
    );
    console.log(`Matched ${result.n} documents, modified ${result.nModified} fees to 1500 for kids.`);
    // Optionally update adults to 2500 if needed
    // await Student.updateMany({ studentAge: { $exists: true }, $expr: { $gt: [{ $toInt: '$studentAge' }, 9] } }, { $set: { fee: 2500 } });
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
