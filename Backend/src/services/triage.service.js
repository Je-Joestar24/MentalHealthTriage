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
 * Check if two symptoms match (considering variations)
 */
function symptomsMatch(symptom1, symptom2) {
  const normalize = (s) => {
    if (!s) return '';
    return s.trim().replace(/^#+/, '').toLowerCase();
  };

  const s1 = normalize(symptom1);
  const s2 = normalize(symptom2);

  // Create variations for both symptoms
  const createVariations = (s) => {
    const withSpaces = s.replace(/_/g, ' ');
    const withUnderscores = s.replace(/\s+/g, '_');
    return [s, withSpaces, withUnderscores].filter((v, i, arr) => arr.indexOf(v) === i);
  };

  const s1Variations = createVariations(s1);
  const s2Variations = createVariations(s2);

  // Check if any variation matches (exact match or contains)
  return s1Variations.some(v1 => 
    s2Variations.some(v2 => 
      v1 === v2 || v1.includes(v2) || v2.includes(v1)
    )
  );
}

/**
 * Deduplicate symptoms by grouping similar ones
 * Returns an array of unique symptom groups
 */
function deduplicateSymptoms(symptoms) {
  const normalized = symptoms.map(normalizeSymptom).filter(s => s.length > 0);
  const groups = [];

  for (const symptom of normalized) {
    // Check if this symptom belongs to any existing group
    let foundGroup = false;
    for (const group of groups) {
      // If any symptom in the group matches this symptom, add to that group
      if (group.some(groupSymptom => symptomsMatch(symptom, groupSymptom))) {
        group.push(symptom);
        foundGroup = true;
        break;
      }
    }
    // If no group found, create a new group
    if (!foundGroup) {
      groups.push([symptom]);
    }
  }

  // Return the first symptom from each group (representative)
  return groups.map(group => group[0]);
}

/**
 * Match diagnoses based on symptoms
 * Returns diagnoses with match counts (including 0 matches with pagination)
 */
export async function matchDiagnoses(symptoms = [], systemFilter = null, user = null, queryParams = {}) {
  const {
    page = 1,
    limit = 20,
    showAll = false // If true, show all diagnoses even with 0 matches
  } = queryParams;

  // Normalize and deduplicate input symptoms
  const normalizedSymptoms = symptoms
    .map(normalizeSymptom)
    .filter(s => s.length > 0);

  // Deduplicate similar symptoms (e.g., "anxiety" and "anxiety_or_tension" become one group)
  const deduplicatedSymptoms = deduplicateSymptoms(normalizedSymptoms);

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

  // Build access control filter based on user role and organization
  let accessibleFilter = {};
  if (user) {
    // Super admin can see all diagnoses
    if (user.role === 'super_admin') {
      // No filter needed - show all
      accessibleFilter = {};
    }
    // User with organization: can see global, organization (same org), and personal (their own)
    else if (user.organization) {
      accessibleFilter = {
        $or: [
          { type: 'global' },
          { 
            $and: [
              { type: 'organization' },
              { organization: user.organization }
            ]
          },
          {
            $and: [
              { type: 'personal' },
              { createdBy: user._id || user.id }
            ]
          }
        ]
      };
    }
    // Individual user (no organization): can see global and their personal diagnoses
    else {
      accessibleFilter = {
        $or: [
          { type: 'global' },
          {
            $and: [
              { type: 'personal' },
              { createdBy: user._id || user.id }
            ]
          }
        ]
      };
    }
  }

  // Build base filter
  const filterParts = [];
  // Only add accessibleFilter if it has conditions (not empty for super_admin)
  if (Object.keys(accessibleFilter).length > 0) {
    filterParts.push(accessibleFilter);
  }
  if (Object.keys(systemFilterObj).length > 0) {
    filterParts.push(systemFilterObj);
  }

  // If we have symptoms and want to filter, add symptom filter
  // Otherwise, if showAll is true, we'll fetch all and calculate matches
  let shouldFilterBySymptoms = normalizedSymptoms.length > 0 && !showAll;

  if (shouldFilterBySymptoms) {
    // Build symptom filter for initial query
    const symptomFilter = {
      $or: deduplicatedSymptoms.flatMap(symptom => {
        const withSpaces = symptom.replace(/_/g, ' ');
        const withUnderscores = symptom.replace(/\s+/g, '_');
        const variations = [symptom, withSpaces, withUnderscores].filter((v, i, arr) => arr.indexOf(v) === i);
        
        return variations.map(variation => ({
          symptoms: { $regex: new RegExp(variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        }));
      })
    };
    filterParts.push(symptomFilter);
  }

  // Build final filter - use $and only if we have multiple parts, otherwise use the single filter
  let finalFilter = filterParts.length === 0 
    ? {} 
    : filterParts.length === 1 
      ? filterParts[0] 
      : { $and: filterParts };

  // Calculate pagination
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  // Fetch diagnoses with pagination
  const [diagnoses, total] = await Promise.all([
    Diagnosis.find(finalFilter)
      .sort({ createdAt: -1 }) // Default sort
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(),
    Diagnosis.countDocuments(finalFilter)
  ]);

  // Calculate match scores and enrich with match information
  const matchedDiagnoses = diagnoses.map(diagnosis => {
    const diagnosisSymptoms = (diagnosis.symptoms || []).map(normalizeSymptom);
    
    // Count unique diagnosis symptoms that matched (not input symptoms)
    // This ensures "anxiety" and "anxiety_or_tension" only count as 1 if diagnosis has only one
    const matchedDiagnosisSymptoms = diagnosisSymptoms.filter(ds => {
      // Check if this diagnosis symptom matches ANY of the deduplicated input symptoms
      return deduplicatedSymptoms.some(inputSymptom => 
        symptomsMatch(inputSymptom, ds)
      );
    });

    // Also track which input symptoms were matched (for display)
    const matchedInputSymptoms = deduplicatedSymptoms.filter(inputSymptom => {
      return diagnosisSymptoms.some(ds => symptomsMatch(inputSymptom, ds));
    });

    const matchCount = matchedDiagnosisSymptoms.length;
    const matchPercentage = diagnosisSymptoms.length > 0
      ? (matchCount / diagnosisSymptoms.length) * 100
      : 0;

    return {
      ...diagnosis,
      matchedSymptoms: matchedInputSymptoms, // Input symptoms that matched
      matchedDiagnosisSymptoms, // Diagnosis symptoms that matched
      matchCount,
      matchPercentage: Math.round(matchPercentage * 100) / 100,
      allSymptoms: diagnosisSymptoms
    };
  });

  // Sort: first by match count (desc), then by match percentage (desc), then by creation date (desc)
  matchedDiagnoses.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return {
    diagnoses: matchedDiagnoses,
    pagination: {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: skip + parseInt(limit, 10) < total,
      hasPrevPage: parseInt(page, 10) > 1
    }
  };
}

/**
 * Get all triage records for a patient with pagination, search, and sorting
 */
export async function getTriageRecords(patientId, psychologistId, queryParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  // Verify patient belongs to psychologist
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: psychologistId
  });

  if (!patient) {
    throw new Error('Patient not found or access denied');
  }

  // Build base filter
  const filter = {
    patient: patientId,
    psychologist: psychologistId
  };

  // Add search filter if provided
  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    filter.$or = [
      { preliminaryDiagnosis: searchRegex },
      { notes: searchRegex },
      { severityLevel: searchRegex },
      { symptoms: searchRegex } // MongoDB will match any element in the array
    ];
  }

  // Define allowed sort fields
  const allowedSortFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    severityLevel: 'severityLevel',
    preliminaryDiagnosis: 'preliminaryDiagnosis'
  };

  const sortField = allowedSortFields[sortBy] || 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDirection };

  // Calculate pagination
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  // Fetch triages with pagination
  const [triages, total] = await Promise.all([
    Triage.find(filter)
      .populate('patient', 'name age gender')
      .populate('psychologist', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(),
    Triage.countDocuments(filter)
  ]);

  return {
    triages,
    pagination: {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: skip + parseInt(limit, 10) < total,
      hasPrevPage: parseInt(page, 10) > 1
    }
  };
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

