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

  const filter = {};

  // Get organization ID (handle both ObjectId and populated object)
  const organizationId = user.organization?._id || user.organization;

  // For company_admin: show all patients in their organization
  // For psychologist: show only patients assigned to them
  if (user.role === 'company_admin') {
    if (!organizationId) {
      throw new Error('Company admin must belong to an organization');
    }
    filter.organization = organizationId;
  } else {
    // Psychologist: filter by assigned psychologist
    filter.assignedPsychologist = user._id;
    if (organizationId) {
      filter.organization = organizationId;
    }
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
  // Only psychologists can create patients
  if (user.role !== 'psychologist') {
    throw new Error('Only psychologists can create patients');
  }

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
  // Only psychologists can update patients
  if (user.role !== 'psychologist') {
    throw new Error('Only psychologists can update patients');
  }

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
  // Only psychologists can delete patients
  if (user.role !== 'psychologist') {
    throw new Error('Only psychologists can delete patients');
  }

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
  // Only psychologists can restore patients
  if (user.role !== 'psychologist') {
    throw new Error('Only psychologists can restore patients');
  }

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
  const filter = { _id: patientId };

  // Get organization ID (handle both ObjectId and populated object)
  const organizationId = user.organization?._id || user.organization;

  // For company_admin: filter by organization
  // For psychologist: filter by assigned psychologist
  if (user.role === 'company_admin') {
    if (!organizationId) {
      throw new Error('Company admin must belong to an organization');
    }
    filter.organization = organizationId;
  } else {
    // Psychologist: filter by assigned psychologist
    filter.assignedPsychologist = user._id;
  }

  const patient = await Patient.findOne(filter)
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

export const reassignPsychologist = async (patientId, newPsychologistId, user) => {
  // Only company_admin can reassign psychologists
  if (user.role !== 'company_admin') {
    throw new Error('Only company admin can reassign psychologists to patients');
  }

  // Get organization ID (handle both ObjectId and populated object)
  const organizationId = user.organization?._id || user.organization;
  if (!organizationId) {
    throw new Error('Company admin must belong to an organization');
  }

  // Validate patient exists and belongs to the organization
  const patient = await Patient.findOne({
    _id: patientId,
    organization: organizationId,
    isDeleted: false
  });

  if (!patient) {
    throw new Error('Patient not found or does not belong to your organization');
  }

  // Validate new psychologist exists, is a psychologist, and belongs to the same organization
  const newPsychologist = await User.findOne({
    _id: newPsychologistId,
    role: 'psychologist',
    organization: organizationId,
    isActive: true
  });

  if (!newPsychologist) {
    throw new Error('Psychologist not found, is not active, or does not belong to your organization');
  }

  // Check if the new psychologist is different from the current one
  if (patient.assignedPsychologist.toString() === newPsychologistId.toString()) {
    throw new Error('Patient is already assigned to this psychologist');
  }

  // Update the assigned psychologist
  patient.assignedPsychologist = newPsychologistId;
  await patient.save();

  // Return updated patient with populated fields
  return Patient.findById(patientId)
    .populate('assignedPsychologist', 'name email role')
    .populate('organization', 'name')
    .lean();
};

