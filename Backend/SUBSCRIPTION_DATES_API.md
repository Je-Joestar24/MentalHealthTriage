# Subscription Dates API Documentation

This document describes the enhanced subscription management features with start and end dates for both Organizations and Users.

## Overview

The system now supports subscription periods with start and end dates for both organizations and individual users. This allows for:

- **Time-based subscription management**
- **Automatic expiration detection**
- **Subscription renewal and extension**
- **Flexible subscription periods**

## Models Updated

### Organization Model

#### New Fields
- `subscriptionStartDate` (Date): When the subscription started (defaults to current date)
- `subscriptionEndDate` (Date): When the subscription expires (required)

#### Virtual Fields
- `isSubscriptionExpired` (Boolean): Automatically calculated based on current date vs end date
- `daysRemaining` (Number): Days remaining until subscription expires

### User Model

#### New Fields
- `subscriptionStartDate` (Date): When the user's subscription started (defaults to current date)
- `subscriptionEndDate` (Date): When the user's subscription expires (optional)

#### Virtual Fields
- `isSubscriptionExpired` (Boolean): Automatically calculated based on current date vs end date
- `daysRemaining` (Number): Days remaining until subscription expires
- `hasActiveSubscription` (Boolean): True if no end date or subscription is still active

## New API Endpoints

### 1. Extend Organization Subscription
**POST** `/api/admin/organizations/:id/extend`

Extends an organization's subscription to a new end date.

#### Request Body
```json
{
  "subscriptionEndDate": "2024-12-31T23:59:59.000Z"
}
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Mental Health Clinic",
    "subscriptionStatus": "active",
    "subscriptionStartDate": "2024-01-15T10:30:00.000Z",
    "subscriptionEndDate": "2024-12-31T23:59:59.000Z",
    "isSubscriptionExpired": false,
    "daysRemaining": 350,
    "admin": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Dr. John Doe",
      "email": "john@clinic.com",
      "role": "company_admin"
    }
  },
  "message": "Subscription extended successfully"
}
```

### 2. Check and Update Expired Subscriptions
**POST** `/api/admin/organizations/check-expired`

Automatically finds and updates organizations with expired subscriptions.

#### Example Response
```json
{
  "success": true,
  "data": {
    "updatedCount": 3,
    "expiredOrganizations": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Expired Clinic 1",
        "subscriptionEndDate": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Expired Clinic 2",
        "subscriptionEndDate": "2024-01-02T00:00:00.000Z"
      }
    ]
  },
  "message": "Checked and updated 3 expired subscriptions"
}
```

## Updated Endpoints

### Update Organization Status (Enhanced)
**PATCH** `/api/admin/organizations/:id/status`

Now supports updating subscription dates when changing status to active.

#### Request Body
```json
{
  "subscriptionStatus": "active",
  "subscriptionEndDate": "2024-12-31T23:59:59.000Z"
}
```

### Get Organization Stats (Enhanced)
**GET** `/api/admin/organizations/:id/stats`

Now includes subscription date information.

#### Example Response
```json
{
  "success": true,
  "data": {
    "organizationId": "507f1f77bcf86cd799439011",
    "name": "Mental Health Clinic",
    "subscriptionStatus": "active",
    "subscriptionStartDate": "2024-01-15T10:30:00.000Z",
    "subscriptionEndDate": "2024-12-31T23:59:59.000Z",
    "isSubscriptionExpired": false,
    "daysRemaining": 350,
    "stats": {
      "psychologists": 5,
      "patients": 150,
      "diagnoses": 25
    }
  }
}
```

## Subscription Middleware

### 1. requireActiveSubscription
Checks if an organization has an active, non-expired subscription.

```javascript
import { requireActiveSubscription } from '../middleware/subscription.middleware.js';

// Apply to routes that require active organization subscription
router.get('/protected-route', requireActiveSubscription, controllerFunction);
```

### 2. requireUserActiveSubscription
Checks if a user has an active, non-expired subscription.

```javascript
import { requireUserActiveSubscription } from '../middleware/subscription.middleware.js';

// Apply to routes that require active user subscription
router.get('/user-route', requireUserActiveSubscription, controllerFunction);
```

### 3. addSubscriptionInfo
Adds subscription information to response locals for use in templates or responses.

```javascript
import { addSubscriptionInfo } from '../middleware/subscription.middleware.js';

// Add subscription info to all responses
router.use(addSubscriptionInfo);
```

## Usage Examples

### Creating an Organization with Subscription Dates
```javascript
const organizationData = {
  name: "New Mental Health Clinic",
  admin: "507f1f77bcf86cd799439012",
  subscriptionStatus: "active",
  subscriptionEndDate: "2024-12-31T23:59:59.000Z"
};

const organization = await Organization.create(organizationData);
```

### Checking Subscription Status
```javascript
const organization = await Organization.findById(orgId);

if (organization.isSubscriptionExpired) {
  console.log("Subscription expired");
} else {
  console.log(`Days remaining: ${organization.daysRemaining}`);
}
```

### Automatic Expiration Check (Cron Job)
```javascript
// Run this periodically to update expired subscriptions
import { checkAndUpdateExpiredSubscriptions } from '../services/organization.service.js';

const result = await checkAndUpdateExpiredSubscriptions();
console.log(`Updated ${result.updatedCount} expired subscriptions`);
```

## Error Responses

### Subscription Expired
```json
{
  "success": false,
  "error": "Organization subscription has expired",
  "data": {
    "subscriptionStatus": "expired",
    "subscriptionEndDate": "2024-01-01T00:00:00.000Z",
    "daysRemaining": 0
  }
}
```

### Subscription Inactive
```json
{
  "success": false,
  "error": "Organization subscription is inactive",
  "data": {
    "subscriptionStatus": "inactive",
    "subscriptionEndDate": "2024-12-31T23:59:59.000Z"
  }
}
```

## Best Practices

1. **Regular Expiration Checks**: Set up a cron job to run `checkAndUpdateExpiredSubscriptions()` daily
2. **Grace Periods**: Consider implementing grace periods before marking subscriptions as expired
3. **Notifications**: Send notifications to users before subscriptions expire
4. **Validation**: Always validate subscription dates are in the future when creating/updating
5. **Middleware Usage**: Apply subscription middleware to protect sensitive routes

## Migration Notes

- Existing organizations will have `subscriptionStartDate` set to their creation date
- `subscriptionEndDate` is required for new organizations
- Existing users will have `subscriptionStartDate` set to their creation date
- `subscriptionEndDate` is optional for users (null means unlimited access)
