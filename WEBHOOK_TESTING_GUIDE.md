# Stripe Webhook Testing Guide

## Prerequisites
- ✅ `STRIPE_WEBHOOK_SECRET` is set in your `.env` file
- ✅ Backend server is running on `localhost:3000`
- ✅ Stripe CLI is installed

## Step 1: Start Stripe CLI Listener

Open a terminal and run:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will:
- Forward webhook events to your local server
- Display the webhook signing secret (if you need to update it)
- Show all events in real-time

**Expected Output:**
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

## Step 2: Test Webhook Endpoint (Health Check)

In another terminal, test if the endpoint is accessible:

```bash
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Expected Response:**
- If webhook secret is missing: `500` error
- If signature is invalid: `400` error with "Webhook Error"
- If working: Should return error (expected, since we're not sending a real Stripe event)

## Step 3: Trigger Test Events from Stripe CLI

### Test 1: Checkout Session Completed
```bash
stripe trigger checkout.session.completed
```

**What to check:**
- ✅ Check Stripe CLI terminal - should show event forwarded
- ✅ Check backend logs - should see: `✅ Individual subscription activated` or `✅ Organization subscription activated`
- ✅ Check database - subscription should be `active` and `is_paid = true`

### Test 2: Subscription Created
```bash
stripe trigger customer.subscription.created
```

**What to check:**
- ✅ Backend logs - should see subscription update message
- ✅ Database - subscription fields should be updated

### Test 3: Subscription Updated (Cancellation Scheduled)
```bash
stripe trigger customer.subscription.updated
```

**What to check:**
- ✅ Backend logs - should see: `📋 Processing subscription update`
- ✅ Database - `cancel_at_period_end` should be synced

### Test 4: Subscription Deleted (Cancellation Completed)
```bash
stripe trigger customer.subscription.deleted
```

**What to check:**
- ✅ Backend logs - should see: `🗑️ Processing subscription deletion` and `❌ subscription canceled`
- ✅ Database - `subscription_status = 'canceled'`, `is_paid = false`, cancellation fields cleared

### Test 5: Invoice Payment Succeeded
```bash
stripe trigger invoice.payment_succeeded
```

**What to check:**
- ✅ Backend logs - should see: `✅ Invoice payment succeeded`
- ✅ Database - subscription should remain active

### Test 6: Invoice Payment Failed
```bash
stripe trigger invoice.payment_failed
```

**What to check:**
- ✅ Backend logs - should see: `⚠️ Invoice payment failed`
- ✅ Database - `subscription_status = 'past_due'`, `is_paid = false`

## Step 4: Test with Real Subscription (Recommended)

### Option A: Use Existing Test Subscription

1. Find a test subscription ID from your Stripe Dashboard (test mode)
2. Update it via Stripe API to trigger webhook:

```bash
# Schedule cancellation
stripe subscriptions update sub_xxxxx --cancel-at-period-end

# This will trigger customer.subscription.updated webhook
# Check your backend logs and database
```

### Option B: Create Complete Flow

1. **Create a test checkout session** (via your registration flow)
2. **Complete payment** with test card: `4242 4242 4242 4242`
3. **Check webhook logs** - should see `checkout.session.completed`
4. **Schedule cancellation** via Stripe Dashboard or API
5. **Check webhook logs** - should see `customer.subscription.updated` with `cancel_at_period_end: true`
6. **Wait for period end** or manually cancel to test `customer.subscription.deleted`

## Step 5: Monitor Backend Logs

Watch your backend console for these log messages:

### Success Indicators:
- `✅ Individual subscription activated for user: ...`
- `✅ Organization subscription activated for org: ...`
- `📋 Processing subscription update: ...`
- `⚠️ Organization subscription scheduled for cancellation at period end`
- `❌ Organization subscription canceled for org: ...`
- `✅ Admin user subscription synced from organization`

### Error Indicators:
- `⚠️ Webhook signature verification failed`
- `❌ Error handling webhook: ...`
- `⚠️ User ID not found in checkout session metadata`

## Step 6: Verify Database Updates

After each test event, check your database:

### For Individual Users:
```javascript
// Check User collection
{
  subscription_status: 'active' | 'canceled' | 'past_due',
  is_paid: true | false,
  cancel_at_period_end: true | false,
  cancellationRequestedAt: Date | null,
  stripe_subscription_id: 'sub_xxxxx'
}
```

### For Organizations:
```javascript
// Check Organization collection
{
  subscription_status: 'active' | 'canceled' | 'past_due',
  is_paid: true | false,
  cancel_at_period_end: true | false,
  cancellationRequestedAt: Date | null,
  stripe_subscription_id: 'sub_xxxxx'
}
```

## Common Issues & Solutions

### Issue 1: "Webhook signature verification failed"
**Solution:** 
- Make sure `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen`
- Restart your backend server after updating `.env`

### Issue 2: "No metadata found"
**Solution:**
- Test events from Stripe CLI don't have metadata by default
- Use real subscriptions created through your app (they have metadata)
- Or manually add metadata when triggering events

### Issue 3: Webhook not receiving events
**Solution:**
- Check if Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Verify backend is running on port 3000
- Check firewall/network settings
- Verify route is `/api/stripe/webhook` (check `stripe.routes.js`)

### Issue 4: Events received but not processed
**Solution:**
- Check backend logs for errors
- Verify event types match your switch cases
- Check if metadata exists (test events might not have it)

## Quick Test Script

Save this as `test-webhook.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Stripe Webhooks..."
echo ""

echo "1️⃣ Testing checkout.session.completed..."
stripe trigger checkout.session.completed
sleep 2

echo ""
echo "2️⃣ Testing customer.subscription.updated..."
stripe trigger customer.subscription.updated
sleep 2

echo ""
echo "3️⃣ Testing customer.subscription.deleted..."
stripe trigger customer.subscription.deleted
sleep 2

echo ""
echo "4️⃣ Testing invoice.payment_succeeded..."
stripe trigger invoice.payment_succeeded
sleep 2

echo ""
echo "5️⃣ Testing invoice.payment_failed..."
stripe trigger invoice.payment_failed

echo ""
echo "✅ All test events sent! Check your backend logs."
```

Run with: `chmod +x test-webhook.sh && ./test-webhook.sh`

## Next Steps

Once webhooks are working:
1. ✅ Test cancellation scheduling (will be in next step)
2. ✅ Test cancellation undo (will be in next step)
3. ✅ Test automatic cancellation at period end
4. ✅ Monitor production webhooks in Stripe Dashboard

