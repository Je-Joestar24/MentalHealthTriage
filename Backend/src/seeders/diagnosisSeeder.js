import mongoose, { MongooseError } from 'mongoose';
import Diagnosis from '../models/Diagnosis.js';
import User from '../models/User.js';

// Non-destructive seeder: upserts a few dual-coded diagnoses.
// - Does NOT clear the database
// - Uses first existing user as createdBy; creates a placeholder if none exists

const samples = [
  {
    name: 'Major Depressive Disorder',
    section: 'Depressive Disorders',
    chapter: 'Mood Disorders',
    dsm5Code: '296.23',
    icd10Code: 'F32.1',
    system: 'DSM-5',
    code: '296.23',
    course: 'Episodic',
    symptoms: ['depressed_mood', 'loss_of_interest', 'insomnia'],
    keySymptomsSummary: 'Depressed mood, anhedonia, sleep disturbance',
    fullCriteriaSummary: 'Depressed mood or loss of interest with associated symptoms for 2+ weeks',
    severity: 'Moderate',
    specifiers: 'With anxious distress'
  },
  {
    name: 'Generalized Anxiety Disorder',
    section: 'Anxiety Disorders',
    chapter: 'Anxiety Disorders',
    dsm5Code: '300.02',
    icd10Code: 'F41.1',
    system: 'DSM-5',
    code: '300.02',
    course: 'Continuous',
    symptoms: ['excessive_worry', 'restlessness', 'muscle_tension'],
    keySymptomsSummary: 'Excessive anxiety and worry most days for 6+ months',
    fullCriteriaSummary: 'Difficult to control worry with associated physical symptoms',
    severity: 'Mild',
    specifiers: ''
  },
  {
    name: 'Persistent Depressive Disorder (Dysthymia)',
    section: 'Depressive Disorders',
    chapter: 'Mood Disorders',
    dsm5Code: '300.4',
    icd10Code: 'F34.1',
    system: 'DSM-5',
    code: '300.4',
    course: 'Continuous',
    symptoms: ['low_energy', 'low_self_esteem', 'poor_concentration'],
    keySymptomsSummary: 'Depressed mood for most of the day, more days than not',
    fullCriteriaSummary: 'At least 2 years in adults (1 year in youth) with additional symptoms',
    severity: 'Moderate',
    specifiers: ''
  }
];

export async function seedDualCodeDiagnoses({ createdById } = {}) {
  // Ensure a createdBy exists
  let creatorId = createdById;
  if (!creatorId) {
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        name: 'Seeder Admin',
        email: `seeder_admin_${Date.now()}@example.com`,
        password: 'Password!123',
        role: 'super_admin'
      });
    }
    creatorId = user._id;
  }

  const ops = samples.map((data) => {
    const filter = { name: data.name, organization: null };
    const update = {
      $setOnInsert: {
        name: data.name,
        type: 'global',
        createdBy: creatorId,
        organization: null
      },
      $set: {
        section: data.section,
        chapter: data.chapter,
        // legacy single-system fields kept for compatibility
        system: data.system,
        code: data.code,
        // dual code fields
        dsm5Code: data.dsm5Code,
        icd10Code: data.icd10Code,
        course: data.course,
        symptoms: data.symptoms,
        keySymptomsSummary: data.keySymptomsSummary,
        fullCriteriaSummary: data.fullCriteriaSummary,
        severity: data.severity,
        specifiers: data.specifiers
      }
    };
    return {
      updateOne: {
        filter,
        update,
        upsert: true
      }
    };
  });

  await Diagnosis.bulkWrite(ops, { ordered: false });
}

// Allow running as a standalone script: node src/seeders/diagnosisSeeder.js
  const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/mental-health-triage';
  console.log(MONGO_URI)
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log('Connected. Seeding dual-code diagnoses...');
      await seedDualCodeDiagnoses();
      console.log('Seeding complete.');
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seeder error:', err);
      try { await mongoose.disconnect(); } catch {}
      process.exit(1);
    });
