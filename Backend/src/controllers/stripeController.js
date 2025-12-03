import Stripe from 'stripe';
import {
  getCheckoutSession,
  getSubscription,
  updateUserSubscription,
  updateOrganizationSubscription,
} from '../services/stripe.service.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

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
        await updateUserSubscription(userId, subscription);
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
        await updateOrganizationSubscription(organizationId, subscription, seats);
        console.log(`✅ Organization subscription activated for org: ${organizationId}`);
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
        await updateUserSubscription(userId, subscription);
        console.log(`✅ Individual subscription updated for user: ${userId}`);
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (organizationId) {
        const seats = parseInt(metadata?.seats || '4', 10);
        await updateOrganizationSubscription(organizationId, subscription, seats);
        console.log(`✅ Organization subscription updated for org: ${organizationId}`);
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
        await updateUserSubscription(userId, subscription);
        console.log(`✅ Invoice payment succeeded for individual user: ${userId}`);
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (organizationId) {
        const seats = parseInt(metadata?.seats || '4', 10);
        await updateOrganizationSubscription(organizationId, subscription, seats);
        console.log(`✅ Invoice payment succeeded for organization: ${organizationId}`);
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
 * GET /api/stripe/verify-session/:sessionId
 */
export async function verifyCheckoutSession(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    const session = await getCheckoutSession(sessionId);

    if (session.payment_status !== 'paid') {
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
      if (userId) {
        const subscriptionId = session.subscription;
        if (subscriptionId) {
          const subscription = await getSubscription(subscriptionId);
          await updateUserSubscription(userId, subscription);

          const user = await User.findById(userId).select('-password');
          result = {
            user: user?.toJSON(),
            accountType: 'individual',
          };
        }
      }
    } else if (accountType === 'organization') {
      const organizationId = metadata?.organizationId;
      if (organizationId) {
        const seats = parseInt(metadata?.seats || '4', 10);
        const subscriptionId = session.subscription;

        if (subscriptionId) {
          const subscription = await getSubscription(subscriptionId);
          await updateOrganizationSubscription(organizationId, subscription, seats);

          const organization = await Organization.findById(organizationId)
            .populate('admin', 'name email');
          result = {
            organization: organization?.toJSON(),
            accountType: 'organization',
          };
        }
      }
    }

    return res.json({
      success: true,
      data: result,
      message: 'Account activated successfully',
    });
  } catch (err) {
    next(err);
  }
}

