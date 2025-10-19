import Organization from '../models/Organization.js';
import User from '../models/User.js';

// Middleware to check if organization has active subscription
export const requireActiveSubscription = async (req, res, next) => {
  try {
    // Get organization ID from user or request params
    let organizationId = req.user?.organization;
    
    // If organization ID is in params, use that
    if (req.params.organizationId) {
      organizationId = req.params.organizationId;
    }

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check if subscription is expired
    if (organization.isSubscriptionExpired) {
      return res.status(403).json({
        success: false,
        error: 'Organization subscription has expired',
        data: {
          subscriptionStatus: organization.subscriptionStatus,
          subscriptionEndDate: organization.subscriptionEndDate,
          daysRemaining: organization.daysRemaining
        }
      });
    }

    // Check if subscription is inactive
    if (organization.subscriptionStatus === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Organization subscription is inactive',
        data: {
          subscriptionStatus: organization.subscriptionStatus,
          subscriptionEndDate: organization.subscriptionEndDate
        }
      });
    }

    // Add organization data to request for use in controllers
    req.organization = organization;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has active subscription
export const requireUserActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Super admins don't need subscription checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user has subscription end date
    if (req.user.subscriptionEndDate) {
      if (req.user.isSubscriptionExpired) {
        return res.status(403).json({
          success: false,
          error: 'User subscription has expired',
          data: {
            subscriptionEndDate: req.user.subscriptionEndDate,
            daysRemaining: req.user.daysRemaining
          }
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check subscription status and add info to response
export const addSubscriptionInfo = async (req, res, next) => {
  try {
    if (req.user?.organization) {
      const organization = await Organization.findById(req.user.organization);
      
      if (organization) {
        // Add subscription info to response locals
        res.locals.subscriptionInfo = {
          organizationId: organization._id,
          organizationName: organization.name,
          subscriptionStatus: organization.subscriptionStatus,
          subscriptionStartDate: organization.subscriptionStartDate,
          subscriptionEndDate: organization.subscriptionEndDate,
          isSubscriptionExpired: organization.isSubscriptionExpired,
          daysRemaining: organization.daysRemaining
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail the request if subscription info can't be loaded
    next();
  }
};
