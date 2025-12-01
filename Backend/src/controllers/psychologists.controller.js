import * as psychologistsService from '../services/psychologists.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';
import User from '../models/User.js';

export const getPsychologists = asyncWrapper(async (req, res) => {
  // Populate organization if user has one
  let user = req.user;
  if (user.organization) {
    user = await User.findById(user._id).populate('organization', 'name').lean();
  }

  const result = await psychologistsService.getPsychologists(req.query, user);

  res.json({
    success: true,
    data: result.psychologists,
    pagination: result.pagination
  });
});

export const createPsychologist = asyncWrapper(async (req, res) => {
  // Populate organization if user has one
  let user = req.user;
  if (user.organization) {
    user = await User.findById(user._id).populate('organization', 'name').lean();
  }

  const psychologist = await psychologistsService.createPsychologist(req.body, user);

  res.status(201).json({
    success: true,
    data: psychologist,
    message: 'Psychologist created successfully'
  });
});

export const updatePsychologist = asyncWrapper(async (req, res) => {
  // Populate organization if user has one
  let user = req.user;
  if (user.organization) {
    user = await User.findById(user._id).populate('organization', 'name').lean();
  }

  const psychologist = await psychologistsService.updatePsychologist(req.params.id, req.body, user);

  res.json({
    success: true,
    data: psychologist,
    message: 'Psychologist updated successfully'
  });
});

export const deletePsychologist = asyncWrapper(async (req, res) => {
  // Populate organization if user has one
  let user = req.user;
  if (user.organization) {
    user = await User.findById(user._id).populate('organization', 'name').lean();
  }

  const result = await psychologistsService.deletePsychologist(req.params.id, user);

  res.json({
    success: true,
    data: result,
    message: 'Psychologist deleted successfully'
  });
});

