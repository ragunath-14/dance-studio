const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('dotenv').config();

const Student = require('./models/Registration');
const Payment = require('./models/Payment');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dance-studio';

const seedData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for seeding...');

        // Optional: Clear existing data
        // await Student.deleteMany({});
        // await Payment.deleteMany({});

        const danceStyles = ['Hip Hop', 'Ballet', 'Contemporary', 'Bollywood', 'Salsa', 'Jazz'];
        const classTypes = ['Regular Class', 'Summer Class'];

        const studentsToAdd = [];
        for (let i = 1; i <= 10; i++) {
            studentsToAdd.push({
                studentName: `Sample Student ${i}`,
                email: `sample${i}@example.com`,
                phone: `88776655${i.toString().padStart(2, '0')}`,
                danceStyle: danceStyles[Math.floor(Math.random() * danceStyles.length)],
                classType: classTypes[Math.floor(Math.random() * classTypes.length)],
                studentAge: Math.floor(5 + Math.random() * 20).toString(),
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
            });
        }

        const createdStudents = await Student.insertMany(studentsToAdd);
        console.log(`✅ Added ${createdStudents.length} sample students.`);

        const paymentsToAdd = [];
        for (let i = 0; i < 5; i++) {
            paymentsToAdd.push({
                studentId: createdStudents[i]._id,
                amount: 1500,
                date: new Date(),
                method: 'Cash',
                purpose: 'Monthly Fee'
            });
        }

        await Payment.insertMany(paymentsToAdd);
        console.log(`✅ Added ${paymentsToAdd.length} sample payments.`);

        console.log('--- SEEDING COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seedData();
