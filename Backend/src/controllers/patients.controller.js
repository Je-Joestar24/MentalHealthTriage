import * as patientsService from '../services/patients.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

export const getPatients = asyncWrapper(async (req, res) => {
  const result = await patientsService.getPatients(req.query);

  res.json({
    success: true,
    data: result.patients,
    pagination: result.pagination
  });
});

export const getPatientById = asyncWrapper(async (req, res) => {
  const patient = await patientsService.getPatientById(req.params.id);
  res.json({
    success: true,
    data: patient
  });
});

export const createPatient = asyncWrapper(async (req, res) => {
  const patient = await patientsService.createPatient(req.body);
  res.status(201).json({
    success: true,
    data: patient,
    message: 'Patient created successfully'
  });
});

export const updatePatient = asyncWrapper(async (req, res) => {
  const patient = await patientsService.updatePatient(req.params.id, req.body);
  res.json({
    success: true,
    data: patient,
    message: 'Patient updated successfully'
  });
});

export const softDeletePatient = asyncWrapper(async (req, res) => {
  const patient = await patientsService.softDeletePatient(req.params.id);
  res.json({
    success: true,
    data: patient,
    message: 'Patient deleted successfully'
  });
});

export const restorePatient = asyncWrapper(async (req, res) => {
  const patient = await patientsService.restorePatient(req.params.id);
  res.json({
    success: true,
    data: patient,
    message: 'Patient restored successfully'
  });
});

