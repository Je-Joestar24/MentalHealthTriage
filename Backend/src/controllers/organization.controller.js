import * as organizationService from '../services/organization.service.js';
import asyncWrapper from '../middleware/async.wrapper.js';

// GET /api/admin/organizations - Get all organizations with pagination and filtering
export const getAllOrganizations = asyncWrapper(async (req, res) => {
  const result = await organizationService.getAllOrganizations(req.query);
  
  res.json({
    success: true,
    data: result.organizations,
    pagination: result.pagination
  });
});

// GET /api/admin/organizations/:id - Get single organization with details
export const getOrganizationById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const organization = await organizationService.getOrganizationById(id);
  
  res.json({
    success: true,
    data: organization
  });
});

// PATCH /api/admin/organizations/:id/status - Update organization subscription status
export const updateOrganizationStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { subscriptionStatus, subscriptionEndDate } = req.body;
  
  if (!subscriptionStatus) {
    return res.status(400).json({
      success: false,
      error: 'Subscription status is required'
    });
  }

  const organization = await organizationService.updateOrganizationStatus(id, subscriptionStatus, subscriptionEndDate);
  
  res.json({
    success: true,
    data: organization,
    message: `Organization status updated to ${subscriptionStatus}`
  });
});

// POST /api/admin/organizations - Create new organization (supports nested admin creation)
export const createOrganization = asyncWrapper(async (req, res) => {
  const organizationData = req.body;

  // Validate required fields
  if (!organizationData.name || !organizationData.admin) {
    return res.status(400).json({
      success: false,
      error: 'Organization name and admin are required'
    });
  }

  // If admin is nested object, validate basics
  if (typeof organizationData.admin === 'object') {
    const { name, email, password } = organizationData.admin || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Admin name, email and password are required' });
    }
  }

  const organization = await organizationService.createOrganization(organizationData);

  res.status(201).json({
    success: true,
    data: organization,
    message: 'Organization created successfully'
  });
});

// PUT /api/admin/organizations/:id - Update organization
export const updateOrganization = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const organization = await organizationService.updateOrganization(id, updateData);
  
  res.json({
    success: true,
    data: organization,
    message: 'Organization updated successfully'
  });
});

// DELETE /api/admin/organizations/:id - Delete organization
export const deleteOrganization = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  const result = await organizationService.deleteOrganization(id);
  
  res.json({
    success: true,
    message: result.message
  });
});

// GET /api/admin/organizations/:id/stats - Get organization statistics
export const getOrganizationStats = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  const stats = await organizationService.getOrganizationStats(id);
  
  res.json({
    success: true,
    data: stats
  });
});

// POST /api/admin/organizations/:id/extend - Extend organization subscription
export const extendSubscription = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { subscriptionEndDate } = req.body;
  
  if (!subscriptionEndDate) {
    return res.status(400).json({
      success: false,
      error: 'Subscription end date is required'
    });
  }

  const organization = await organizationService.extendSubscription(id, subscriptionEndDate);
  
  res.json({
    success: true,
    data: organization,
    message: 'Subscription extended successfully'
  });
});

// POST /api/admin/organizations/check-expired - Check and update expired subscriptions
export const checkExpiredSubscriptions = asyncWrapper(async (req, res) => {
  const result = await organizationService.checkAndUpdateExpiredSubscriptions();
  
  res.json({
    success: true,
    data: result,
    message: `Checked and updated ${result.updatedCount} expired subscriptions`
  });
});
