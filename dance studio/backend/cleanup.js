const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('./models/Student');
const Payment = require('./models/Payment');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dance-studio';

const clearData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for cleanup...');

        const studentResult = await Student.deleteMany({});
        console.log(`Deleted ${studentResult.deletedCount} students.`);

        const paymentResult = await Payment.deleteMany({});
        console.log(`Deleted ${paymentResult.deletedCount} payments.`);

        console.log('Database cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup error:', err);
        process.exit(1);
    }
};

clearData();
