const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('./models/Student');
const Payment = require('./models/Payment');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dance-studio';

const checkData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB...');

        const students = await Student.find();
        console.log(`Found ${students.length} students:`);
        console.log(JSON.stringify(students, null, 2));

        const payments = await Payment.find();
        console.log(`Found ${payments.length} payments:`);
        console.log(JSON.stringify(payments, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkData();
