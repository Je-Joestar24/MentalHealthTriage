import Triage from '../models/Triage.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Diagnosis from '../models/Diagnosis.js';
import mongoose from 'mongoose';

/**
 * Normalize symptom string (remove #, trim, lowercase)
 */
function normalizeSymptom(symptom) {
  if (!symptom) return '';
  return symptom.trim().replace(/^#+/, '').toLowerCase();
}

/**
 * Match diagnoses based on symptoms
 * Returns diagnoses that have at least one matching symptom
 */
export async function matchDiagnoses(symptoms = [], systemFilter = null, user = null) {
  if (!symptoms || symptoms.length === 0) {
    return [];
  }

  // Normalize input symptoms
  const normalizedSymptoms = symptoms
    .map(normalizeSymptom)
    .filter(s => s.length > 0);

  if (normalizedSymptoms.length === 0) {
    return [];
  }

  // Build filter for diagnoses - symptoms must match
  const symptomFilter = {
    $or: normalizedSymptoms.map(symptom => ({
      symptoms: { $regex: new RegExp(symptom, 'i') }
    }))
  };

  // Build system filter if provided
  const systemFilterObj = {};
  if (systemFilter) {
    if (systemFilter === 'DSM-5') {
      systemFilterObj.$or = [
        { system: 'DSM-5' },
        { dsm5Code: { $exists: true, $ne: null, $ne: '' } }
      ];
    } else if (systemFilter === 'ICD-10') {
      systemFilterObj.$or = [
        { system: 'ICD-10' },
        { icd10Code: { $exists: true, $ne: null, $ne: '' } }
      ];
    }
  }

  // Get accessible diagnoses (global, organization, or personal)
  const accessibleFilter = {
    $or: [
      { type: 'global' },
      ...(user?.organization ? [{ type: 'organization', organization: user.organization }] : []),
      { type: 'personal', createdBy: user?._id || user?.id }
    ]
  };

  // Combine all filters
  const filterParts = [symptomFilter, accessibleFilter];
  if (Object.keys(systemFilterObj).length > 0) {
    filterParts.push(systemFilterObj);
  }

  const finalFilter = { $and: filterParts };

  // Fetch diagnoses
  const diagnoses = await Diagnosis.find(finalFilter).lean();

  // Calculate match scores and enrich with match information
  const matchedDiagnoses = diagnoses.map(diagnosis => {
    const diagnosisSymptoms = (diagnosis.symptoms || []).map(normalizeSymptom);
    
    // Find matching symptoms
    const matchedSymptoms = normalizedSymptoms.filter(symptom =>
      diagnosisSymptoms.some(ds => ds.includes(symptom) || symptom.includes(ds))
    );

    const matchCount = matchedSymptoms.length;
    const matchPercentage = diagnosisSymptoms.length > 0
      ? (matchCount / diagnosisSymptoms.length) * 100
      : 0;

    return {
      ...diagnosis,
      matchedSymptoms,
      matchCount,
      matchPercentage: Math.round(matchPercentage * 100) / 100,
      allSymptoms: diagnosisSymptoms
    };
  })
  .filter(d => d.matchCount > 0) // Only return diagnoses with at least one match
  .sort((a, b) => b.matchCount - a.matchCount || b.matchPercentage - a.matchPercentage); // Sort by match count/percentage

  return matchedDiagnoses;
}

/**
 * Get all triage records for a patient
 */
export async function getTriageRecords(patientId, psychologistId) {
  // Verify patient belongs to psychologist
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: psychologistId
  });

  if (!patient) {
    throw new Error('Patient not found or access denied');
  }

  const triages = await Triage.find({ patient: patientId, psychologist: psychologistId })
    .populate('patient', 'name age gender')
    .populate('psychologist', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return triages;
}

/**
 * Get a single triage record by ID
 */
export async function getTriageById(triageId, patientId, psychologistId) {
  // Verify patient belongs to psychologist
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: psychologistId
  });

  if (!patient) {
    throw new Error('Patient not found or access denied');
  }

  const triage = await Triage.findOne({
    _id: triageId,
    patient: patientId,
    psychologist: psychologistId
  })
    .populate('patient', 'name age gender')
    .populate('psychologist', 'name email')
    .lean();

  if (!triage) {
    throw new Error('Triage record not found');
  }

  return triage;
}

/**
 * Create a new triage record
 */
export async function createTriage(patientId, triageData, psychologistId) {
  // Verify patient belongs to psychologist
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: psychologistId
  });

  if (!patient) {
    throw new Error('Patient not found or access denied');
  }

  // Verify psychologist exists
  const psychologist = await User.findById(psychologistId);
  if (!psychologist || psychologist.role !== 'psychologist') {
    throw new Error('Psychologist not found');
  }

  // Create triage record
  const triage = new Triage({
    patient: patientId,
    psychologist: psychologistId,
    symptoms: triageData.symptoms || [],
    duration: triageData.duration || null,
    durationUnit: triageData.durationUnit || 'months',
    course: triageData.course || null,
    preliminaryDiagnosis: triageData.preliminaryDiagnosis || '',
    severityLevel: triageData.severityLevel,
    notes: triageData.notes || ''
  });

  await triage.save();

  // Add triage to patient's triageRecords array if not already present
  if (!patient.triageRecords.includes(triage._id)) {
    patient.triageRecords.push(triage._id);
    await patient.save();
  }

  // Populate and return
  await triage.populate('patient', 'name age gender');
  await triage.populate('psychologist', 'name email');

  return triage;
}

/**
 * Update a triage record
 */
export async function updateTriage(triageId, patientId, updateData, psychologistId) {
  // Verify patient belongs to psychologist
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: psychologistId
  });

  if (!patient) {
    throw new Error('Patient not found or access denied');
  }

  // Find and update triage
  const triage = await Triage.findOne({
    _id: triageId,
    patient: patientId,
    psychologist: psychologistId
  });

  if (!triage) {
    throw new Error('Triage record not found');
  }

  // Update allowed fields
  if (updateData.symptoms !== undefined) triage.symptoms = updateData.symptoms;
  if (updateData.duration !== undefined) triage.duration = updateData.duration;
  if (updateData.durationUnit !== undefined) triage.durationUnit = updateData.durationUnit;
  if (updateData.course !== undefined) triage.course = updateData.course;
  if (updateData.preliminaryDiagnosis !== undefined) triage.preliminaryDiagnosis = updateData.preliminaryDiagnosis;
  if (updateData.severityLevel !== undefined) triage.severityLevel = updateData.severityLevel;
  if (updateData.notes !== undefined) triage.notes = updateData.notes;

  await triage.save();

  // Populate and return
  await triage.populate('patient', 'name age gender');
  await triage.populate('psychologist', 'name email');

  return triage;
}

/**
 * Delete a triage record
 */
export async function deleteTriage(triageId, patientId, psychologistId) {
  // Verify patient belongs to psychologist
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: psychologistId
  });

  if (!patient) {
    throw new Error('Patient not found or access denied');
  }

  // Find and delete triage
  const triage = await Triage.findOneAndDelete({
    _id: triageId,
    patient: patientId,
    psychologist: psychologistId
  });

  if (!triage) {
    throw new Error('Triage record not found');
  }

  // Remove triage from patient's triageRecords array
  patient.triageRecords = patient.triageRecords.filter(
    id => id.toString() !== triageId.toString()
  );
  await patient.save();

  return triage;
}

