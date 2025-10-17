# API Documentation - Housing & Rent Analyzer

Base URL: `http://localhost:8000/api`

## Authentication

### Register User
```http
POST /auth/users/register/
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "renter|owner",
  "phone": "string"
}
```

### Login
```http
POST /auth/token/
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access": "jwt_token",
  "refresh": "refresh_token"
}
```

### Refresh Token
```http
POST /auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "refresh_token"
}
```

### Get Current User Profile
```http
GET /auth/users/profile/
Authorization: Bearer {access_token}
```

### Update Profile
```http
PATCH /auth/users/profile/
Authorization: Bearer {access_token}
```

### Upload Verification Documents (Property Owners)
```http
POST /auth/users/upload_verification/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Data:**
- `id_document`: File
- `business_license`: File (optional)

## Properties

### List Properties
```http
GET /properties/
```

**Query Parameters:**
- `search`: string (search in title, description)
- `city`: string
- `area`: string
- `property_type`: apartment|house|room|studio|condo
- `min_price`: number
- `max_price`: number
- `min_bedrooms`: number
- `max_bedrooms`: number
- `min_bathrooms`: number
- `is_furnished`: boolean
- `pets_allowed`: boolean
- `status`: available|rented|pending|maintenance
- `ordering`: rent_price|-rent_price|created_at|-created_at|rating|-rating

### Get Property Detail
```http
GET /properties/{id}/
```

### Create Property (Property Owners)
```http
POST /properties/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "property_type": "apartment|house|room|studio|condo",
  "address": "string",
  "city": "string",
  "district": "string",
  "area": "string",
  "postal_code": "string",
  "latitude": number,
  "longitude": number,
  "rent_price": number,
  "deposit": number,
  "currency": "USD",
  "bedrooms": number,
  "bathrooms": number,
  "area_sqm": number,
  "floor_number": number,
  "is_furnished": boolean,
  "facilities": ["wifi", "parking", "ac", "gym"],
  "rules": "string",
  "pets_allowed": boolean,
  "smoking_allowed": boolean,
  "status": "available",
  "available_from": "YYYY-MM-DD"
}
```

### Update Property
```http
PATCH /properties/{id}/
Authorization: Bearer {access_token}
```

### Delete Property
```http
DELETE /properties/{id}/
Authorization: Bearer {access_token}
```

### Upload Property Images
```http
POST /properties/{id}/upload_images/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Data:**
- `images`: File[] (multiple files)

### Toggle Favorite
```http
POST /properties/{id}/toggle_favorite/
Authorization: Bearer {access_token}
```

### Get My Properties (Property Owners)
```http
GET /properties/my_properties/
Authorization: Bearer {access_token}
```

### Get Favorites (Renters)
```http
GET /properties/favorites/
Authorization: Bearer {access_token}
```

### Get Recommended Properties
```http
GET /properties/recommended/
Authorization: Bearer {access_token} (optional)
```

### Report Property
```http
POST /properties/reports/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "property": number,
  "reason": "fake|misleading|scam|inappropriate|duplicate|other",
  "description": "string"
}
```

## Bookings

### List Bookings
```http
GET /bookings/
Authorization: Bearer {access_token}
```

### Create Booking
```http
POST /bookings/
Authorization: Bearer {access_token}
```

**Request Body (Rental):**
```json
{
  "property": number,
  "booking_type": "rental",
  "start_date": "YYYY-MM-DD",
  "message": "string"
}
```

**Request Body (Visit):**
```json
{
  "property": number,
  "booking_type": "visit",
  "visit_time": "YYYY-MM-DDTHH:MM:SS",
  "message": "string"
}
```

### Confirm Booking (Property Owners)
```http
POST /bookings/{id}/confirm/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "notes": "string"
}
```

### Cancel Booking
```http
POST /bookings/{id}/cancel/
Authorization: Bearer {access_token}
```

### Complete Booking (Property Owners)
```http
POST /bookings/{id}/complete/
Authorization: Bearer {access_token}
```

## Messages

### List Messages
```http
GET /bookings/messages/
Authorization: Bearer {access_token}
```

### Get Conversations
```http
GET /bookings/messages/conversations/
Authorization: Bearer {access_token}
```

### Send Message
```http
POST /bookings/messages/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "property": number,
  "receiver": number,
  "content": "string",
  "booking": number (optional)
}
```

### Mark Message as Read
```http
POST /bookings/messages/{id}/mark_read/
Authorization: Bearer {access_token}
```

## Payments

### List Payments
```http
GET /payments/
Authorization: Bearer {access_token}
```

### Create Payment
```http
POST /payments/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "booking": number,
  "amount": number,
  "currency": "USD",
  "payment_method": "cash|qr_code|credit_card|bank_transfer",
  "description": "string"
}
```

### Generate QR Code
```http
POST /payments/{id}/generate_qr/
Authorization: Bearer {access_token}
```

### Upload Payment Proof
```http
POST /payments/{id}/upload_proof/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Data:**
- `payment_proof`: File

### Confirm Payment (Property Owners/Admin)
```http
POST /payments/{id}/confirm/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "notes": "string"
}
```

## Reviews

### List Reviews
```http
GET /reviews/?property={property_id}
```

### Create Review
```http
POST /reviews/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "property": number,
  "booking": number (optional),
  "overall_rating": number (1-5),
  "cleanliness": number (1-5),
  "accuracy": number (1-5),
  "location": number (1-5),
  "value": number (1-5),
  "title": "string",
  "comment": "string"
}
```

### Respond to Review (Property Owners)
```http
POST /reviews/{id}/respond/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "owner_response": "string"
}
```

## Analytics

### Get Rent Trends
```http
GET /analytics/rent-trends/
```

**Query Parameters:**
- `city`: string
- `property_type`: string
- `months`: number (default: 6)

**Response:**
```json
[
  {
    "month": "2024-01-01T00:00:00Z",
    "city": "Phnom Penh",
    "property_type": "apartment",
    "avg_rent": 500.00,
    "min_rent": 200.00,
    "max_rent": 1000.00,
    "count": 50
  }
]
```

### City Comparison
```http
GET /analytics/city-comparison/
```

**Query Parameters:**
- `cities`: string[] (multiple)
- `property_type`: string

### Popular Areas
```http
GET /analytics/popular-areas/
```

**Query Parameters:**
- `city`: string

### Property Demand
```http
GET /analytics/property-demand/
```

### Owner Analytics
```http
GET /analytics/owner-analytics/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "overview": {
    "total_properties": number,
    "verified_properties": number,
    "total_views": number,
    "total_favorites": number,
    "total_bookings": number,
    "confirmed_bookings": number,
    "pending_bookings": number,
    "total_revenue": number
  },
  "property_performance": [
    {
      "id": number,
      "title": "string",
      "views": number,
      "favorites": number,
      "rating": number,
      "bookings": number,
      "status": "string"
    }
  ],
  "pricing_comparison": {
    "your_avg_rent": number,
    "city_avg_rent": number
  }
}
```

### Admin Dashboard
```http
GET /analytics/admin-dashboard/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "users": {
    "total": number,
    "renters": number,
    "owners": number,
    "verified_owners": number,
    "pending_verifications": number,
    "new_last_30_days": number
  },
  "properties": {
    "total": number,
    "verified": number,
    "pending": number,
    "available": number,
    "rented": number,
    "new_last_30_days": number
  },
  "bookings": {
    "total": number,
    "pending": number,
    "confirmed": number,
    "new_last_30_days": number
  },
  "reports": {
    "pending": number
  }
}
```

## Admin Endpoints

### Get Pending User Verifications
```http
GET /auth/users/pending_verifications/
Authorization: Bearer {access_token}
```

### Verify User
```http
POST /auth/users/{id}/verify/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "verification_status": "verified|rejected",
  "notes": "string"
}
```

### Get Pending Property Verifications
```http
GET /properties/pending_verifications/
Authorization: Bearer {access_token}
```

### Verify Property
```http
POST /properties/{id}/verify/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "verification_status": "verified|rejected",
  "notes": "string"
}
```

### Review Report
```http
POST /properties/reports/{id}/review/
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "status": "reviewing|resolved|dismissed",
  "admin_notes": "string"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error message",
  "field_name": ["Error detail"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Pagination

List endpoints return paginated results:

```json
{
  "count": number,
  "next": "url|null",
  "previous": "url|null",
  "results": []
}
```

**Query Parameters:**
- `page`: number (default: 1)
- `page_size`: number (default: 12, max: 100)

## Rate Limiting

- Anonymous users: 100 requests/hour
- Authenticated users: 1000 requests/hour
- Admin users: Unlimited

## Notes

- All dates are in ISO 8601 format
- All timestamps are in UTC
- File uploads must be multipart/form-data
- Maximum file size: 10MB per file
- Supported image formats: JPG, PNG, WebP
- Supported document formats: PDF, JPG, PNG

---

**For more details, visit the interactive API documentation at `/api/docs/` (when available)**
