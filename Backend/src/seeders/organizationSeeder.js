import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const STATIC_PASSWORD = 'Password123!';
const NUMBER_OF_ORGANIZATIONS = 10;
const PSYCHOLOGISTS_PER_ORG = 10;

async function seedData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});

    const organizations = [];
    const users = [];

    // Create organizations with their admins and psychologists
    for (let i = 0; i < NUMBER_OF_ORGANIZATIONS; i++) {
      // Create admin for organization
      const admin = new User({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: STATIC_PASSWORD,
        role: 'company_admin',
        specialization: faker.person.jobArea(),
        experience: faker.number.int({ min: 1, max: 20 }),
        isActive: true,
        subscriptionEndDate: faker.date.future()
      });

      users.push(admin);

      // Create organization
      const organization = new Organization({
        name: faker.company.name(),
        admin: admin._id,
        psychologists: [],
        patients: [],
        diagnosisCatalog: [],
        registrationToken: faker.string.alphanumeric(10),
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: faker.date.future()
      });

      // Create psychologists for this organization
      for (let j = 0; j < PSYCHOLOGISTS_PER_ORG; j++) {
        const psychologist = new User({
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password: STATIC_PASSWORD,
          role: 'psychologist',
          organization: organization._id,
          specialization: faker.person.jobArea(),
          experience: faker.number.int({ min: 1, max: 15 }),
          isActive: true,
          subscriptionEndDate: faker.date.future()
        });

        users.push(psychologist);
        organization.psychologists.push(psychologist._id);
      }

      organizations.push(organization);
      admin.organization = organization._id;
    }

    // Save all users and organizations
    await User.insertMany(users);
    await Organization.insertMany(organizations);

    console.log('Seeding completed successfully!');
    console.log(`Created ${organizations.length} organizations`);
    console.log(`Created ${users.length} users`);
    console.log(`Static password for all users: ${STATIC_PASSWORD}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
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