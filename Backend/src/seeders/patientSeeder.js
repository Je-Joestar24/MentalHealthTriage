import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

const ASSIGNED_PSYCHOLOGIST_ID = '6902f4710157487d810f4e17';
const NUMBER_OF_PATIENTS = 50;

async function seedPatients() {
  try {
    // Check if psychologist exists
    const psychologist = await User.findById(ASSIGNED_PSYCHOLOGIST_ID);
    if (!psychologist) {
      console.error(`Psychologist with ID ${ASSIGNED_PSYCHOLOGIST_ID} not found!`);
      return;
    }

    console.log(`Found psychologist: ${psychologist.name} (${psychologist.email})`);
    console.log(`Organization ID: ${psychologist.organization || 'None'}`);

    // Clear existing patients for this psychologist (optional - comment out if you want to keep existing)
    await Patient.deleteMany({ assignedPsychologist: ASSIGNED_PSYCHOLOGIST_ID });
    console.log('Cleared existing patients for this psychologist');

    const patients = [];
    const genders = ['male', 'female', 'other'];

    for (let i = 0; i < NUMBER_OF_PATIENTS; i++) {
      const gender = faker.helpers.arrayElement(genders);
      const age = faker.number.int({ min: 18, max: 80 });
      
      // Generate contact info (sometimes leave empty for variety)
      const hasEmail = faker.datatype.boolean({ probability: 0.8 });
      const hasPhone = faker.datatype.boolean({ probability: 0.9 });

      const patientData = {
        name: faker.person.fullName(),
        age: age,
        gender: gender,
        contactInfo: {
          ...(hasEmail && { email: faker.internet.email().toLowerCase() }),
          ...(hasPhone && { phone: faker.phone.number() })
        },
        assignedPsychologist: ASSIGNED_PSYCHOLOGIST_ID,
        organization: psychologist.organization || null,
        triageRecords: [],
        status: faker.helpers.arrayElement(['active', 'inactive']),
        isDeleted: faker.datatype.boolean({ probability: 0.1 }) // 10% chance of being archived
      };

      const patient = new Patient(patientData);
      await patient.save();
      patients.push(patient);
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`Created ${patients.length} patients`);
    console.log(`Assigned to psychologist: ${psychologist.name}`);
    console.log(`Organization: ${psychologist.organization || 'None'}`);
    
    // Statistics
    const activeCount = patients.filter(p => p.status === 'active' && !p.isDeleted).length;
    const inactiveCount = patients.filter(p => p.status === 'inactive' && !p.isDeleted).length;
    const archivedCount = patients.filter(p => p.isDeleted).length;
    
    console.log('\n📊 Statistics:');
    console.log(`  Active: ${activeCount}`);
    console.log(`  Inactive: ${inactiveCount}`);
    console.log(`  Archived: ${archivedCount}`);

  } catch (error) {
    console.error('❌ Error seeding patients:', error);
    throw error;
  }
}

// Connect to MongoDB and run seeder
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/mentalhealthtriage';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    console.log(`🌱 Starting patient seeder...\n`);
    await seedPatients();
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ MongoDB connection error:', err);
    try {
      await mongoose.disconnect();
    } catch (disconnectErr) {
      console.error('Error disconnecting:', disconnectErr);
    }
    process.exit(1);
  });

