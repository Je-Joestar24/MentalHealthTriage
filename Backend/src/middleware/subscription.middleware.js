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
          subscription_status: organization.subscription_status, // Stripe status (source of truth)
          subscriptionStatus: organization.subscription_status === 'active' && organization.is_paid ? 'active' : 'inactive', // Legacy field for frontend
          subscriptionEndDate: organization.subscriptionEndDate,
          daysRemaining: organization.daysRemaining
        }
      });
    }

    // Check if subscription is not active or not paid (use subscription_status from Stripe)
    if (!organization.is_paid || organization.subscription_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Organization subscription is not active',
        data: {
          subscription_status: organization.subscription_status, // Stripe status (source of truth)
          subscriptionStatus: organization.subscription_status === 'active' && organization.is_paid ? 'active' : 'inactive', // Legacy field for frontend
          is_paid: organization.is_paid,
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
// For organization users, checks organization subscription
// For individual users, checks user subscription
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

    // For organization users, check organization subscription
    if (req.user.organization && req.user.account_type === 'organization') {
      const organization = await Organization.findById(req.user.organization);
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          error: 'Organization not found'
        });
      }

      // Check if organization subscription is active and paid
      if (!organization.is_paid || organization.subscription_status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Organization subscription is not active',
          data: {
            subscription_status: organization.subscription_status,
            is_paid: organization.is_paid,
            subscriptionEndDate: organization.subscriptionEndDate
          }
        });
      }

      // Check if subscription is expired
      if (organization.isSubscriptionExpired) {
        return res.status(403).json({
          success: false,
          error: 'Organization subscription has expired',
          data: {
            subscriptionEndDate: organization.subscriptionEndDate,
            daysRemaining: organization.daysRemaining
          }
        });
      }

      return next();
    }

    // For individual users, check user subscription
    if (!req.user.is_paid || req.user.subscription_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'User subscription is not active',
        data: {
          subscription_status: req.user.subscription_status,
          is_paid: req.user.is_paid,
          subscriptionEndDate: req.user.subscriptionEndDate
        }
      });
    }

    // Check if user subscription is expired
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
// For organization users, uses organization subscription data
// For individual users, uses user subscription data
export const addSubscriptionInfo = async (req, res, next) => {
  try {
    if (req.user?.organization && req.user.account_type === 'organization') {
      // For organization users, get organization subscription info
      const organization = await Organization.findById(req.user.organization);
      
      if (organization) {
        // Add subscription info to response locals (using subscription_status, not subscriptionStatus)
        res.locals.subscriptionInfo = {
          organizationId: organization._id,
          organizationName: organization.name,
           subscription_status: organization.subscription_status, // Stripe status (source of truth)
           subscriptionStatus: organization.subscription_status === 'active' && organization.is_paid ? 'active' : 'inactive', // Legacy field mapped from subscription_status
           is_paid: organization.is_paid,
           stripe_subscription_id: organization.stripe_subscription_id,
          subscriptionStartDate: organization.subscriptionStartDate,
          subscriptionEndDate: organization.subscriptionEndDate,
          isSubscriptionExpired: organization.isSubscriptionExpired,
           daysRemaining: organization.daysRemaining,
           psychologistSeats: organization.psychologistSeats,
           seats_limit: organization.seats_limit
        };
      }
    } else if (req.user && !req.user.organization) {
      // For individual users, use user subscription info
      res.locals.subscriptionInfo = {
        subscription_status: req.user.subscription_status,
        is_paid: req.user.is_paid,
        stripe_subscription_id: req.user.stripe_subscription_id,
        subscriptionStartDate: req.user.subscriptionStartDate,
        subscriptionEndDate: req.user.subscriptionEndDate,
        isSubscriptionExpired: req.user.isSubscriptionExpired,
        daysRemaining: req.user.daysRemaining
      };
    }

    next();
  } catch (error) {
    // Don't fail the request if subscription info can't be loaded
    next();
  }
};
