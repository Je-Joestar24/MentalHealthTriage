import Organization from '../models/Organization.js';
import User from '../models/User.js';
import {
  getSubscription,
  updateSubscriptionQuantity,
  scheduleSubscriptionCancellation,
  undoSubscriptionCancellation,
} from './stripe.service.js';

/**
 * Upgrade organization seats (adds to existing seats) with immediate availability.
 * Billing date remains unchanged; Stripe invoices prorated amount for current period.
 *
 * @param {string} organizationId
 * @param {number} additionalSeats - seats to add (must be > 0)
 */
export const upgradeOrganizationSeats = async (organizationId, additionalSeats) => {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }
  const seatsToAdd = parseInt(additionalSeats, 10);
  if (!Number.isFinite(seatsToAdd) || seatsToAdd <= 0) {
    throw new Error('Additional seats must be a positive number');
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  if (!organization.stripe_subscription_id) {
    throw new Error('Organization does not have an active Stripe subscription');
  }

  const currentSeats = Math.max(organization.seats_limit || 0, organization.psychologistSeats || 0, 4);
  const newTotalSeats = currentSeats + seatsToAdd;

  // Update subscription quantity on Stripe (prorates automatically)
  const updatedSubscription = await updateSubscriptionQuantity(
    organization.stripe_subscription_id,
    newTotalSeats
  );

  // Persist the new seat counts locally and align status/dates with Stripe
  organization.seats_limit = newTotalSeats;
  organization.psychologistSeats = newTotalSeats;
  organization.subscription_status = updatedSubscription.status || organization.subscription_status;
  organization.is_paid = updatedSubscription.status === 'active' || organization.is_paid;

  if (updatedSubscription.current_period_end) {
    organization.subscriptionEndDate = new Date(updatedSubscription.current_period_end * 1000);
  }

  await organization.save();

  return {
    organization: organization.toObject(),
    subscription: updatedSubscription,
  };
};

/**
 * Schedule organization subscription cancellation at period end
 * @param {string} organizationId - Organization ID
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<Object>} Updated organization and subscription
 */
export const scheduleOrganizationCancellation = async (organizationId, reason = '') => {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  if (!organization.stripe_subscription_id) {
    throw new Error('Organization does not have an active Stripe subscription');
  }

  // Check if already scheduled for cancellation
  if (organization.cancel_at_period_end) {
    throw new Error('Cancellation is already scheduled for this organization');
  }

  // Schedule cancellation on Stripe
  const updatedSubscription = await scheduleSubscriptionCancellation(organization.stripe_subscription_id);

  // Update organization with cancellation request
  organization.cancel_at_period_end = true;
  organization.cancellationRequestedAt = new Date();
  organization.cancellationReason = reason || '';
  
  // Update subscription end date from Stripe
  if (updatedSubscription.current_period_end) {
    organization.subscriptionEndDate = new Date(updatedSubscription.current_period_end * 1000);
  }

  await organization.save();

  // Sync admin user
  if (organization.admin) {
    await User.findByIdAndUpdate(organization.admin, {
      cancel_at_period_end: true,
      cancellationRequestedAt: organization.cancellationRequestedAt,
      cancellationReason: organization.cancellationReason,
      subscriptionEndDate: organization.subscriptionEndDate,
    });
  }

  // Populate admin for response
  await organization.populate('admin', 'name email role');

  return {
    organization: organization.toObject(),
    subscription: updatedSubscription,
  };
};

/**
 * Undo organization subscription cancellation (keep subscription active)
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated organization and subscription
 */
export const undoOrganizationCancellation = async (organizationId) => {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  if (!organization.stripe_subscription_id) {
    throw new Error('Organization does not have an active Stripe subscription');
  }

  // Check if cancellation is scheduled
  if (!organization.cancel_at_period_end) {
    throw new Error('No cancellation is scheduled for this organization');
  }

  // Undo cancellation on Stripe
  const updatedSubscription = await undoSubscriptionCancellation(organization.stripe_subscription_id);

  // Clear cancellation request from organization
  organization.cancel_at_period_end = false;
  organization.cancellationRequestedAt = null;
  organization.cancellationReason = '';
  
  // Update subscription end date from Stripe (may be extended)
  if (updatedSubscription.current_period_end) {
    organization.subscriptionEndDate = new Date(updatedSubscription.current_period_end * 1000);
  }

  await organization.save();

  // Sync admin user
  if (organization.admin) {
    await User.findByIdAndUpdate(organization.admin, {
      cancel_at_period_end: false,
      cancellationRequestedAt: null,
      cancellationReason: '',
      subscriptionEndDate: organization.subscriptionEndDate,
    });
  }

  // Populate admin for response
  await organization.populate('admin', 'name email role');

  return {
    organization: organization.toObject(),
    subscription: updatedSubscription,
  };
};

/**
 * Schedule individual user subscription cancellation at period end
 * @param {string} userId - User ID
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<Object>} Updated user and subscription
 */
export const scheduleUserCancellation = async (userId, reason = '') => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.stripe_subscription_id) {
    throw new Error('User does not have an active Stripe subscription');
  }

  // Check if already scheduled for cancellation
  if (user.cancel_at_period_end) {
    throw new Error('Cancellation is already scheduled for this user');
  }

  // Schedule cancellation on Stripe
  const updatedSubscription = await scheduleSubscriptionCancellation(user.stripe_subscription_id);

  // Update user with cancellation request
  user.cancel_at_period_end = true;
  user.cancellationRequestedAt = new Date();
  user.cancellationReason = reason || '';
  
  // Update subscription end date from Stripe
  if (updatedSubscription.current_period_end) {
    user.subscriptionEndDate = new Date(updatedSubscription.current_period_end * 1000);
  }

  await user.save();

  return {
    user: user.toObject(),
    subscription: updatedSubscription,
  };
};

/**
 * Undo individual user subscription cancellation (keep subscription active)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user and subscription
 */
export const undoUserCancellation = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.stripe_subscription_id) {
    throw new Error('User does not have an active Stripe subscription');
  }

  // Check if cancellation is scheduled
  if (!user.cancel_at_period_end) {
    throw new Error('No cancellation is scheduled for this user');
  }

  // Undo cancellation on Stripe
  const updatedSubscription = await undoSubscriptionCancellation(user.stripe_subscription_id);

  // Clear cancellation request from user
  user.cancel_at_period_end = false;
  user.cancellationRequestedAt = null;
  user.cancellationReason = '';
  
  // Update subscription end date from Stripe (may be extended)
  if (updatedSubscription.current_period_end) {
    user.subscriptionEndDate = new Date(updatedSubscription.current_period_end * 1000);
  }

  await user.save();

  return {
    user: user.toObject(),
    subscription: updatedSubscription,
  };
};

