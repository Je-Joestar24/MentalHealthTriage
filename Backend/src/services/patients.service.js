import Patient from '../models/Patient.js';
import User from '../models/User.js';
import '../models/Triage.js';

export const getPatients = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    psychologist = '',
    organization = '',
    includeDeleted = 'false'
  } = queryParams;

  const filter = {};

  if (includeDeleted === 'false') {
    filter.isDeleted = false;
  }

  if (status) {
    filter.status = status;
  }

  if (psychologist) {
    filter.assignedPsychologist = psychologist;
  }

  if (organization) {
    filter.organization = organization;
  }

  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [
      { name: regex },
      { 'contactInfo.email': regex },
      { 'contactInfo.phone': regex }
    ];
  }

  const sort = { createdAt: -1 };
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate('assignedPsychologist', 'name email role')
      .populate('organization', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(),
    Patient.countDocuments(filter)
  ]);

  return {
    patients,
    pagination: {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: skip + parseInt(limit, 10) < total,
      hasPrevPage: parseInt(page, 10) > 1
    }
  };
};

export const createPatient = async (payload) => {
  const {
    name,
    age,
    gender = 'other',
    contactInfo = {},
    assignedPsychologist,
    organization = null
  } = payload;

  if (!name || typeof age === 'undefined' || !assignedPsychologist) {
    throw new Error('Name, age, and assigned psychologist are required');
  }

  const psychologistExists = await User.exists({ _id: assignedPsychologist, role: 'psychologist' });
  if (!psychologistExists) {
    throw new Error('Assigned psychologist not found');
  }

  const patient = await Patient.create({
    name: name.trim(),
    age,
    gender,
    contactInfo,
    assignedPsychologist,
    organization,
    status: 'active'
  });

  return Patient.findById(patient._id)
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .lean();
};

export const updatePatient = async (patientId, updateData) => {
  const patient = await Patient.findOne({ _id: patientId, isDeleted: false });
  if (!patient) {
    throw new Error('Patient not found');
  }

  const allowedFields = ['name', 'age', 'gender', 'contactInfo', 'assignedPsychologist', 'organization', 'status'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updateData, field)) {
      updates[field] = updateData[field];
    }
  });

  if (updates.assignedPsychologist) {
    const psychologistExists = await User.exists({ _id: updates.assignedPsychologist, role: 'psychologist' });
    if (!psychologistExists) {
      throw new Error('Assigned psychologist not found');
    }
  }

  Object.assign(patient, updates);
  await patient.save();

  return Patient.findById(patientId)
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .lean();
};

export const softDeletePatient = async (patientId) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, isDeleted: false },
    { isDeleted: true, status: 'inactive' },
    { new: true }
  )
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .lean();

  if (!patient) {
    throw new Error('Patient not found or already deleted');
  }

  return patient;
};

export const restorePatient = async (patientId) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, isDeleted: true },
    { isDeleted: false, status: 'active' },
    { new: true }
  )
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .lean();

  if (!patient) {
    throw new Error('Patient not found or not deleted');
  }

  return patient;
};

export const getPatientById = async (patientId) => {
  const patient = await Patient.findOne({ _id: patientId })
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .populate({
      path: 'triageRecords',
      populate: [
        { path: 'psychologist', select: 'name email role' },
        { path: 'patient', select: 'name' }
      ],
      options: { sort: { createdAt: -1 } }
    })
    .lean();

  if (!patient) {
    throw new Error('Patient not found');
  }

  return patient;
};

