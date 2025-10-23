import Diagnosis from '../models/Diagnosis.js';
import mongoose from 'mongoose';

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

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  
  if (type) {
    filter.type = type;
  }

  if (system) {
    filter.system = system;
  }

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

  const diagnosis = await Diagnosis.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

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
  const diagnoses = diagnosesData.map(data => ({
    ...data,
    createdBy: userId,
    symptoms: Array.isArray(data.symptoms) 
      ? data.symptoms 
      : data.symptoms?.split(/[,;]/).map(s => s.trim().toLowerCase()) || []
  }));

  return await Diagnosis.insertMany(diagnoses, { ordered: false });
}

