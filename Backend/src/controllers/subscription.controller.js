import asyncWrapper from '../middleware/async.wrapper.js';
import Organization from '../models/Organization.js';
import {
  upgradeOrganizationSeats,
  scheduleOrganizationCancellation,
  undoOrganizationCancellation,
  scheduleUserCancellation,
  undoUserCancellation,
} from '../services/subscription.service.js';

/**
 * POST /api/subscription/organizations/:organizationId/upgrade-seats
 * Body: { additionalSeats: number }
 */
export const upgradeSeats = asyncWrapper(async (req, res) => {
  const { organizationId } = req.params;
  const { additionalSeats } = req.body || {};

  if (additionalSeats === undefined || additionalSeats === null) {
    return res.status(400).json({
      success: false,
      error: 'additionalSeats is required',
    });
  }

  const result = await upgradeOrganizationSeats(organizationId, additionalSeats);

  return res.json({
    success: true,
    data: {
      organization: result.organization,
      subscription: result.subscription,
    },
    message: 'Seats upgraded successfully',
  });
});

/**
 * POST /api/subscription/organizations/:organizationId/cancel-at-period-end
 * Body: { reason?: string }
 * Schedule organization subscription cancellation at period end
 * Only organization admin can cancel their organization's subscription
 */
export const scheduleOrgCancellation = asyncWrapper(async (req, res) => {
  const { organizationId } = req.params;
  const { reason } = req.body || {};
  const userId = req.user?.id || req.user?._id;

  // Check authorization first
  const organization = await Organization.findById(organizationId).populate('admin', '_id');
  
  if (!organization) {
    return res.status(404).json({
      success: false,
      error: 'Organization not found',
    });
  }

  // Verify user is the admin of this organization (or super admin)
  const adminId = organization.admin?._id || organization.admin;
  if (adminId?.toString() !== userId?.toString() && req.user?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only the organization admin can cancel this subscription',
    });
  }

  const result = await scheduleOrganizationCancellation(organizationId, reason);

  return res.json({
    success: true,
    data: {
      organization: result.organization,
      subscription: result.subscription,
    },
    message: 'Cancellation scheduled successfully. Subscription will remain active until the end of the current billing period.',
  });
});

/**
 * POST /api/subscription/organizations/:organizationId/undo-cancel
 * Undo scheduled organization subscription cancellation
 * Only organization admin can undo cancellation
 */
export const undoOrgCancellation = asyncWrapper(async (req, res) => {
  const { organizationId } = req.params;
  const userId = req.user?.id || req.user?._id;

  // Check authorization first
  const organization = await Organization.findById(organizationId).populate('admin', '_id');
  
  if (!organization) {
    return res.status(404).json({
      success: false,
      error: 'Organization not found',
    });
  }

  // Verify user is the admin of this organization (or super admin)
  const adminId = organization.admin?._id || organization.admin;
  if (adminId?.toString() !== userId?.toString() && req.user?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only the organization admin can undo cancellation for this subscription',
    });
  }

  const result = await undoOrganizationCancellation(organizationId);

  return res.json({
    success: true,
    data: {
      organization: result.organization,
      subscription: result.subscription,
    },
    message: 'Cancellation undone successfully. Subscription will continue after the current billing period.',
  });
});

/**
 * POST /api/subscription/users/:userId/cancel-at-period-end
 * Body: { reason?: string }
 * Schedule individual user subscription cancellation at period end
 * Users can only cancel their own subscription
 */
export const scheduleUserCancel = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body || {};
  const currentUserId = req.user?.id || req.user?._id;

  // Verify user is canceling their own subscription (or is super admin)
  if (userId !== currentUserId.toString() && req.user?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'You can only cancel your own subscription',
    });
  }

  const result = await scheduleUserCancellation(userId, reason);

  return res.json({
    success: true,
    data: {
      user: result.user,
      subscription: result.subscription,
    },
    message: 'Cancellation scheduled successfully. Subscription will remain active until the end of the current billing period.',
  });
});

/**
 * POST /api/subscription/users/:userId/undo-cancel
 * Undo scheduled individual user subscription cancellation
 * Users can only undo cancellation for their own subscription
 */
export const undoUserCancel = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user?.id || req.user?._id;

  // Verify user is undoing cancellation for their own subscription (or is super admin)
  if (userId !== currentUserId.toString() && req.user?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'You can only undo cancellation for your own subscription',
    });
  }

  const result = await undoUserCancellation(userId);

  return res.json({
    success: true,
    data: {
      user: result.user,
      subscription: result.subscription,
    },
    message: 'Cancellation undone successfully. Subscription will continue after the current billing period.',
  });
});

