# Testing Guide - Housing & Rent Analyzer

## Manual Testing Checklist

### 1. User Authentication & Registration

#### Registration Tests
- [ ] Register as Renter
  - Fill all required fields
  - Verify password confirmation works
  - Check email validation
  - Verify successful registration message
  - Confirm redirect to login page

- [ ] Register as Property Owner
  - Select "Property Owner" role
  - Complete registration
  - Verify account created with pending verification status

- [ ] Registration Validation
  - Test with mismatched passwords
  - Test with existing username
  - Test with existing email
  - Test with invalid email format
  - Test with short password

#### Login Tests
- [ ] Login with valid credentials
- [ ] Login with invalid username
- [ ] Login with invalid password
- [ ] Verify JWT token is stored
- [ ] Verify redirect to appropriate dashboard based on role
- [ ] Test "Remember Me" functionality
- [ ] Test logout functionality

### 2. Property Owner Workflow

#### Property Owner Verification
- [ ] Login as property owner
- [ ] Upload ID document
- [ ] Upload business license (optional)
- [ ] Submit for verification
- [ ] Login as admin
- [ ] Navigate to pending verifications
- [ ] Approve property owner
- [ ] Verify owner receives verified badge

#### Property Management (CRUD)
- [ ] **Create Property**
  - Fill all property details
  - Upload multiple images
  - Set pricing and features
  - Submit property
  - Verify property appears in "My Properties"
  - Verify property status is "pending"

- [ ] **Read Property**
  - View property list
  - Click on property to view details
  - Verify all information displays correctly
  - Check image gallery works

- [ ] **Update Property**
  - Edit property details
  - Change pricing
  - Update availability status
  - Add/remove images
  - Save changes
  - Verify updates are reflected

- [ ] **Delete Property**
  - Delete a property
  - Confirm deletion
  - Verify property is removed from list

#### Property Verification by Admin
- [ ] Login as admin
- [ ] View pending properties
- [ ] Approve a property
- [ ] Verify property status changes to "verified"
- [ ] Reject a property
- [ ] Verify property status changes to "rejected"

#### Owner Dashboard
- [ ] View total properties count
- [ ] View total views and favorites
- [ ] View bookings statistics
- [ ] Check revenue tracking
- [ ] View property performance chart
- [ ] Compare pricing with market average
- [ ] View pending bookings
- [ ] Confirm a booking
- [ ] View analytics

### 3. Renter Workflow

#### Property Search & Browse
- [ ] Browse all properties without login
- [ ] Use search bar to find properties
- [ ] Apply filters:
  - [ ] City filter
  - [ ] Property type filter
  - [ ] Price range filter
  - [ ] Bedroom count filter
  - [ ] Furnished/unfurnished filter
  - [ ] Pets allowed filter
- [ ] Clear all filters
- [ ] Sort by price (low to high)
- [ ] Sort by price (high to low)
- [ ] Sort by newest
- [ ] Sort by rating

#### Property Details
- [ ] Click on a property card
- [ ] View all property details
- [ ] Browse image gallery
- [ ] View property location on map
- [ ] Read property description
- [ ] View amenities and features
- [ ] Read property rules
- [ ] View owner information
- [ ] Read reviews

#### Favorites
- [ ] Login as renter
- [ ] Add property to favorites
- [ ] Verify heart icon fills
- [ ] View favorites page
- [ ] Remove from favorites
- [ ] Verify property is removed

#### Booking Process
- [ ] **Rental Booking**
  - Click "Request to Rent"
  - Select move-in date
  - Add message
  - Submit booking request
  - Verify booking appears in dashboard
  - Check booking status is "pending"

- [ ] **Visit Booking**
  - Click "Schedule Visit"
  - Select visit date and time
  - Add message
  - Submit visit request
  - Verify visit appears in dashboard

#### Renter Dashboard
- [ ] View total bookings
- [ ] View favorites count
- [ ] View active rentals
- [ ] Check booking status
- [ ] View property details from booking
- [ ] Cancel a pending booking
- [ ] View favorite properties
- [ ] Access quick actions

#### Reviews
- [ ] Complete a booking
- [ ] Write a review
  - Rate overall (1-5 stars)
  - Rate cleanliness, accuracy, location, value
  - Write title and comment
  - Submit review
- [ ] View review on property page
- [ ] Verify "Verified Renter" badge if booked through platform

### 4. Payment System

#### Payment Creation
- [ ] Create a booking
- [ ] Create payment for booking
- [ ] Select payment method (cash/QR/card)
- [ ] View payment details

#### QR Code Payment
- [ ] Generate QR code for payment
- [ ] Verify QR code image displays
- [ ] Download QR code

#### Payment Proof
- [ ] Upload payment proof image
- [ ] Verify image is uploaded

#### Payment Confirmation
- [ ] Login as property owner
- [ ] View pending payments
- [ ] Confirm payment
- [ ] Add notes
- [ ] Verify payment status changes to "completed"
- [ ] Verify booking status updates

### 5. Messaging System

- [ ] Send message to property owner
- [ ] View conversations list
- [ ] Read messages
- [ ] Reply to messages
- [ ] Mark message as read
- [ ] View unread count

### 6. Analytics & Insights

#### Public Analytics
- [ ] View rent trends by city
- [ ] Compare rent prices across cities
- [ ] View popular areas
- [ ] View property demand by type
- [ ] View feature demand (furnished, pets, etc.)

#### Owner Analytics
- [ ] View property performance
- [ ] Check views and favorites per property
- [ ] View booking statistics
- [ ] Track revenue
- [ ] Compare pricing with market

#### Admin Analytics
- [ ] View user statistics
- [ ] View property statistics
- [ ] View booking statistics
- [ ] Check pending verifications count
- [ ] View pending reports count
- [ ] Monitor platform growth

### 7. Admin Functions

#### User Management
- [ ] View all users
- [ ] Filter by role
- [ ] View pending verifications
- [ ] Approve user verification
- [ ] Reject user verification
- [ ] View user details

#### Property Management
- [ ] View all properties
- [ ] Filter by status
- [ ] View pending properties
- [ ] Approve property
- [ ] Reject property
- [ ] Remove property

#### Report Management
- [ ] View pending reports
- [ ] Read report details
- [ ] Mark report as "Under Review"
- [ ] Resolve report (remove property)
- [ ] Dismiss report

#### Dashboard Overview
- [ ] View total users count
- [ ] View total properties count
- [ ] View total bookings count
- [ ] View pending reports count
- [ ] Check new users this month
- [ ] Check new properties this month

### 8. Reporting System

- [ ] Login as renter
- [ ] Report a property
- [ ] Select reason (fake, misleading, scam, etc.)
- [ ] Write description
- [ ] Submit report
- [ ] Login as admin
- [ ] View report in pending reports
- [ ] Take action on report

### 9. Recommendations

- [ ] View recommended properties on homepage
- [ ] Login as renter
- [ ] Set preferences (cities, price range, property types)
- [ ] View recommended properties
- [ ] Verify recommendations match preferences
- [ ] View properties and verify similarity

### 10. UI/UX Testing

#### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Test navigation menu on mobile
- [ ] Test forms on mobile
- [ ] Test image galleries on mobile

#### Navigation
- [ ] Test all navbar links
- [ ] Test footer links
- [ ] Test breadcrumbs
- [ ] Test back button
- [ ] Test pagination

#### Forms
- [ ] Test all input validations
- [ ] Test error messages display
- [ ] Test success messages
- [ ] Test file uploads
- [ ] Test date pickers
- [ ] Test dropdowns

#### Loading States
- [ ] Verify loading spinners appear
- [ ] Test skeleton screens
- [ ] Test empty states
- [ ] Test error states

### 11. Security Testing

- [ ] Try accessing admin routes as renter
- [ ] Try accessing owner routes as renter
- [ ] Try accessing protected routes without login
- [ ] Try editing other user's properties
- [ ] Try deleting other user's properties
- [ ] Test XSS prevention in text inputs
- [ ] Test SQL injection prevention
- [ ] Test file upload restrictions

### 12. Performance Testing

- [ ] Test page load times
- [ ] Test image loading (lazy loading)
- [ ] Test search performance with many results
- [ ] Test pagination performance
- [ ] Test API response times

## Automated Testing

### Backend Tests (Django)

Create `backend/tests/` directory and add test files:

```python
# tests/test_users.py
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='renter'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.role, 'renter')
        self.assertTrue(user.check_password('testpass123'))
```

Run tests:
```bash
python manage.py test
```

### Frontend Tests (React)

Install testing libraries:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

Example test:
```javascript
// src/components/__tests__/Button.test.jsx
import { render, screen } from '@testing-library/react';
import Button from '../ui/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

Run tests:
```bash
npm test
```

## Test Data

### Sample Users

**Admin:**
- Username: admin
- Password: admin123
- Email: admin@housinganalyzer.com

**Property Owner:**
- Username: owner1
- Password: owner123
- Email: owner@example.com

**Renter:**
- Username: renter1
- Password: renter123
- Email: renter@example.com

### Sample Properties

Create at least 10 properties with:
- Different cities (Phnom Penh, Siem Reap, Battambang)
- Different types (apartment, house, room)
- Different price ranges ($100-$2000)
- Different features (furnished/unfurnished, pets allowed)
- Multiple images per property

## Bug Reporting Template

When you find a bug, report it using this template:

```
**Bug Title:** Brief description

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Result:**
What should happen

**Actual Result:**
What actually happens

**Screenshots:**
Attach screenshots if applicable

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen size: 1920x1080
```

## Test Coverage Goals

- Backend: 80%+ code coverage
- Frontend: 70%+ code coverage
- Critical paths: 100% coverage

## Continuous Testing

- Run tests before every commit
- Run full test suite before deployment
- Monitor production errors
- Set up automated testing in CI/CD pipeline

---

**Happy Testing! 🧪**
