# Psychologists API Testing Guide

## Endpoint
**GET** `http://localhost:3000/api/company/psychologists`

**Authentication Required:** Bearer token (super_admin or company_admin role)

---

## 1. Basic Request (No Parameters)
```
GET /api/company/psychologists
Authorization: Bearer <your_token>
```

**Response:** Returns first 10 psychologists, sorted by createdAt (descending)

---

## 2. Pagination Testing

### Test Page 1 (Default)
```
GET /api/company/psychologists?page=1&limit=10
```

### Test Page 2
```
GET /api/company/psychologists?page=2&limit=10
```

### Test Different Page Sizes
```
GET /api/company/psychologists?page=1&limit=5
GET /api/company/psychologists?page=1&limit=20
```

**Expected:** 
- `pagination.currentPage` matches the requested page
- `pagination.itemsPerPage` matches the limit
- `pagination.totalPages` calculated correctly
- `pagination.hasNextPage` and `pagination.hasPrevPage` set correctly

---

## 3. Search Testing

### Search by Name
```
GET /api/company/psychologists?search=Tony
GET /api/company/psychologists?search=Jejomar
GET /api/company/psychologists?search=stark
```

### Search by Email
```
GET /api/company/psychologists?search=jejomarparrilla@gmail.com
GET /api/company/psychologists?search=@hotmail.com
GET /api/company/psychologists?search=yahoo
```

**Expected:**
- Case-insensitive matching
- Returns only psychologists matching name OR email
- Search works with partial matches

---

## 4. Filtering Testing

### Filter by Active Status (Active Only)
```
GET /api/company/psychologists?isActive=true
```

### Filter by Active Status (Inactive Only)
```
GET /api/company/psychologists?isActive=false
```

### Filter by Organization
```
GET /api/company/psychologists?organization=6902f4710157487d810f4e0c
```

### Filter for Individual Psychologists (No Organization)
```
GET /api/company/psychologists?organization=null
```

**Expected:**
- `isActive=true` returns only active psychologists
- `isActive=false` returns only inactive psychologists
- `organization=<id>` returns only psychologists from that organization
- `organization=null` returns only psychologists without organization

---

## 5. Sorting Testing

### Sort by Name (Ascending)
```
GET /api/company/psychologists?sortBy=name&sortOrder=asc
```

### Sort by Name (Descending)
```
GET /api/company/psychologists?sortBy=name&sortOrder=desc
```

### Sort by Email
```
GET /api/company/psychologists?sortBy=email&sortOrder=asc
```

### Sort by Created Date (Default)
```
GET /api/company/psychologists?sortBy=createdAt&sortOrder=desc
```

### Sort by Active Status
```
GET /api/company/psychologists?sortBy=isActive&sortOrder=asc
```

### Sort by Specialization
```
GET /api/company/psychologists?sortBy=specialization&sortOrder=asc
```

### Sort by Experience
```
GET /api/company/psychologists?sortBy=experience&sortOrder=desc
```

**Expected:**
- Results sorted correctly by the specified field
- Ascending/descending order works as expected

---

## 6. Combined Testing

### Search + Filter + Sort + Pagination
```
GET /api/company/psychologists?search=Tony&isActive=true&sortBy=name&sortOrder=asc&page=1&limit=5
```

### Filter by Organization + Sort by Experience
```
GET /api/company/psychologists?organization=6902f4710157487d810f4e0c&sortBy=experience&sortOrder=desc
```

### Search + Active Filter + Pagination
```
GET /api/company/psychologists?search=@gmail.com&isActive=true&page=1&limit=10
```

**Expected:**
- All parameters work together correctly
- Results match all applied filters

---

## 7. Count Verification Testing

Check that `triageCount` and `diagnosisCount` are accurate:

### Verify Triage Count
1. Note a psychologist's `_id` from the response
2. Manually count triages for that psychologist in database
3. Compare with `triageCount` in response

### Verify Diagnosis Count
1. Note a psychologist's `_id` from the response
2. Manually count personal diagnoses created by that psychologist
3. Compare with `diagnosisCount` in response

**Expected:**
- Counts match actual database records
- Psychologists with no triages/diagnoses show `0`

---

## 8. Error Testing

### Test Without Authentication
```
GET /api/company/psychologists
(No Authorization header)
```
**Expected:** 401 Unauthorized

### Test with Invalid Token
```
GET /api/company/psychologists
Authorization: Bearer invalid_token
```
**Expected:** 401 Unauthorized

### Test with Psychologist Role (Should Fail)
```
GET /api/company/psychologists
Authorization: Bearer <psychologist_token>
```
**Expected:** 403 Forbidden (only super_admin and company_admin allowed)

### Test Invalid Page Number
```
GET /api/company/psychologists?page=0
GET /api/company/psychologists?page=-1
```
**Expected:** Should handle gracefully (defaults to page 1)

### Test Invalid Limit
```
GET /api/company/psychologists?limit=0
GET /api/company/psychologists?limit=-5
```
**Expected:** Should handle gracefully (defaults to limit 10)

---

## 9. Company Admin Auto-Filtering

When logged in as `company_admin`:
```
GET /api/company/psychologists
```

**Expected:**
- Automatically filters to show only psychologists from the company_admin's organization
- Even if `organization` parameter is not provided

---

## 10. Sample cURL Commands

```bash
# Basic request
curl -X GET "http://localhost:3000/api/company/psychologists" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With pagination
curl -X GET "http://localhost:3000/api/company/psychologists?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With search
curl -X GET "http://localhost:3000/api/company/psychologists?search=Tony" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filter and sort
curl -X GET "http://localhost:3000/api/company/psychologists?isActive=true&sortBy=name&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combined
curl -X GET "http://localhost:3000/api/company/psychologists?search=Jejomar&isActive=true&sortBy=experience&sortOrder=desc&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 11. Postman Collection

You can import these into Postman:

1. **Basic List**
   - Method: GET
   - URL: `{{base_url}}/api/company/psychologists`
   - Headers: `Authorization: Bearer {{token}}`

2. **With Pagination**
   - Method: GET
   - URL: `{{base_url}}/api/company/psychologists?page=1&limit=10`
   - Headers: `Authorization: Bearer {{token}}`

3. **With Search**
   - Method: GET
   - URL: `{{base_url}}/api/company/psychologists?search={{search_term}}`
   - Headers: `Authorization: Bearer {{token}}`

4. **With Filters**
   - Method: GET
   - URL: `{{base_url}}/api/company/psychologists?isActive=true&organization={{org_id}}`
   - Headers: `Authorization: Bearer {{token}}`

5. **With Sorting**
   - Method: GET
   - URL: `{{base_url}}/api/company/psychologists?sortBy=name&sortOrder=asc`
   - Headers: `Authorization: Bearer {{token}}`

---

## Response Structure

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "psychologist",
      "organization": {
        "_id": "string",
        "name": "string"
      },
      "specialization": "string",
      "experience": number,
      "isActive": boolean,
      "triageCount": number,
      "diagnosisCount": number,
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ],
  "pagination": {
    "currentPage": number,
    "totalPages": number,
    "totalItems": number,
    "itemsPerPage": number,
    "hasNextPage": boolean,
    "hasPrevPage": boolean
  }
}
```

