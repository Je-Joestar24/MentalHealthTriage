import asyncWrapper from '../middleware/async.wrapper.js';
import * as publicService from '../services/public.service.js';

/**
 * GET /api/public/stats
 * Get public statistics (professionals and clients count)
 * No authentication required - public endpoint
 */
export const getPublicStats = asyncWrapper(async (req, res) => {
  const stats = await publicService.getPublicStats();

  res.json({
    success: true,
    data: stats,
  });
});

