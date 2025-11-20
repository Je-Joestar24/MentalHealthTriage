import Diagnosis from '../models/Diagnosis.js';
import mongoose from 'mongoose';
import Symptom from '../models/Symptoms.js';

// Utility: converts snake_case (or kebab-case) to pretty form (Depressed mood)
function toPrettySymptom(raw) {
  if (!raw) return '';
  // Remove # if present, split by underscores, capitalize first word
  let s = raw.trim().replace(/^#+/, '').replace(/[-_]+/g, ' ');
  s = s.replace(/\s+/g, ' ').toLowerCase();
  return s.replace(/^\w/, (c) => c.toUpperCase());
}

async function upsertSymptoms(symptoms) {
  if (!symptoms || !Array.isArray(symptoms)) return;
  const prettyList = symptoms.map(toPrettySymptom);
  const ops = prettyList.filter(Boolean).map((name) => ({ updateOne: { filter: { name }, update: { $setOnInsert: { name } }, upsert: true } }));
  if (ops.length) {
    try {
      await Symptom.bulkWrite(ops, { ordered: false });
    } catch (e) {/* ignore dupe errors */}
  }
}

export async function getAllDiagnoses(queryParams = {}, user = null) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    type,
    system
  } = queryParams;

  // Build filter object using composable $and clauses to support combining search + system
  const andClauses = [];
  
  // Apply user-based access control
  if (user) {
    // Super admin can see all diagnoses
    if (user.role === 'super_admin') {
      // No additional filter needed - show all
    } 
    // User with organization: can see global, organization (same org), and personal (their own)
    else if (user.organization) {
      andClauses.push({
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
      });
    }
    // Individual user (no organization): can see global and their personal diagnoses
    else {
      andClauses.push({
        $or: [
          { type: 'global' },
          {
            $and: [
              { type: 'personal' },
              { createdBy: user._id || user.id }
            ]
          }
        ]
      });
    }
  }
  
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    andClauses.push({
      $or: [
        { name: regex },
        { code: regex },
        { dsm5Code: regex },
        { icd10Code: regex }
      ]
    });
  }
  
  if (type) {
    andClauses.push({ type });
  }

  if (system) {
    const systemOr =
      system === 'DSM-5'
        ? { $or: [ { system: 'DSM-5' }, { dsm5Code: { $exists: true, $ne: '' } } ] }
        : { $or: [ { system: 'ICD-10' }, { icd10Code: { $exists: true, $ne: '' } } ] };
    andClauses.push(systemOr);
  }

  const filter = andClauses.length ? { $and: andClauses } : {};

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [diagnoses, total] = await Promise.all([
    Diagnosis.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('organization', 'name'),
    Diagnosis.countDocuments(filter)
  ]);

  return {
    diagnoses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  };
}

export async function getDiagnosisById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid diagnosis ID');
  }
  
  const diagnosis = await Diagnosis.findById(id)
    .populate('createdBy', 'name email')
    .populate('organization', 'name');
    
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }
  
  return diagnosis;
}

export async function createDiagnosis(diagnosisData) {
  // Check for existing diagnosis with same name + system + code
  const existing = await Diagnosis.findOne({
    name: diagnosisData.name,
    system: diagnosisData.system,
    code: diagnosisData.code,
    organization: diagnosisData.organization || null
  });

  if (existing) {
    throw new Error('A diagnosis with this name, system and code already exists');
  }

  const diagnosis = new Diagnosis(diagnosisData);
  await diagnosis.save();
  await upsertSymptoms(diagnosisData.symptoms);
  return diagnosis;
}

export async function updateDiagnosis(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid diagnosis ID');
  }

  // Prevent updating immutable fields
  delete updateData.name;
  delete updateData.system;
  delete updateData.code;
  delete updateData.type;
  delete updateData.createdBy;

  // Normalize potential CSV-style keys to new fields
  if (typeof updateData.dsm5_code === 'string' && !updateData.dsm5Code) {
    updateData.dsm5Code = updateData.dsm5_code;
    delete updateData.dsm5_code;
  }
  if (typeof updateData.icd10_code === 'string' && !updateData.icd10Code) {
    updateData.icd10Code = updateData.icd10_code;
    delete updateData.icd10_code;
  }

  const diagnosis = await Diagnosis.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  await upsertSymptoms(updateData.symptoms);
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  return diagnosis;
}

export async function deleteDiagnosis(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid diagnosis ID');
  }

  const diagnosis = await Diagnosis.findByIdAndDelete(id);
  
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  return diagnosis;
}

// Helper to parse semicolon-separated strings into arrays
function parseSemicolonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(';').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function bulkImportDiagnoses(diagnosesData, userId) {
  const diagnoses = diagnosesData.map(raw => {
    const data = { ...raw };
    // Map CSV-like keys to fields
    const mapped = {
      name: data.name || data.diagnosis || data.Diagnosis || data.title,
      section: data.section || data.Section,
      chapter: data.chapter || data.Chapter,
      fullCriteriaSummary: data.fullCriteriaSummary || data.full_criteria_summary || data.Full_criteria_summary,
      keySymptomsSummary: data.keySymptomsSummary || data.key_symptoms_summary || data.key_symptoms_sammary || data.Key_symptoms_summary,
      validatedScreenerParaphrased: data.validatedScreenerParaphrased || data.validated_screener_paraphrased || data.Validated_screener_paraphrased,
      exactScreenerItem: data.exactScreenerItem || data.exact_screener_item || data.Exact_screener_item,
      durationContext: data.durationContext || data.duration_context || data.Duration_context,
      severity: parseSemicolonArray(data.severity || data.Severity), // Parse semicolon-separated to array
      specifiers: parseSemicolonArray(data.specifiers || data.Specifiers || data.specifier), // Parse semicolon-separated to array
      criteriaPage: data.criteriaPage ?? data.criteria_page ?? data.Criteria_page
        ? (typeof (data.criteriaPage ?? data.criteria_page ?? data.Criteria_page) === 'string' 
            ? parseInt(data.criteriaPage ?? data.criteria_page ?? data.Criteria_page, 10) 
            : (data.criteriaPage ?? data.criteria_page ?? data.Criteria_page))
        : undefined,
      // legacy single-system fields - derive from dual codes if present
      system: data.system || (data.dsm5_code || data.dsm5Code || data.DSM5_code) ? 'DSM-5' : 'ICD-10',
      code: data.code || data.dsm5_code || data.dsm5Code || data.dsm5Code || data.DSM5_code || data.icd10_code || data.icd10Code || data.ICD10_code,
      // dual code support
      dsm5Code: data.dsm5Code || data.dsm5_code || data.DSM5_code || undefined,
      icd10Code: data.icd10Code || data.icd10_code || data.ICD10_code || undefined,
      course: data.course || data.Course || 'Either',
      typicalDuration: data.typicalDuration || data.typical_duration, // if CSV provides, otherwise leave undefined
    };

    // Symptoms normalization - handle both single symptom column and array
    let symptoms = [];
    if (Array.isArray(data.symptom)) {
      // Already an array (from frontend combination logic) - keep as is, just trim and filter
      symptoms = data.symptom.map(s => String(s).trim()).filter(Boolean);
    } else if (Array.isArray(data.symptoms)) {
      // Fallback to symptoms array if present
      symptoms = data.symptoms.map(s => String(s).trim()).filter(Boolean);
    } else if (data.symptom || data.Symptom) {
      // Single symptom column - convert to array
      const symptomValue = String(data.symptom || data.Symptom || '').trim();
      if (symptomValue) {
        // Keep in pretty format (frontend already normalized)
        symptoms = [symptomValue];
      }
    } else if (data.symptoms && typeof data.symptoms === 'string') {
      // Already a string - split by comma/semicolon
      symptoms = String(data.symptoms).split(/[,;]/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    return {
      ...mapped,
      createdBy: userId,
      symptoms,
      type: 'global', // Bulk imports default to global
      organization: null,
    };
  });

  await upsertSymptoms([].concat(...diagnoses.map(d => d.symptoms || [])));
  return await Diagnosis.insertMany(diagnoses, { ordered: false });
}

export async function getAllSymptoms() {
  // Returns array of symptom names, prettified (sorted alphabetically)
  const result = await Symptom.find({}, { name: 1, _id: 0 }).sort({ name: 1 });
  return result.map(r => r.name);
}

