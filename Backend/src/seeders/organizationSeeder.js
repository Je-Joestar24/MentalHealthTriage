import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const STATIC_PASSWORD = 'Password123!';
const NUMBER_OF_ORGANIZATIONS = 20;
const PSYCHOLOGISTS_PER_ORG = 10;

async function createAndSaveUser(userData) {
  const user = new User(userData);
  await user.save(); // triggers pre('save') hook to hash password
  return user;
}

async function seedData() {
  try {
    // Preserve any existing super_admin created via controller; remove other users/orgs
    await User.deleteMany({ role: { $ne: 'super_admin' } });
    await Organization.deleteMany({});

    const organizations = [];
    let createdUsersCount = 0;

    for (let i = 0; i < NUMBER_OF_ORGANIZATIONS; i++) {
      // Create admin for organization (saved so password is hashed)
      const admin = await createAndSaveUser({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase().replace(/@/g, `+org${i}@`), // reduce collisions
        password: STATIC_PASSWORD,
        role: 'company_admin',
        specialization: faker.person.jobArea(),
        experience: faker.number.int({ min: 1, max: 20 }),
        isActive: true,
        subscriptionEndDate: faker.date.future()
      });
      createdUsersCount++;

      // Create organization referencing the saved admin
      const organization = new Organization({
        name: faker.company.name() + ` ${i}`, // reduce collisions for unique index
        admin: admin._id,
        psychologists: [],
        patients: [],
        diagnosisCatalog: [],
        registrationToken: faker.string.alphanumeric(10),
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: faker.date.future()
      });

      // Create psychologists for this organization and save each (passwords hashed)
      for (let j = 0; j < PSYCHOLOGISTS_PER_ORG; j++) {
        const psychologist = await createAndSaveUser({
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase().replace(/@/g, `+org${i}p${j}@`),
          password: STATIC_PASSWORD,
          role: 'psychologist',
          organization: organization._id,
          specialization: faker.person.jobArea(),
          experience: faker.number.int({ min: 1, max: 15 }),
          isActive: true,
          subscriptionEndDate: faker.date.future()
        });
        createdUsersCount++;
        organization.psychologists.push(psychologist._id);
      }

      // link admin -> organization and save both
      admin.organization = organization._id;
      await admin.save();

      await organization.save();
      organizations.push(organization);
    }

    console.log('Seeding completed successfully!');
    console.log(`Created ${organizations.length} organizations`);
    console.log(`Created ${createdUsersCount} users (super_admins preserved)`);
    console.log(`Static password for all seeded users: ${STATIC_PASSWORD}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Connect to MongoDB and run seeder
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-health-triage')
  .then(() => {
    console.log('Connected to MongoDB');
    seedData();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });