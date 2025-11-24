import * as companyDetailsService from '../services/companydetails.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

/**
 * GET /api/company/details
 * Get company details for the logged-in company admin
 */
export const getCompanyDetails = asyncWrapper(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const details = await companyDetailsService.getCompanyDetails(userId);
  
  res.json({
    success: true,
    data: details
  });
});

/**
 * PUT /api/company/details
 * Update company details (name only)
 * Company admin can only update the organization name
 */
export const updateCompanyDetails = asyncWrapper(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const updated = await companyDetailsService.updateCompanyDetails(userId, req.body);
  
  res.json({
    success: true,
    data: updated,
    message: 'Company details updated successfully'
  });
});

