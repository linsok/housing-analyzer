# Database Schema - Housing & Rent Analyzer

## Overview

The database consists of the following main tables:
- User Management (users, user_preferences)
- Property Management (properties, property_images, property_documents)
- Booking System (bookings, messages)
- Payment System (payments, qr_codes)
- Review System (reviews)
- Analytics (rent_trends, popular_searches)
- Moderation (favorites, property_views, reports)

## Entity Relationship Diagram

```
Users (1) ----< (M) Properties
Users (1) ----< (M) Bookings
Users (1) ----< (M) Reviews
Users (1) ----< (M) Favorites
Users (1) ----< (M) Messages
Users (1) ----< (M) Payments
Users (1) ----< (M) Reports

Properties (1) ----< (M) PropertyImages
Properties (1) ----< (M) PropertyDocuments
Properties (1) ----< (M) Bookings
Properties (1) ----< (M) Reviews
Properties (1) ----< (M) Favorites
Properties (1) ----< (M) PropertyViews
Properties (1) ----< (M) Reports

Bookings (1) ----< (M) Messages
Bookings (1) ----< (M) Payments
Bookings (1) ---- (1) Review

Payments (1) ---- (1) QRCode
```

## Table Definitions

### users_user
Main user table with authentication and profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR(150) | Unique username |
| email | VARCHAR(254) | Email address |
| password | VARCHAR(128) | Hashed password |
| first_name | VARCHAR(150) | First name |
| last_name | VARCHAR(150) | Last name |
| role | VARCHAR(10) | User role: admin, owner, renter |
| phone | VARCHAR(20) | Phone number |
| profile_picture | VARCHAR(100) | Profile image path |
| bio | TEXT | User biography |
| verification_status | VARCHAR(10) | pending, verified, rejected |
| id_document | VARCHAR(100) | ID document path |
| business_license | VARCHAR(100) | Business license path |
| verified_at | DATETIME | Verification timestamp |
| verified_by_id | INT | FK to users_user |
| address | TEXT | User address |
| city | VARCHAR(100) | City |
| country | VARCHAR(100) | Country |
| trust_score | DECIMAL(3,2) | Trust score (0-5) |
| is_active | BOOLEAN | Account active status |
| is_staff | BOOLEAN | Staff status |
| is_superuser | BOOLEAN | Superuser status |
| date_joined | DATETIME | Registration date |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |

**Indexes:**
- username (UNIQUE)
- email (UNIQUE)
- role
- verification_status

### users_userpreference
User preferences for recommendations.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | FK to users_user (UNIQUE) |
| preferred_cities | JSON | List of preferred cities |
| preferred_areas | JSON | List of preferred areas |
| min_price | DECIMAL(10,2) | Minimum price preference |
| max_price | DECIMAL(10,2) | Maximum price preference |
| property_types | JSON | Preferred property types |
| furnished | BOOLEAN | Furnished preference |
| required_facilities | JSON | Required facilities list |
| email_notifications | BOOLEAN | Email notification setting |
| sms_notifications | BOOLEAN | SMS notification setting |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |

### properties_property
Main property listings table.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| owner_id | INT | FK to users_user |
| title | VARCHAR(200) | Property title |
| description | TEXT | Property description |
| property_type | VARCHAR(20) | apartment, house, room, studio, condo |
| address | TEXT | Full address |
| city | VARCHAR(100) | City |
| district | VARCHAR(100) | District |
| area | VARCHAR(100) | Area/neighborhood |
| postal_code | VARCHAR(20) | Postal code |
| latitude | DECIMAL(9,6) | GPS latitude |
| longitude | DECIMAL(9,6) | GPS longitude |
| rent_price | DECIMAL(10,2) | Monthly rent |
| deposit | DECIMAL(10,2) | Security deposit |
| currency | VARCHAR(3) | Currency code |
| bedrooms | INT | Number of bedrooms |
| bathrooms | INT | Number of bathrooms |
| area_sqm | DECIMAL(10,2) | Area in square meters |
| floor_number | INT | Floor number |
| is_furnished | BOOLEAN | Furnished status |
| facilities | JSON | List of facilities |
| rules | TEXT | Property rules |
| pets_allowed | BOOLEAN | Pets allowed |
| smoking_allowed | BOOLEAN | Smoking allowed |
| status | VARCHAR(20) | available, rented, pending, maintenance |
| verification_status | VARCHAR(10) | pending, verified, rejected |
| verified_at | DATETIME | Verification timestamp |
| verified_by_id | INT | FK to users_user |
| view_count | INT | Total views |
| favorite_count | INT | Total favorites |
| rating | DECIMAL(3,2) | Average rating |
| available_from | DATE | Available from date |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |

**Indexes:**
- owner_id
- city
- property_type
- status
- verification_status
- rent_price
- created_at

### properties_propertyimage
Property images.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| property_id | INT | FK to properties_property |
| image | VARCHAR(100) | Image file path |
| caption | VARCHAR(200) | Image caption |
| is_primary | BOOLEAN | Primary image flag |
| order | INT | Display order |
| created_at | DATETIME | Created timestamp |

**Indexes:**
- property_id
- is_primary

### properties_propertydocument
Property ownership documents.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| property_id | INT | FK to properties_property |
| document | VARCHAR(100) | Document file path |
| document_type | VARCHAR(50) | Document type |
| description | VARCHAR(200) | Description |
| uploaded_at | DATETIME | Upload timestamp |

### properties_favorite
User favorite properties.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | FK to users_user |
| property_id | INT | FK to properties_property |
| created_at | DATETIME | Created timestamp |

**Indexes:**
- user_id, property_id (UNIQUE TOGETHER)

### properties_propertyview
Property view tracking for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| property_id | INT | FK to properties_property |
| user_id | INT | FK to users_user (nullable) |
| ip_address | VARCHAR(45) | IP address |
| user_agent | TEXT | Browser user agent |
| viewed_at | DATETIME | View timestamp |

**Indexes:**
- property_id
- viewed_at

### properties_report
Property reports for moderation.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| property_id | INT | FK to properties_property |
| reported_by_id | INT | FK to users_user |
| reason | VARCHAR(20) | Report reason |
| description | TEXT | Report description |
| status | VARCHAR(20) | pending, reviewing, resolved, dismissed |
| reviewed_by_id | INT | FK to users_user |
| admin_notes | TEXT | Admin notes |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |

**Indexes:**
- property_id
- status
- created_at

### bookings_booking
Property bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| property_id | INT | FK to properties_property |
| renter_id | INT | FK to users_user |
| booking_type | VARCHAR(10) | rental, visit |
| start_date | DATE | Start date (for rentals) |
| end_date | DATE | End date (nullable) |
| visit_time | DATETIME | Visit time (for visits) |
| monthly_rent | DECIMAL(10,2) | Monthly rent amount |
| deposit_amount | DECIMAL(10,2) | Deposit amount |
| total_amount | DECIMAL(10,2) | Total amount |
| status | VARCHAR(20) | pending, confirmed, completed, cancelled, rejected |
| message | TEXT | Renter message |
| owner_notes | TEXT | Owner notes |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |
| confirmed_at | DATETIME | Confirmation timestamp |

**Indexes:**
- property_id
- renter_id
- status
- created_at

### bookings_message
Messages between users.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| booking_id | INT | FK to bookings_booking (nullable) |
| property_id | INT | FK to properties_property |
| sender_id | INT | FK to users_user |
| receiver_id | INT | FK to users_user |
| content | TEXT | Message content |
| is_read | BOOLEAN | Read status |
| created_at | DATETIME | Created timestamp |

**Indexes:**
- sender_id
- receiver_id
- property_id
- is_read
- created_at

### payments_payment
Payment transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| booking_id | INT | FK to bookings_booking |
| user_id | INT | FK to users_user |
| amount | DECIMAL(10,2) | Payment amount |
| currency | VARCHAR(3) | Currency code |
| payment_method | VARCHAR(20) | cash, qr_code, credit_card, bank_transfer |
| status | VARCHAR(20) | pending, completed, failed, refunded |
| transaction_id | VARCHAR(100) | External transaction ID |
| payment_proof | VARCHAR(100) | Payment proof image |
| description | TEXT | Payment description |
| notes | TEXT | Additional notes |
| created_at | DATETIME | Created timestamp |
| completed_at | DATETIME | Completion timestamp |

**Indexes:**
- booking_id
- user_id
- status
- created_at

### payments_qrcode
QR codes for payments.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| payment_id | INT | FK to payments_payment (UNIQUE) |
| qr_image | VARCHAR(100) | QR code image path |
| qr_data | TEXT | QR code data |
| expires_at | DATETIME | Expiration timestamp |
| created_at | DATETIME | Created timestamp |

### reviews_review
Property reviews.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| property_id | INT | FK to properties_property |
| booking_id | INT | FK to bookings_booking (nullable, UNIQUE) |
| reviewer_id | INT | FK to users_user |
| overall_rating | INT | Overall rating (1-5) |
| cleanliness | INT | Cleanliness rating (1-5) |
| accuracy | INT | Accuracy rating (1-5) |
| location | INT | Location rating (1-5) |
| value | INT | Value rating (1-5) |
| title | VARCHAR(200) | Review title |
| comment | TEXT | Review comment |
| is_verified | BOOLEAN | Verified renter |
| owner_response | TEXT | Owner response |
| responded_at | DATETIME | Response timestamp |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |

**Indexes:**
- property_id
- reviewer_id
- property_id, reviewer_id (UNIQUE TOGETHER)
- created_at

### analytics_renttrend
Rent trend data.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| city | VARCHAR(100) | City |
| area | VARCHAR(100) | Area |
| property_type | VARCHAR(20) | Property type |
| average_rent | DECIMAL(10,2) | Average rent |
| median_rent | DECIMAL(10,2) | Median rent |
| min_rent | DECIMAL(10,2) | Minimum rent |
| max_rent | DECIMAL(10,2) | Maximum rent |
| property_count | INT | Number of properties |
| month | INT | Month (1-12) |
| year | INT | Year |
| created_at | DATETIME | Created timestamp |
| updated_at | DATETIME | Updated timestamp |

**Indexes:**
- city, area, property_type, month, year (UNIQUE TOGETHER)

### analytics_popularsearch
Popular search tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| search_term | VARCHAR(200) | Search term |
| city | VARCHAR(100) | City filter |
| property_type | VARCHAR(20) | Property type filter |
| min_price | DECIMAL(10,2) | Min price filter |
| max_price | DECIMAL(10,2) | Max price filter |
| search_count | INT | Number of searches |
| last_searched | DATETIME | Last search timestamp |

**Indexes:**
- search_count
- last_searched

## Database Relationships

### One-to-Many Relationships
- User → Properties (owner)
- User → Bookings (renter)
- User → Reviews (reviewer)
- User → Favorites
- User → Messages (sender/receiver)
- User → Payments
- User → Reports
- Property → PropertyImages
- Property → PropertyDocuments
- Property → Bookings
- Property → Reviews
- Property → Favorites
- Property → PropertyViews
- Property → Reports
- Booking → Messages
- Booking → Payments

### One-to-One Relationships
- User → UserPreference
- Booking → Review
- Payment → QRCode

## Constraints

### Foreign Key Constraints
- All FK relationships use CASCADE on delete for dependent data
- Some use SET_NULL for historical data preservation

### Unique Constraints
- username (users_user)
- email (users_user)
- user_id (users_userpreference)
- user_id + property_id (properties_favorite)
- property_id + reviewer_id (reviews_review)
- payment_id (payments_qrcode)

### Check Constraints
- rating values: 1-5
- trust_score: 0.00-5.00
- prices: >= 0

## Indexes Strategy

### Performance Indexes
- Foreign keys (automatic)
- Search fields (city, property_type, status)
- Filter fields (price ranges, dates)
- Sorting fields (created_at, rating, view_count)

### Composite Indexes
- Unique constraints
- Common query combinations

## Data Types

### Numeric
- INT: IDs, counts
- DECIMAL(10,2): Prices, areas
- DECIMAL(3,2): Ratings, scores

### String
- VARCHAR: Fixed-length strings
- TEXT: Long text content

### Date/Time
- DATE: Dates only
- DATETIME: Full timestamps

### Boolean
- BOOLEAN: True/false flags

### JSON
- JSON: Lists and objects

## Backup & Maintenance

### Recommended Backup Schedule
- Full backup: Daily
- Incremental backup: Hourly
- Transaction log backup: Every 15 minutes

### Maintenance Tasks
- Update statistics: Weekly
- Rebuild indexes: Monthly
- Archive old data: Quarterly

---

**Database Engine**: MySQL 8.0+
**Character Set**: utf8mb4
**Collation**: utf8mb4_unicode_ci
