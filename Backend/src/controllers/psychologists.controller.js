import * as psychologistsService from '../services/psychologists.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

export const getPsychologists = asyncWrapper(async (req, res) => {
  const result = await psychologistsService.getPsychologists(req.query, req.user);

  res.json({
    success: true,
    data: result.psychologists,
    pagination: result.pagination
  });
});

