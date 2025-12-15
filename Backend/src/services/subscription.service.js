import Organization from '../models/Organization.js';
import { getSubscription, updateSubscriptionQuantity } from './stripe.service.js';

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

