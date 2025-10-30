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

export async function getAllDiagnoses(queryParams = {}) {
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

export async function bulkImportDiagnoses(diagnosesData, userId) {
  const diagnoses = diagnosesData.map(raw => {
    const data = { ...raw };
    // Map CSV-like keys to fields
    const mapped = {
      name: data.name || data.diagnosis || data.title,
      section: data.section,
      chapter: data.chapter,
      fullCriteriaSummary: data.fullCriteriaSummary || data.full_criteria_summary,
      keySymptomsSummary: data.keySymptomsSummary || data.key_symptoms_summary || data.key_symptoms_sammary,
      validatedScreenerParaphrased: data.validatedScreenerParaphrased || data.validated_screener_paraphrased,
      exactScreenerItem: data.exactScreenerItem || data.exact_screener_item,
      durationContext: data.durationContext || data.duration_context,
      severity: data.severity,
      specifiers: data.specifiers,
      criteriaPage: data.criteriaPage ?? (typeof data.criteria_page === 'string' ? parseInt(data.criteria_page, 10) : data.criteria_page),
      // legacy single-system fields if present
      system: data.system,
      code: data.code,
      // dual code support
      dsm5Code: data.dsm5Code || data.dsm5_code,
      icd10Code: data.icd10Code || data.icd10_code,
      course: data.course,
      typicalDuration: data.typicalDuration, // if CSV provides, otherwise leave undefined
    };

    // Symptoms normalization (string list -> array)
    const symptoms = Array.isArray(data.symptoms)
      ? data.symptoms
      : data.symptom // CSV may have single symptom column repeated per row; still accept
        ? [String(data.symptom)]
        : (data.symptoms?.split(/[,;]/) || [])
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);

    return {
      ...mapped,
      createdBy: userId,
      symptoms,
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

