# Individual Psychologist Management API - Sample Requests & Responses

## Base URL
```
http://localhost:3000/api/admin/individuals
```

## Authentication
All endpoints require:
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Access**: Only `super_admin` role can access these endpoints

---

## 1. GET All Individual Psychologists

### Endpoint
```
GET /api/admin/individuals
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 5 | Items per page (default: 5) |
| `search` | string | '' | Search by name or email (case-insensitive) |
| `sortBy` | string | 'createdAt' | Field to sort by (name, email, subscriptionStartDate, subscriptionEndDate, createdAt) |
| `sortOrder` | string | 'desc' | Sort order: 'asc' or 'desc' |
| `status` | string | '' | Filter by subscription status: 'active' or 'expired' |
| `isActive` | string | '' | Filter by account status: 'true' or 'false' |

### Sample Request 1: Basic List (Default)
```http
GET /api/admin/individuals HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sample Response 1: Basic List
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
      "subscriptionEndDate": "2025-01-15T00:00:00.000Z",
      "isActive": true,
      "effectiveStatus": "active",
      "isSubscriptionExpired": false,
      "daysRemaining": 45,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Dr. Michael Chen",
      "email": "michael.chen@example.com",
      "subscriptionStartDate": "2024-02-01T00:00:00.000Z",
      "subscriptionEndDate": "2024-12-01T00:00:00.000Z",
      "isActive": true,
      "effectiveStatus": "expired",
      "isSubscriptionExpired": true,
      "daysRemaining": 0,
      "createdAt": "2024-02-01T08:15:00.000Z",
      "updatedAt": "2024-02-01T08:15:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 12,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Sample Request 2: With Search and Pagination
```http
GET /api/admin/individuals?search=sarah&page=1&limit=10&sortBy=name&sortOrder=asc HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sample Response 2: With Search
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
      "subscriptionEndDate": "2025-01-15T00:00:00.000Z",
      "isActive": true,
      "effectiveStatus": "active",
      "isSubscriptionExpired": false,
      "daysRemaining": 45,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Sample Request 3: Filter by Status (Expired)
```http
GET /api/admin/individuals?status=expired&page=1 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sample Response 3: Filter by Expired Status
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Dr. Michael Chen",
      "email": "michael.chen@example.com",
      "subscriptionStartDate": "2024-02-01T00:00:00.000Z",
      "subscriptionEndDate": "2024-12-01T00:00:00.000Z",
      "isActive": true,
      "effectiveStatus": "expired",
      "isSubscriptionExpired": true,
      "daysRemaining": 0,
      "createdAt": "2024-02-01T08:15:00.000Z",
      "updatedAt": "2024-02-01T08:15:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 5,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Sample Request 4: Filter by Active Status
```http
GET /api/admin/individuals?status=active&isActive=true&sortBy=subscriptionEndDate&sortOrder=asc HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. PATCH Deactivate/Reactivate Psychologist Account

### Endpoint
```
PATCH /api/admin/individuals/:id/status
```

### Request Body
```json
{
  "isActive": false
}
```

### Sample Request: Deactivate Account
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011/status HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "isActive": false
}
```

### Sample Response: Deactivate Success
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@example.com",
    "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
    "subscriptionEndDate": "2025-01-15T00:00:00.000Z",
    "isActive": false,
    "effectiveStatus": "active",
    "isSubscriptionExpired": false,
    "daysRemaining": 45,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T14:25:00.000Z"
  },
  "message": "Psychologist account deactivated successfully"
}
```

### Sample Request: Reactivate Account
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011/status HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "isActive": true
}
```

### Sample Response: Reactivate Success
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@example.com",
    "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
    "subscriptionEndDate": "2025-01-15T00:00:00.000Z",
    "isActive": true,
    "effectiveStatus": "active",
    "isSubscriptionExpired": false,
    "daysRemaining": 45,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T14:30:00.000Z"
  },
  "message": "Psychologist account activated successfully"
}
```

### Error Response: Invalid Boolean
```json
{
  "success": false,
  "error": "isActive must be a boolean value (true or false)"
}
```

### Error Response: Not Found
```json
{
  "success": false,
  "error": "Individual psychologist not found"
}
```

---

## 3. PATCH Update Psychologist Account

### Endpoint
```
PATCH /api/admin/individuals/:id
```

### Request Body (All fields are optional - update only what you need)
```json
{
  "subscriptionEndDate": "2025-12-31T23:59:59.000Z",
  "email": "newemail@example.com",
  "name": "Dr. Updated Name",
  "password": "newSecurePassword123",
  "organization": "507f1f77bcf86cd799439020"
}
```

### Sample Request 1: Update Subscription End Date
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "subscriptionEndDate": "2026-12-31T23:59:59.000Z"
}
```

### Sample Response 1: Update Subscription End Date
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@example.com",
    "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
    "subscriptionEndDate": "2026-12-31T23:59:59.000Z",
    "isActive": true,
    "organization": null,
    "effectiveStatus": "active",
    "isSubscriptionExpired": false,
    "daysRemaining": 710,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T15:00:00.000Z"
  },
  "message": "Psychologist updated successfully"
}
```

### Sample Request 2: Update Email and Name
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email": "sarah.johnson.new@example.com",
  "name": "Dr. Sarah Johnson-Smith"
}
```

### Sample Response 2: Update Email and Name
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Johnson-Smith",
    "email": "sarah.johnson.new@example.com",
    "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
    "subscriptionEndDate": "2026-12-31T23:59:59.000Z",
    "isActive": true,
    "organization": null,
    "effectiveStatus": "active",
    "isSubscriptionExpired": false,
    "daysRemaining": 710,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T15:05:00.000Z"
  },
  "message": "Psychologist updated successfully"
}
```

### Sample Request 3: Change Password
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "password": "NewSecurePassword123!"
}
```

### Sample Response 3: Change Password
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Johnson-Smith",
    "email": "sarah.johnson.new@example.com",
    "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
    "subscriptionEndDate": "2026-12-31T23:59:59.000Z",
    "isActive": true,
    "organization": null,
    "effectiveStatus": "active",
    "isSubscriptionExpired": false,
    "daysRemaining": 710,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T15:10:00.000Z"
  },
  "message": "Psychologist updated successfully"
}
```

### Sample Request 4: Add Psychologist to Organization
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "organization": "507f1f77bcf86cd799439020"
}
```

### Sample Response 4: Add to Organization
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Johnson-Smith",
    "email": "sarah.johnson.new@example.com",
    "subscriptionStartDate": "2024-01-15T00:00:00.000Z",
    "subscriptionEndDate": "2026-12-31T23:59:59.000Z",
    "isActive": true,
    "organization": "507f1f77bcf86cd799439020",
    "effectiveStatus": "active",
    "isSubscriptionExpired": false,
    "daysRemaining": 710,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-20T15:15:00.000Z"
  },
  "message": "Psychologist updated successfully"
}
```

**Note**: Once a psychologist is added to an organization, they will no longer appear in the individual psychologists list (since the filter requires `organization: null`).

### Sample Request 5: Remove from Organization (Set organization to null)
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "organization": null
}
```

### Sample Request 6: Multiple Updates at Once
```http
PATCH /api/admin/individuals/507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Dr. Sarah Johnson-Smith",
  "email": "sarah.johnson.new@example.com",
  "subscriptionEndDate": "2026-12-31T23:59:59.000Z",
  "password": "NewSecurePassword123!"
}
```

### Error Response: No Valid Fields Provided
```json
{
  "success": false,
  "error": "At least one of the following fields must be provided: subscriptionEndDate, email, name, password, organization"
}
```

### Error Response: Email Already Exists
```json
{
  "success": false,
  "error": "Email already exists"
}
```

### Error Response: Password Too Short
```json
{
  "success": false,
  "error": "Password must be at least 8 characters long"
}
```

### Error Response: Psychologist Not Found
```json
{
  "success": false,
  "error": "Individual psychologist not found"
}
```

---

## Error Responses (Common)

### 401 Unauthorized - Missing Token
```json
{
  "error": "Access token required"
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden - Not Super Admin
```json
{
  "error": "Super admin access required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Postman Collection Setup

### Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:3000`
- `jwt_token`: Your JWT token (obtained from login)

### Pre-request Script (for all requests)
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('jwt_token')
});
```

### Example Collection URLs
1. **Get All Individuals**: `{{base_url}}/api/admin/individuals`
2. **Get with Search**: `{{base_url}}/api/admin/individuals?search=sarah&page=1&limit=10`
3. **Get Expired**: `{{base_url}}/api/admin/individuals?status=expired`
4. **Deactivate**: `{{base_url}}/api/admin/individuals/:id/status`
5. **Update**: `{{base_url}}/api/admin/individuals/:id`

---

## Notes

1. **Default Limit**: The default limit is always 5 items per page, even if not specified.
2. **Status Logic**: 
   - `effectiveStatus` is computed based on `subscriptionEndDate`
   - If `subscriptionEndDate` is in the past → `effectiveStatus: "expired"`
   - If `subscriptionEndDate` is in the future or null → `effectiveStatus: "active"`
3. **Organization Assignment**: Once a psychologist is assigned to an organization, they will no longer appear in the individual list.
4. **Password Updates**: Password must be at least 8 characters long and will be automatically hashed.
5. **Email Uniqueness**: Email must be unique across all users.
6. **Date Format**: All dates should be in ISO 8601 format (e.g., `2025-12-31T23:59:59.000Z`).

