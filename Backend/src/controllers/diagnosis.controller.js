import * as diagnosisService from '../services/diagnosis.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';
import User from '../models/User.js';

export const getAllDiagnoses = asyncWrapper(async (req, res) => {
  const result = await diagnosisService.getAllDiagnoses(req.query, req.user);
  res.json({
    success: true,
    data: result.diagnoses,
    pagination: result.pagination
  });
});

export const getDiagnosisById = asyncWrapper(async (req, res) => {
  const diagnosis = await diagnosisService.getDiagnosisById(req.params.id);
  res.json({
    success: true,
    data: diagnosis
  });
});

export const createDiagnosis = asyncWrapper(async (req, res) => {
  const user = req.user;
  
  // Always fetch fresh user data to ensure we have the organization field
  const fullUser = await User.findById(user._id || user.id).select('organization role');
  if (!fullUser) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  // Get organization ID - handle both populated and non-populated
  let userOrgId = null;
  if (fullUser.organization) {
    if (typeof fullUser.organization === 'object' && fullUser.organization._id) {
      userOrgId = fullUser.organization._id;
    } else {
      userOrgId = fullUser.organization;
    }
  }
  
  const diagnosisData = {
    ...req.body,
    createdBy: fullUser._id
  };

  // Auto-set type and organization based on user role
  if (fullUser.role === 'company_admin') {
    if (userOrgId) {
      // Company admin with organization: default to organization-type
      if (!diagnosisData.type || diagnosisData.type === 'organization') {
        diagnosisData.type = 'organization';
        // Explicitly set organization - ensure it's a valid ObjectId
        diagnosisData.organization = userOrgId;
      } else if (diagnosisData.type === 'personal') {
        // Allow personal diagnoses, but don't set organization
        diagnosisData.organization = null;
      }
    } else {
      // Company admin without organization: treat as personal
      diagnosisData.type = diagnosisData.type || 'personal';
      diagnosisData.organization = null;
    }
  } else if (fullUser.role === 'super_admin') {
    // Super admin creates global diagnoses
    diagnosisData.type = diagnosisData.type || 'global';
    diagnosisData.organization = null;
  } else {
    // Psychologist or individual user creates personal diagnoses
    diagnosisData.type = diagnosisData.type || 'personal';
    diagnosisData.organization = null;
  }

  const diagnosis = await diagnosisService.createDiagnosis(diagnosisData);
  res.status(201).json({
    success: true,
    data: diagnosis
  });
});

export const updateDiagnosis = asyncWrapper(async (req, res) => {
  const diagnosis = await diagnosisService.updateDiagnosis(req.params.id, req.body, req.user);
  res.json({
    success: true,
    data: diagnosis
  });
});

export const deleteDiagnosis = asyncWrapper(async (req, res) => {
  await diagnosisService.deleteDiagnosis(req.params.id);
  res.json({
    success: true,
    message: 'Diagnosis deleted successfully'
  });
});

export const bulkImportDiagnoses = asyncWrapper(async (req, res) => {
  const diagnoses = await diagnosisService.bulkImportDiagnoses(req.body.diagnoses, req.user.id);
  res.status(201).json({
    success: true,
    data: diagnoses,
    message: `Successfully imported ${diagnoses.length} diagnoses`
  });
});

export const getAllSymptoms = asyncWrapper(async (req, res) => {
  const list = await diagnosisService.getAllSymptoms();
  res.json({ success: true, data: list });
});