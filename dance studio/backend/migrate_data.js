const mongoose = require('mongoose');

async function migrate() {
  try {
    const sourceURI = 'mongodb://localhost:27017/dance_studio';
    const targetURI = 'mongodb://localhost:27017/dance-studio';

    console.log('Connecting to source database...');
    const sourceConn = await mongoose.createConnection(sourceURI).asPromise();
    console.log('Connecting to target database...');
    const targetConn = await mongoose.createConnection(targetURI).asPromise();

    const Registration = sourceConn.collection('registrations');
    const Student = targetConn.collection('students');

    const registrations = await Registration.find({}).toArray();
    console.log(`Found ${registrations.length} registrations to migrate.`);

    for (const reg of registrations) {
      // Check if student already exists by phone
      const exists = await Student.findOne({ phone: reg.phone });
      if (!exists) {
        // Remove _id from reg to let MongoDB generate a new one, or keep it if you want
        // But since they are different databases, keeping it might be okay or not.
        // Let's keep the fields but remove _id if it's not a valid ObjectId for the new DB
        const { _id, ...studentData } = reg;
        await Student.insertOne(studentData);
        console.log(`Migrated: ${reg.studentName}`);
      } else {
        console.log(`Skipped (already exists): ${reg.studentName}`);
      }
    }

    console.log('Migration complete!');
    await sourceConn.close();
    await targetConn.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
