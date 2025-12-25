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
 * Convert duration to days for comparison
 */
function convertToDays(value, unit) {
  if (!value || !unit) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null;
  
  switch (unit.toLowerCase()) {
    case 'days':
      return numValue;
    case 'weeks':
      return numValue * 7;
    case 'months':
      return numValue * 30; // Approximate: 30 days per month
    case 'years':
      return numValue * 365; // Approximate: 365 days per year
    default:
      return null;
  }
}

/**
 * Check if triage duration matches diagnosis typicalDuration
 */
function matchesDuration(triageDuration, triageUnit, diagnosisDuration) {
  if (!triageDuration || !triageUnit || !diagnosisDuration) return true; // No filter if not provided
  
  const triageDays = convertToDays(triageDuration, triageUnit);
  if (triageDays === null) return true;
  
  const diagnosisMin = diagnosisDuration.min !== null && diagnosisDuration.min !== undefined 
    ? convertToDays(diagnosisDuration.min, diagnosisDuration.unit || 'months')
    : null;
  const diagnosisMax = diagnosisDuration.max !== null && diagnosisDuration.max !== undefined
    ? convertToDays(diagnosisDuration.max, diagnosisDuration.unit || 'months')
    : null;
  
  // If diagnosis has no duration range, allow it
  if (diagnosisMin === null && diagnosisMax === null) return true;
  
  // Check if triage duration falls within diagnosis range
  // Allow some flexibility: ±20% tolerance
  const tolerance = 0.2;
  if (diagnosisMin !== null && diagnosisMax !== null) {
    const minWithTolerance = diagnosisMin * (1 - tolerance);
    const maxWithTolerance = diagnosisMax * (1 + tolerance);
    return triageDays >= minWithTolerance && triageDays <= maxWithTolerance;
  } else if (diagnosisMin !== null) {
    const minWithTolerance = diagnosisMin * (1 - tolerance);
    return triageDays >= minWithTolerance;
  } else if (diagnosisMax !== null) {
    const maxWithTolerance = diagnosisMax * (1 + tolerance);
    return triageDays <= maxWithTolerance;
  }
  
  return true;
}

/**
 * Check if course matches
 */
function matchesCourse(triageCourse, diagnosisCourse) {
  if (!triageCourse || !diagnosisCourse) return true; // No filter if not provided
  // If diagnosis course is 'Either', it matches any triage course
  if (diagnosisCourse === 'Either') return true;
  // Otherwise, exact match required
  return triageCourse === diagnosisCourse;
}

/**
 * Check if severity matches
 */
function matchesSeverity(triageSeverity, diagnosisSeverity) {
  if (!triageSeverity || !diagnosisSeverity) return true; // No filter if not provided
  
  // Handle both string and array severity in diagnosis
  if (Array.isArray(diagnosisSeverity)) {
    return diagnosisSeverity.some(sev => 
      sev.toLowerCase() === triageSeverity.toLowerCase()
    );
  }
  
  return diagnosisSeverity.toLowerCase() === triageSeverity.toLowerCase();
}

/**
 * Check if text matches (for preliminaryDiagnosis and notes)
 */
function matchesText(searchText, targetText) {
  if (!searchText || !targetText) return true; // No filter if not provided
  const searchLower = searchText.toLowerCase().trim();
  const targetLower = String(targetText).toLowerCase();
  return targetLower.includes(searchLower);
}

/**
 * Match diagnoses based on symptoms and triage filters
 * Returns diagnoses with match counts (including 0 matches with pagination)
 */
export async function matchDiagnoses(symptoms = [], systemFilter = null, user = null, queryParams = {}, triageFilters = {}) {
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
    // User with organization
    else if (user.organization) {
      const userId = user._id || user.id;
      const userOrgId = user.organization._id || user.organization;
      
      // Build the $or conditions
      const orConditions = [
        { type: 'global' }
      ];
      
      // For organization-type diagnoses:
      // - company_admin: check if createdBy matches their ID (only one company_admin per org)
      // - psychologist: check if createdBy (company_admin) belongs to the same organization
      if (user.role === 'company_admin') {
        // Company admin can see organization-type diagnoses they created
        orConditions.push({
          $and: [
            { type: 'organization' },
            { createdBy: userId }
          ]
        });
        
        // Get all psychologist IDs in the organization for personal diagnoses
        const psychologists = await User.find({
          organization: userOrgId,
          role: 'psychologist',
          isActive: true
        }).select('_id').lean();
        
        const psychologistIds = psychologists.map(p => p._id);
        
        // Add condition to see all personal diagnoses from organization psychologists
        orConditions.push({
          $and: [
            { type: 'personal' },
            { createdBy: { $in: psychologistIds } }
          ]
        });
      } else {
        // For psychologist: check if organization-type diagnosis was created by their org's company_admin
        const companyAdmin = await User.findOne({
          organization: userOrgId,
          role: 'company_admin',
          isActive: true
        }).select('_id').lean();
        
        if (companyAdmin) {
          orConditions.push({
            $and: [
              { type: 'organization' },
              { createdBy: companyAdmin._id }
            ]
          });
        }
        
        // Psychologist can only see their own personal diagnoses
        orConditions.push({
          $and: [
            { type: 'personal' },
            { createdBy: userId }
          ]
        });
      }
      
      accessibleFilter = { $or: orConditions };
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
  let matchedDiagnoses = diagnoses.map(diagnosis => {
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

    // Calculate triage filter matches (for ranking, not filtering)
    let filterMatchCount = 0;
    let totalFilters = 0;
    const filterMatches = {};

    if (Object.keys(triageFilters).length > 0) {
      // Check duration match
      if (triageFilters.duration !== undefined && triageFilters.durationUnit) {
        totalFilters++;
        const matches = matchesDuration(
          triageFilters.duration,
          triageFilters.durationUnit,
          diagnosis.typicalDuration
        );
        filterMatches.duration = matches;
        if (matches) filterMatchCount++;
      }

      // Check course match
      if (triageFilters.course) {
        totalFilters++;
        const matches = matchesCourse(triageFilters.course, diagnosis.course);
        filterMatches.course = matches;
        if (matches) filterMatchCount++;
      }

      // Check severity match
      if (triageFilters.severityLevel) {
        totalFilters++;
        const matches = matchesSeverity(triageFilters.severityLevel, diagnosis.severity);
        filterMatches.severity = matches;
        if (matches) filterMatchCount++;
      }

      // Check preliminaryDiagnosis match (text search)
      if (triageFilters.preliminaryDiagnosis) {
        totalFilters++;
        const searchText = triageFilters.preliminaryDiagnosis;
        const matchesName = matchesText(searchText, diagnosis.name);
        const matchesKeySymptoms = matchesText(searchText, diagnosis.keySymptomsSummary);
        const matchesFullCriteria = matchesText(searchText, diagnosis.fullCriteriaSummary);
        const matches = matchesName || matchesKeySymptoms || matchesFullCriteria;
        filterMatches.preliminaryDiagnosis = matches;
        if (matches) filterMatchCount++;
      }

      // Check notes match (text search)
      if (triageFilters.notes) {
        totalFilters++;
        const searchText = triageFilters.notes;
        const matchesNotes = matchesText(searchText, diagnosis.notes);
        const matchesKeySymptoms = matchesText(searchText, diagnosis.keySymptomsSummary);
        const matchesFullCriteria = matchesText(searchText, diagnosis.fullCriteriaSummary);
        const matches = matchesNotes || matchesKeySymptoms || matchesFullCriteria;
        filterMatches.notes = matches;
        if (matches) filterMatchCount++;
      }
    }

    return {
      ...diagnosis,
      matchedSymptoms: matchedInputSymptoms, // Input symptoms that matched
      matchedDiagnosisSymptoms, // Diagnosis symptoms that matched
      matchCount, // Symptom match count (primary)
      matchPercentage: Math.round(matchPercentage * 100) / 100,
      allSymptoms: diagnosisSymptoms,
      filterMatchCount, // How many triage filters matched
      totalFilters, // Total number of triage filters applied
      filterMatches // Detailed filter match info
    };
  });

  // Filter: Show diagnoses that have at least one symptom match OR at least one filter match
  // OR if showAll is true and no symptoms/filters provided, show all
  const hasSymptoms = deduplicatedSymptoms.length > 0;
  const hasFilters = Object.keys(triageFilters).length > 0;
  
  if (hasSymptoms || hasFilters || showAll) {
    matchedDiagnoses = matchedDiagnoses.filter(diagnosis => {
      // If showAll is true and no criteria provided, show all
      if (showAll && !hasSymptoms && !hasFilters) {
        return true;
      }
      
      // Show if symptoms match OR filters match
      const hasSymptomMatch = diagnosis.matchCount > 0;
      const hasFilterMatch = diagnosis.filterMatchCount > 0;
      
      return hasSymptomMatch || hasFilterMatch;
    });
  } else {
    // No symptoms, no filters, and showAll is false - show nothing
    matchedDiagnoses = [];
  }

  // Calculate total match score (symptoms + filters) for sorting
  matchedDiagnoses.forEach(diagnosis => {
    diagnosis.totalMatchScore = diagnosis.matchCount + diagnosis.filterMatchCount;
  });

  // Sort: first by total match score (symptoms + filters), then by symptom match count, 
  // then by filter match count, then by match percentage, then by creation date
  matchedDiagnoses.sort((a, b) => {
    // Primary sort: total match score (symptoms + filters)
    if (b.totalMatchScore !== a.totalMatchScore) {
      return b.totalMatchScore - a.totalMatchScore;
    }
    // Secondary sort: symptom match count
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    // Tertiary sort: filter match count
    if (b.filterMatchCount !== a.filterMatchCount) {
      return b.filterMatchCount - a.filterMatchCount;
    }
    // Fourth sort: match percentage
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    // Final sort: creation date
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
export async function getTriageRecords(patientId, user, queryParams = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  // Get organization ID (handle both ObjectId and populated object)
  const organizationId = user.organization?._id || user.organization;
  const userId = user._id || user.id;

  // Verify patient access based on user role
  let patient;
  if (user.role === 'company_admin') {
    // Company admin: verify patient belongs to their organization
    if (!organizationId) {
      throw new Error('Company admin must belong to an organization');
    }
    patient = await Patient.findOne({
      _id: patientId,
      organization: organizationId
    });
  } else {
    // Psychologist: verify patient is assigned to them
    patient = await Patient.findOne({
      _id: patientId,
      assignedPsychologist: userId
    });
  }

  if (!patient) {
    throw new Error('Patient not found or access denied');
  }

  // Build base filter
  const filter = {
    patient: patientId
  };

  // For psychologist: filter by their triages only
  // For company_admin: show all triages for patients in their organization
  if (user.role === 'psychologist') {
    filter.psychologist = userId;
  } else if (user.role === 'company_admin') {
    // Company admin can see all triages for patients in their organization
    // No need to filter by psychologist - show all triages for the patient
  }

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

