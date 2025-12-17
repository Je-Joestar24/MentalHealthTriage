import Stripe from 'stripe';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

// Initialize Stripe with secret key
// Using latest stable API version - Stripe will use the account's default if not specified
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia', // Update this to match your Stripe account's API version
});

/**
 * Create a Stripe customer
 * @param {Object} customerData - Customer data
 * @param {string} customerData.email - Customer email
 * @param {string} customerData.name - Customer name
 * @returns {Promise<Stripe.Customer>}
 */
export const createStripeCustomer = async ({ email, name }) => {
  try {
    const customer = await stripe.customers.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error(`Failed to create Stripe customer: ${error.message}`);
  }
};

/**
 * Create a Stripe checkout session for individual account
 * @param {Object} params - Checkout session parameters
 * @param {string} params.customerId - Stripe customer ID
 * @param {string} params.userId - User ID (for metadata)
 * @param {string} params.successUrl - Success redirect URL
 * @param {string} params.cancelUrl - Cancel redirect URL
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export const createIndividualCheckoutSession = async ({
  customerId,
  userId,
  successUrl,
  cancelUrl,
}) => {
  try {
    const priceId = process.env.INDIVIDUAL_MONTH_PLAN_PRICE_ID;
    if (!priceId) {
      throw new Error('INDIVIDUAL_MONTH_PLAN_PRICE_ID is not configured');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        accountType: 'individual',
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          accountType: 'individual',
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating individual checkout session:', error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

/**
 * Create a Stripe checkout session for organization account
 * @param {Object} params - Checkout session parameters
 * @param {string} params.customerId - Stripe customer ID
 * @param {string} params.organizationId - Organization ID (for metadata)
 * @param {number} params.seats - Number of psychologist seats (minimum 4)
 * @param {string} params.successUrl - Success redirect URL
 * @param {string} params.cancelUrl - Cancel redirect URL
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export const createOrganizationCheckoutSession = async ({
  customerId,
  organizationId,
  seats,
  successUrl,
  cancelUrl,
}) => {
  try {
    // Validate minimum seats
    const seatCount = Math.max(4, parseInt(seats, 10) || 4);

    const priceId = process.env.ORGANIZATION_MONTH_PLAN_PRICE_ID;
    if (!priceId) {
      throw new Error('ORGANIZATION_MONTH_PLAN_PRICE_ID is not configured');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: seatCount, // Quantity = number of seats
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId: organizationId.toString(),
        accountType: 'organization',
        seats: seatCount.toString(),
      },
      subscription_data: {
        metadata: {
          organizationId: organizationId.toString(),
          accountType: 'organization',
          seats: seatCount.toString(),
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating organization checkout session:', error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

/**
 * Retrieve a Stripe checkout session
 * @param {string} sessionId - Checkout session ID
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export const getCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw new Error(`Failed to retrieve checkout session: ${error.message}`);
  }
};

/**
 * Retrieve a Stripe subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Stripe.Subscription>}
 */
export const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error(`Failed to retrieve subscription: ${error.message}`);
  }
};

/**
 * Update subscription item quantity (e.g., add seats) with proration so billing date stays the same.
 * Returns the refreshed subscription.
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {number} quantity - New total quantity (e.g., total seats)
 * @returns {Promise<Stripe.Subscription>}
 */
export const updateSubscriptionQuantity = async (subscriptionId, quantity) => {
  try {
    if (!subscriptionId) throw new Error('Subscription ID is required');
    if (!quantity || quantity < 1) throw new Error('Quantity must be at least 1');

    // Fetch subscription to locate the item to update
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItem = subscription.items?.data?.[0];

    if (!subscriptionItem?.id) {
      throw new Error('Subscription item not found for this subscription');
    }

    // Update quantity with proration; Stripe will invoice prorated amount immediately
    await stripe.subscriptionItems.update(subscriptionItem.id, {
      quantity,
      proration_behavior: 'always_invoice',
    });

    // Return refreshed subscription reflecting the new quantity
    const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription quantity:', error);
    throw new Error(`Failed to update subscription quantity: ${error.message}`);
  }
};

/**
 * Update user with Stripe customer ID
 * @param {string} userId - User ID
 * @param {string} customerId - Stripe customer ID
 */
export const updateUserStripeCustomer = async (userId, customerId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      stripe_customer_id: customerId,
    });
  } catch (error) {
    console.error('Error updating user Stripe customer ID:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

/**
 * Update organization with Stripe customer ID
 * @param {string} organizationId - Organization ID
 * @param {string} customerId - Stripe customer ID
 */
export const updateOrganizationStripeCustomer = async (organizationId, customerId) => {
  try {
    await Organization.findByIdAndUpdate(organizationId, {
      stripe_customer_id: customerId,
    });
  } catch (error) {
    console.error('Error updating organization Stripe customer ID:', error);
    throw new Error(`Failed to update organization: ${error.message}`);
  }
};

/**
 * Update user subscription details after successful payment
 * @param {string} userId - User ID
 * @param {Object} subscriptionData - Subscription data from Stripe
 * @param {boolean} forceActive - Force subscription to active status (e.g., when payment is confirmed)
 */
export const updateUserSubscription = async (userId, subscriptionData, forceActive = false) => {
  try {
    // Determine subscription status
    // If forceActive is true or subscription is active/trialing, set to active
    // Otherwise use the subscription status from Stripe
    let subscriptionStatus = subscriptionData.status;
    if (forceActive || subscriptionData.status === 'active' || subscriptionData.status === 'trialing') {
      subscriptionStatus = 'active';
    } else if (subscriptionData.status === 'incomplete' && forceActive) {
      // If payment is confirmed but subscription is incomplete, set to active
      subscriptionStatus = 'active';
    }

    const updateData = {
      stripe_subscription_id: subscriptionData.id,
      subscription_status: subscriptionStatus,
      is_paid: subscriptionStatus === 'active',
      // Sync cancellation status from Stripe
      cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
    };

    // If subscription is canceled, clear cancellation request fields
    if (subscriptionStatus === 'canceled') {
      updateData.cancel_at_period_end = false;
      updateData.cancellationRequestedAt = null;
      updateData.cancellationReason = '';
    }

    if (subscriptionData.current_period_start) {
      updateData.subscriptionStartDate = new Date(subscriptionData.current_period_start * 1000);
    }

    if (subscriptionData.current_period_end) {
      // Reuse existing subscriptionEndDate field
      updateData.subscriptionEndDate = new Date(subscriptionData.current_period_end * 1000);
    }

    await User.findByIdAndUpdate(userId, updateData);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw new Error(`Failed to update user subscription: ${error.message}`);
  }
};

/**
 * Update organization subscription details after successful payment
 * @param {string} organizationId - Organization ID
 * @param {Object} subscriptionData - Subscription data from Stripe
 * @param {number} seats - Number of seats from subscription metadata
 * @param {boolean} forceActive - Force subscription to active status (e.g., when payment is confirmed)
 */
export const updateOrganizationSubscription = async (organizationId, subscriptionData, seats = null, forceActive = false) => {
  try {
    // Determine subscription status
    // If forceActive is true or subscription is active/trialing, set to active
    // Otherwise use the subscription status from Stripe
    let subscriptionStatus = subscriptionData.status;
    if (forceActive || subscriptionData.status === 'active' || subscriptionData.status === 'trialing') {
      subscriptionStatus = 'active';
    } else if (subscriptionData.status === 'incomplete' && forceActive) {
      // If payment is confirmed but subscription is incomplete, set to active
      subscriptionStatus = 'active';
    }

    const updateData = {
      stripe_subscription_id: subscriptionData.id,
      subscription_status: subscriptionStatus,
      is_paid: subscriptionStatus === 'active',
      // Sync cancellation status from Stripe
      cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
    };

    // If subscription is canceled, clear cancellation request fields
    if (subscriptionStatus === 'canceled') {
      updateData.cancel_at_period_end = false;
      updateData.cancellationRequestedAt = null;
      updateData.cancellationReason = '';
    }

    if (subscriptionData.current_period_start) {
      updateData.subscriptionStartDate = new Date(subscriptionData.current_period_start * 1000);
    }

    if (subscriptionData.current_period_end) {
      // Reuse existing subscriptionEndDate field
      updateData.subscriptionEndDate = new Date(subscriptionData.current_period_end * 1000);
    }

    // Update seats if provided
    if (seats !== null) {
      updateData.psychologistSeats = Math.max(4, parseInt(seats, 10));
      updateData.seats_limit = Math.max(4, parseInt(seats, 10));
    }

    await Organization.findByIdAndUpdate(organizationId, updateData);
  } catch (error) {
    console.error('Error updating organization subscription:', error);
    throw new Error(`Failed to update organization subscription: ${error.message}`);
  }
};

/**
 * Schedule subscription cancellation at period end
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Stripe.Subscription>} Updated subscription
 */
export const scheduleSubscriptionCancellation = async (subscriptionId) => {
  try {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    // Update Stripe subscription to cancel at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(`✅ Subscription ${subscriptionId} scheduled for cancellation at period end`);
    return subscription;
  } catch (error) {
    console.error('Error scheduling subscription cancellation:', error);
    throw new Error(`Failed to schedule cancellation: ${error.message}`);
  }
};

/**
 * Undo scheduled subscription cancellation (keep subscription active)
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Stripe.Subscription>} Updated subscription
 */
export const undoSubscriptionCancellation = async (subscriptionId) => {
  try {
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    // Update Stripe subscription to NOT cancel at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    console.log(`✅ Subscription ${subscriptionId} cancellation undone - will continue after period end`);
    return subscription;
  } catch (error) {
    console.error('Error undoing subscription cancellation:', error);
    throw new Error(`Failed to undo cancellation: ${error.message}`);
  }
};

export default stripe;

