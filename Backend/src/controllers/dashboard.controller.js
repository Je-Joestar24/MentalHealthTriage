import * as dashboardService from '../services/dashboard.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics and counts
 * Requires super admin authentication
 */
export const getDashboardStats = asyncWrapper(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  
  res.json({
    success: true,
    data: stats
  });
});

