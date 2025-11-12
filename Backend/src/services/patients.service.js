import Patient from '../models/Patient.js';
import User from '../models/User.js';
import '../models/Triage.js';

const ensurePsychologist = async (id) => {
  const exists = await User.exists({ _id: id, role: 'psychologist' });
  if (!exists) {
    throw new Error('Assigned psychologist not found');
  }
};

export const getPatients = async (queryParams = {}, user) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    includeDeleted = 'false',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  const filter = {
    assignedPsychologist: user._id
  };

  if (user.organization) {
    filter.organization = user.organization;
  }

  if (includeDeleted === 'false') {
    filter.isDeleted = false;
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [
      { name: regex },
      { 'contactInfo.email': regex },
      { 'contactInfo.phone': regex }
    ];
  }

  const allowedSortFields = {
    name: 'name',
    createdAt: 'createdAt'
  };

  const sortField = allowedSortFields[sortBy] || 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDirection };
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

export const createPatient = async (payload, user) => {
  const {
    name,
    age,
    gender = 'other',
    contactInfo = {},
    organization = null
  } = payload;

  if (!name || typeof age === 'undefined') {
    throw new Error('Name and age are required');
  }

  const assignedPsychologist = user._id;
  await ensurePsychologist(assignedPsychologist);

  const patient = await Patient.create({
    name: name.trim(),
    age,
    gender,
    contactInfo,
    assignedPsychologist,
    organization: organization ?? user.organization ?? null,
    status: 'active'
  });

  return Patient.findById(patient._id)
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .lean();
};

export const updatePatient = async (patientId, updateData, user) => {
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: user._id,
    isDeleted: false
  });
  if (!patient) {
    throw new Error('Patient not found');
  }

  const allowedFields = ['name', 'age', 'gender', 'contactInfo', 'status'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updateData, field)) {
      updates[field] = updateData[field];
    }
  });

  Object.assign(patient, updates);
  await patient.save();

  return Patient.findById(patientId)
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .lean();
};

export const softDeletePatient = async (patientId, user) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, assignedPsychologist: user._id, isDeleted: false },
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

export const restorePatient = async (patientId, user) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, assignedPsychologist: user._id, isDeleted: true },
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

export const getPatientById = async (patientId, user) => {
  const patient = await Patient.findOne({
    _id: patientId,
    assignedPsychologist: user._id
  })
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

