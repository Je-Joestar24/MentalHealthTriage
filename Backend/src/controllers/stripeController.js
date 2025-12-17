import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import {
  getCheckoutSession,
  getSubscription,
  updateUserSubscription,
  updateOrganizationSubscription,
} from '../services/stripe.service.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * Handle Stripe webhook events
 * POST /api/stripe/webhook
 */
export async function handleStripeWebhook(req, res, next) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (err) {
    console.error('❌ Error handling webhook:', err);
    next(err);
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    const { metadata } = session;
    const accountType = metadata?.accountType;

    if (accountType === 'individual') {
      const userId = metadata?.userId;
      if (!userId) {
        console.error('⚠️ User ID not found in checkout session metadata');
        return;
      }

      // Retrieve the subscription
      const subscriptionId = session.subscription;
      if (subscriptionId) {
        const subscription = await getSubscription(subscriptionId);
        // Force active status if payment is completed
        const forceActive = session.payment_status === 'paid';
        await updateUserSubscription(userId, subscription, forceActive);
        console.log(`✅ Individual subscription activated for user: ${userId}`);
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (!organizationId) {
        console.error('⚠️ Organization ID not found in checkout session metadata');
        return;
      }

      const seats = parseInt(metadata?.seats || '4', 10);
      const subscriptionId = session.subscription;

      if (subscriptionId) {
        const subscription = await getSubscription(subscriptionId);
        // Force active status if payment is completed
        const forceActive = session.payment_status === 'paid';
        await updateOrganizationSubscription(organizationId, subscription, seats, forceActive);
        console.log(`✅ Organization subscription activated for org: ${organizationId}`);
        
        // Sync admin user subscription fields from organization
        const organization = await Organization.findById(organizationId);
        if (organization && organization.admin) {
          await User.findByIdAndUpdate(organization.admin, {
            subscription_status: organization.subscription_status,
            is_paid: organization.is_paid,
            stripe_subscription_id: organization.stripe_subscription_id,
            subscriptionStartDate: organization.subscriptionStartDate,
            subscriptionEndDate: organization.subscriptionEndDate,
          });
          console.log(`✅ Admin user subscription synced from organization`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling checkout session completed:', error);
    throw error;
  }
}

/**
 * Handle subscription created/updated events
 */
async function handleSubscriptionUpdate(subscription) {
  try {
    const { metadata } = subscription;
    const accountType = metadata?.accountType;

    if (accountType === 'individual') {
      const userId = metadata?.userId;
      if (userId) {
        // Force active if subscription status is active or trialing
        const forceActive = subscription.status === 'active' || subscription.status === 'trialing';
        await updateUserSubscription(userId, subscription, forceActive);
        console.log(`✅ Individual subscription updated for user: ${userId}`);
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (organizationId) {
        const seats = parseInt(metadata?.seats || '4', 10);
        // Force active if subscription status is active or trialing
        const forceActive = subscription.status === 'active' || subscription.status === 'trialing';
        await updateOrganizationSubscription(organizationId, subscription, seats, forceActive);
        console.log(`✅ Organization subscription updated for org: ${organizationId}`);
        
        // Sync admin user subscription fields from organization
        const organization = await Organization.findById(organizationId);
        if (organization && organization.admin) {
          await User.findByIdAndUpdate(organization.admin, {
            subscription_status: organization.subscription_status,
            is_paid: organization.is_paid,
            stripe_subscription_id: organization.stripe_subscription_id,
            subscriptionStartDate: organization.subscriptionStartDate,
            subscriptionEndDate: organization.subscriptionEndDate,
          });
          console.log(`✅ Admin user subscription synced from organization`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
    throw error;
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    const { metadata } = subscription;
    const accountType = metadata?.accountType;

    if (accountType === 'individual') {
      const userId = metadata?.userId;
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          subscription_status: 'canceled',
          is_paid: false,
        });
        console.log(`✅ Individual subscription canceled for user: ${userId}`);
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (organizationId) {
        await Organization.findByIdAndUpdate(organizationId, {
          subscription_status: 'canceled',
          is_paid: false,
        });
        console.log(`✅ Organization subscription canceled for org: ${organizationId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await getSubscription(subscriptionId);
    const { metadata } = subscription;
    const accountType = metadata?.accountType;

    if (accountType === 'individual') {
      const userId = metadata?.userId;
      if (userId) {
        // Force active status since invoice payment succeeded
        await updateUserSubscription(userId, subscription, true);
        console.log(`✅ Invoice payment succeeded for individual user: ${userId}`);
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (organizationId) {
        const seats = parseInt(metadata?.seats || '4', 10);
        // Force active status since invoice payment succeeded
        await updateOrganizationSubscription(organizationId, subscription, seats, true);
        console.log(`✅ Invoice payment succeeded for organization: ${organizationId}`);
        
        // Sync admin user subscription fields from organization
        const organization = await Organization.findById(organizationId);
        if (organization && organization.admin) {
          await User.findByIdAndUpdate(organization.admin, {
            subscription_status: organization.subscription_status,
            is_paid: organization.is_paid,
            stripe_subscription_id: organization.stripe_subscription_id,
            subscriptionStartDate: organization.subscriptionStartDate,
            subscriptionEndDate: organization.subscriptionEndDate,
          });
          console.log(`✅ Admin user subscription synced from organization`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling invoice payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await getSubscription(subscriptionId);
    const { metadata } = subscription;
    const accountType = metadata?.accountType;

    if (accountType === 'individual') {
      const userId = metadata?.userId;
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          subscription_status: 'past_due',
          is_paid: false,
        });
        console.log(`⚠️ Invoice payment failed for individual user: ${userId}`);
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (organizationId) {
        await Organization.findByIdAndUpdate(organizationId, {
          subscription_status: 'past_due',
          is_paid: false,
        });
        console.log(`⚠️ Invoice payment failed for organization: ${organizationId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling invoice payment failed:', error);
    throw error;
  }
}

/**
 * Verify checkout session and activate account
 * THIS ENDPOINT IS CRITICAL - It updates subscription_status to 'active' and is_paid to true
 * GET /api/stripe/verify-session/:sessionId
 * 
 * This must be called after successful Stripe payment redirect to:
 * 1. Verify payment was successful
 * 2. Update user/organization subscription status to 'active'
 * 3. Set is_paid flag to true
 * 4. Set subscription dates
 */
export async function verifyCheckoutSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    console.log('🔍 verifyCheckoutSession called with sessionId:', sessionId);

    if (!sessionId) {
      console.error('❌ Session ID is missing');
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    console.log('📋 Retrieving checkout session from Stripe...');
    const session = await getCheckoutSession(sessionId);
    console.log('📋 Session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      subscription: session.subscription,
      metadata: session.metadata,
    });

    if (session.payment_status !== 'paid') {
      console.error('❌ Payment not completed. Status:', session.payment_status);
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
        payment_status: session.payment_status,
      });
    }

    const { metadata } = session;
    const accountType = metadata?.accountType;

    let result = {};

    if (accountType === 'individual') {
      const userId = metadata?.userId;
      console.log('👤 Processing individual account for userId:', userId);
      if (userId) {
        const subscriptionId = session.subscription;
        if (subscriptionId) {
          console.log('📋 Retrieving subscription:', subscriptionId);
          const subscription = await getSubscription(subscriptionId);
          console.log('✅ Subscription retrieved, updating user with forceActive=true');
          // Force active status since payment_status is 'paid'
          await updateUserSubscription(userId, subscription, true);
          console.log('✅ User subscription updated to active');

          const user = await User.findById(userId).select('-password').populate('organization', 'name');
          // Generate login token since payment is verified
          const token = generateToken({ sub: user.id, role: user.role });
          result = {
            user: user?.toJSON(),
            accountType: 'individual',
            token, // Include token for auto-login
          };
          console.log('✅ Individual account activated successfully with token');
        } else {
          console.error('❌ No subscription ID found in session');
        }
      } else {
        console.error('❌ No userId found in metadata');
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      console.log('🏢 Processing organization account for organizationId:', organizationId);
      if (organizationId) {
        const seats = parseInt(metadata?.seats || '4', 10);
        const subscriptionId = session.subscription;

        if (subscriptionId) {
          console.log('📋 Retrieving subscription:', subscriptionId);
          const subscription = await getSubscription(subscriptionId);
          console.log('✅ Subscription retrieved, updating organization with forceActive=true');
          // Force active status since payment_status is 'paid'
          await updateOrganizationSubscription(organizationId, subscription, seats, true);
          console.log('✅ Organization subscription updated to active');

          const organization = await Organization.findById(organizationId)
            .populate('admin', 'name email');
          
          if (!organization || !organization.admin) {
            console.error('❌ Organization or admin not found');
            throw new Error('Organization or admin not found');
          }
          
          // Get admin user for token generation (admin is already populated)
          const adminId = organization.admin._id || organization.admin;
          const adminUser = await User.findById(adminId)
            .select('-password')
            .populate('organization', 'name');
          
          if (!adminUser) {
            console.error('❌ Admin user not found');
            throw new Error('Admin user not found');
          }
          
          // Sync admin user subscription fields from organization (for consistency)
          // Organization subscription is the source of truth, but we sync user fields too
          await User.findByIdAndUpdate(adminId, {
            subscription_status: organization.subscription_status,
            is_paid: organization.is_paid,
            stripe_subscription_id: organization.stripe_subscription_id,
            subscriptionStartDate: organization.subscriptionStartDate,
            subscriptionEndDate: organization.subscriptionEndDate,
          });
          console.log('✅ Admin user subscription fields synced from organization');
          
          // Refresh admin user to get updated data
          const updatedAdminUser = await User.findById(adminId)
            .select('-password')
            .populate({
              path: 'organization',
              select: 'name subscription_status is_paid stripe_subscription_id subscriptionStartDate subscriptionEndDate psychologistSeats seats_limit'
            });
          
          // Generate login token since payment is verified
          const token = generateToken({ sub: updatedAdminUser.id, role: updatedAdminUser.role });
          
          const adminJson = updatedAdminUser.toJSON();
          // Add effective subscription status (from organization)
          adminJson.effectiveSubscriptionStatus = organization.subscription_status;
          adminJson.effectiveIsPaid = organization.is_paid;
          
          result = {
            organization: organization?.toJSON(),
            user: adminJson, // Include admin user for frontend
            accountType: 'organization',
            token, // Include token for auto-login
          };
          console.log('✅ Organization account activated successfully with token');
        } else {
          console.error('❌ No subscription ID found in session');
        }
      } else {
        console.error('❌ No organizationId found in metadata');
      }
    } else {
      console.error('❌ Unknown account type:', accountType);
    }

    console.log('✅ Returning success response');
    return res.json({
      success: true,
      data: result,
      message: 'Account activated successfully',
    });
  } catch (err) {
    next(err);
  }
}

