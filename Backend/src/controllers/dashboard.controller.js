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

/**
 * GET /api/psychologist/dashboard/stats
 * Get dashboard statistics for psychologist
 * Requires psychologist authentication
 */
export const getPsychologistDashboardStats = asyncWrapper(async (req, res) => {
  const psychologistId = req.user._id || req.user.id;
  const stats = await dashboardService.getPsychologistDashboardStats(psychologistId);
  
  res.json({
    success: true,
    data: stats
  });
});

