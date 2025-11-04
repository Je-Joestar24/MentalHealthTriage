import * as diagnosisService from '../services/diagnosis.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

export const getAllDiagnoses = asyncWrapper(async (req, res) => {
  const result = await diagnosisService.getAllDiagnoses(req.query);
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
  const diagnosisData = {
    ...req.body,
    createdBy: req.user.id
  };
  const diagnosis = await diagnosisService.createDiagnosis(diagnosisData);
  res.status(201).json({
    success: true,
    data: diagnosis
  });
});

export const updateDiagnosis = asyncWrapper(async (req, res) => {
  const diagnosis = await diagnosisService.updateDiagnosis(req.params.id, req.body);
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