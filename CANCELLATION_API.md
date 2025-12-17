# Subscription Cancellation API Documentation

## Overview

The cancellation system allows users to schedule subscription cancellations that take effect at the end of the current billing period. Users can also undo scheduled cancellations before the period ends.

**Key Features:**
- ✅ Cancellation scheduled at period end (not immediate)
- ✅ Users can undo cancellation before period ends
- ✅ Automatic cancellation via Stripe webhooks when period ends
- ✅ Authorization checks (users can only cancel their own subscriptions)
- ✅ Syncs with Stripe automatically via webhooks

## How It Works

### Flow Diagram

```
1. User clicks "Cancel Subscription"
   ↓
2. Backend calls Stripe API: cancel_at_period_end = true
   ↓
3. Stripe sends webhook: customer.subscription.updated
   ↓
4. Webhook handler syncs cancel_at_period_end to database
   ↓
5. Subscription remains ACTIVE until period end
   ↓
6. Period ends → Stripe automatically cancels
   ↓
7. Stripe sends webhook: customer.subscription.deleted
   ↓
8. Webhook handler sets subscription_status = 'canceled'
```

## API Endpoints

### Organization Subscription Cancellation

#### Schedule Cancellation
```
POST /api/subscription/organizations/:organizationId/cancel-at-period-end
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "reason": "Optional cancellation reason"
}

Response:
{
  "success": true,
  "data": {
    "organization": { ... },
    "subscription": { ... }
  },
  "message": "Cancellation scheduled successfully..."
}
```

**Authorization:** Only organization admin or super_admin

#### Undo Cancellation
```
POST /api/subscription/organizations/:organizationId/undo-cancel
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "organization": { ... },
    "subscription": { ... }
  },
  "message": "Cancellation undone successfully..."
}
```

**Authorization:** Only organization admin or super_admin

### Individual User Subscription Cancellation

#### Schedule Cancellation
```
POST /api/subscription/users/:userId/cancel-at-period-end
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "reason": "Optional cancellation reason"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "subscription": { ... }
  },
  "message": "Cancellation scheduled successfully..."
}
```

**Authorization:** User can only cancel their own subscription (or super_admin)

#### Undo Cancellation
```
POST /api/subscription/users/:userId/undo-cancel
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "subscription": { ... }
  },
  "message": "Cancellation undone successfully..."
}
```

**Authorization:** User can only undo their own cancellation (or super_admin)

## Database Fields

### User Model
```javascript
{
  cancel_at_period_end: Boolean,        // true = scheduled for cancellation
  cancellationRequestedAt: Date | null, // When cancellation was requested
  cancellationReason: String,           // Optional reason
  subscription_status: String,          // 'active' until period ends, then 'canceled'
  is_paid: Boolean                     // true until period ends
}
```

### Organization Model
```javascript
{
  cancel_at_period_end: Boolean,        // true = scheduled for cancellation
  cancellationRequestedAt: Date | null, // When cancellation was requested
  cancellationReason: String,           // Optional reason
  subscription_status: String,          // 'active' until period ends, then 'canceled'
  is_paid: Boolean                     // true until period ends
}
```

## Webhook Events Handled

### `customer.subscription.updated`
- **Triggered when:** `cancel_at_period_end` changes
- **Action:** Syncs `cancel_at_period_end` status to database
- **Status:** Subscription remains `active` until period ends

### `customer.subscription.deleted`
- **Triggered when:** Period ends with `cancel_at_period_end = true`
- **Action:** Sets `subscription_status = 'canceled'`, `is_paid = false`
- **Status:** Subscription is now fully canceled

## Testing

### Test Schedule Cancellation
```bash
# For organization
curl -X POST http://localhost:3000/api/subscription/organizations/ORG_ID/cancel-at-period-end \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Testing cancellation"}'

# For individual user
curl -X POST http://localhost:3000/api/subscription/users/USER_ID/cancel-at-period-end \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Testing cancellation"}'
```

### Test Undo Cancellation
```bash
# For organization
curl -X POST http://localhost:3000/api/subscription/organizations/ORG_ID/undo-cancel \
  -H "Authorization: Bearer YOUR_TOKEN"

# For individual user
curl -X POST http://localhost:3000/api/subscription/users/USER_ID/undo-cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Webhook
1. Schedule cancellation via API
2. Check Stripe CLI or Dashboard - should see `customer.subscription.updated` event
3. Check database - `cancel_at_period_end` should be `true`
4. Undo cancellation via API
5. Check database - `cancel_at_period_end` should be `false`

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Cancellation is already scheduled for this organization"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Only the organization admin can cancel this subscription"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Organization not found"
}
```

## Important Notes

1. **No Immediate Cancellation:** Cancellations always take effect at period end
2. **Webhook Dependency:** Status syncs automatically via webhooks (no manual refresh needed)
3. **Authorization:** Users can only manage their own subscriptions
4. **Stripe is Source of Truth:** Database syncs from Stripe webhooks
5. **Period End Date:** Updated automatically from Stripe subscription data

## Next Steps (Frontend)

1. Create UI to show cancellation status
2. Add "Cancel Subscription" button (calls schedule endpoint)
3. Add "Keep Subscription" button if `cancel_at_period_end = true` (calls undo endpoint)
4. Display cancellation date and remaining days
5. Show message when subscription is canceled

