# Renter Features Guide

## Overview
Comprehensive guide for renters covering the Favorites page, enhanced dashboard with rental history, spending analytics, and payment reminders.

---

## 🎯 New Features Implemented

### 1. **Favorites Page** (`/favorites`)
### 2. **Enhanced Renter Dashboard** with:
   - Rental History
   - Spending Analytics (Monthly/Yearly)
   - Payment Reminders
   - Spending by Property Type

---

## ❤️ Favorites Page

### Access
- **Route**: `/favorites`
- **Navigation**: Click "Favorites" in navbar or from dashboard
- **Protection**: Requires renter authentication

### Features

#### Property Cards Display
Each favorite property shows:
- **Property Image**: Primary image or default placeholder
- **Status Badge**: Available/Rented status with color coding
- **Property Title**: Full property name
- **Location**: City and area/district with map pin icon
- **Property Details**:
  - Number of bedrooms
  - Number of bathrooms
  - Property type (apartment, house, etc.)
- **Pricing**:
  - Monthly rent (large, prominent)
  - Deposit amount (if applicable)
- **Added Date**: When you favorited the property
- **Action Buttons**:
  - View Details (primary button)
  - Remove from Favorites (trash icon)

#### Functionality
- ✅ **View All Favorites**: Grid layout (3 columns on desktop)
- ✅ **Remove Favorites**: Click heart icon or trash button
- ✅ **Quick View**: Direct link to property details
- ✅ **Empty State**: Helpful message with "Browse Properties" button
- ✅ **Loading States**: Shows spinner while removing
- ✅ **Responsive Design**: Adapts to mobile/tablet/desktop

#### Tips Section
Helpful tips displayed at bottom:
- Compare multiple properties side by side
- Check back regularly for price updates
- Contact owners early for popular properties
- Remove properties you're no longer interested in

---

## 📊 Enhanced Renter Dashboard

### Access
- **Route**: `/renter/dashboard`
- **Navigation**: Click "Dashboard" in navbar
- **Protection**: Requires renter authentication

---

### 🚨 Payment Reminders (Top Priority)

**Automatic Payment Tracking**:
- Shows upcoming rent payments within next 30 days
- Color-coded urgency:
  - **Red (Urgent)**: 7 days or less until payment
  - **Yellow (Upcoming)**: 8-30 days until payment

**Information Displayed**:
- Property title and address
- Payment amount (monthly rent)
- Due date
- Days remaining until payment
- Urgency indicator

**Smart Calculation**:
- Automatically calculates next payment date
- Based on rental start date
- Assumes monthly payment cycle
- Only shows active rentals

**Example Alert**:
```
🚨 Urgent Payment Due!
Modern Apartment in BKK1
$500.00 due in 3 days
Due: Oct 16, 2025
```

---

### 📈 Overview Statistics

Four key metric cards:

1. **Total Bookings**
   - Count of all bookings
   - Shows confirmed bookings count

2. **Active Rentals**
   - Currently renting properties
   - Real-time status

3. **Total Spent**
   - All-time spending
   - Includes confirmed and completed bookings

4. **Favorites**
   - Saved properties count
   - Link to favorites page

---

### 💰 Spending Analytics

#### Monthly/Yearly Toggle
Switch between two views:

**Monthly View (Last 12 Months)**:
- Area chart showing spending per month
- Month labels (e.g., "Jan 2025", "Feb 2025")
- Amount spent each month
- Number of bookings per month

**Yearly View (Last 3 Years)**:
- Bar chart showing spending per year
- Year labels (e.g., "2023", "2024", "2025")
- Total amount spent each year
- Number of bookings per year

#### Summary Statistics
- **Average Rent**: Average monthly rent paid
- **Current Period**: Spending this month/year

#### Chart Features
- Interactive tooltips
- Formatted currency display
- Color-coded visualization
- Responsive design

---

### 🥧 Spending by Property Type

**Pie Chart Visualization**:
- Shows spending distribution across property types
- Color-coded segments
- Interactive labels

**Property Types Tracked**:
- Apartment
- House
- Room
- Studio
- Condo

**Data Displayed**:
- Total spent per property type
- Number of bookings per type
- Percentage of total spending

**Legend**:
- Color indicator for each type
- Property type name
- Total amount spent

---

### 📜 Rental History Table

**Comprehensive History**:
- Last 20 rental bookings
- Detailed information per rental

**Columns**:
1. **Property**: Property title
2. **Location**: City with map pin icon
3. **Type**: Property type (capitalized)
4. **Monthly Rent**: Rent amount
5. **Start Date**: When rental began
6. **End Date**: When rental ends (or "Ongoing")
7. **Status**: Badge with color coding
8. **Action**: View property button

**Status Badges**:
- **Pending**: Yellow badge
- **Confirmed**: Green badge
- **Completed**: Blue badge
- **Cancelled**: Red badge
- **Rejected**: Red badge

**Features**:
- Sortable by date (newest first)
- Hover effect on rows
- Direct link to property details
- Responsive table (horizontal scroll on mobile)

**Empty State**:
- Friendly message
- "Browse Properties" button
- Icon illustration

---

### 🎯 Quick Actions Section

Three action cards at bottom:

1. **Browse Properties**
   - Home icon
   - Link to properties page
   - "Find your next rental"

2. **My Favorites**
   - Heart icon
   - Shows favorites count
   - Link to favorites page

3. **Market Trends**
   - Chart icon
   - Link to market trends
   - "Explore rental market"

---

## 🔔 Payment Reminder System

### How It Works

1. **Automatic Calculation**:
   - System tracks all active rentals
   - Calculates next payment date based on start date
   - Assumes monthly payment cycle

2. **Reminder Timing**:
   - Shows reminders 30 days in advance
   - Highlights urgent payments (7 days or less)
   - Updates daily

3. **Notification Levels**:
   - **Urgent (Red)**: 0-7 days remaining
   - **Upcoming (Yellow)**: 8-30 days remaining
   - **No Alert**: More than 30 days away

4. **Information Provided**:
   - Exact payment date
   - Days remaining countdown
   - Property details
   - Payment amount

### Example Scenarios

**Scenario 1: Urgent Payment**
```
Rental started: September 15, 2025
Today: October 12, 2025
Next payment: October 15, 2025
Days remaining: 3 days
Alert: 🚨 URGENT (Red)
```

**Scenario 2: Upcoming Payment**
```
Rental started: September 1, 2025
Today: October 13, 2025
Next payment: November 1, 2025
Days remaining: 19 days
Alert: ⏰ UPCOMING (Yellow)
```

**Scenario 3: No Alert**
```
Rental started: August 5, 2025
Today: October 13, 2025
Next payment: December 5, 2025
Days remaining: 53 days
Alert: None (not shown)
```

---

## 📊 Analytics Data Breakdown

### Monthly Spending Data
```json
{
  "month": "Oct 2025",
  "amount": 1500.00,
  "bookings": 2
}
```

### Yearly Spending Data
```json
{
  "year": 2025,
  "amount": 18000.00,
  "bookings": 12
}
```

### Rental History Entry
```json
{
  "id": 123,
  "property_title": "Modern Apartment",
  "property_address": "Street 123, BKK1",
  "property_city": "Phnom Penh",
  "property_type": "apartment",
  "monthly_rent": 500.00,
  "deposit": 500.00,
  "total_amount": 6000.00,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "status": "confirmed"
}
```

### Payment Reminder Entry
```json
{
  "property_title": "Modern Apartment",
  "property_address": "Street 123, BKK1",
  "monthly_rent": 500.00,
  "next_payment_date": "2025-11-01",
  "days_until_payment": 19,
  "is_urgent": false
}
```

---

## 🎨 UI/UX Features

### Design Elements
- **Color Coding**:
  - Red: Urgent/Error
  - Yellow: Warning/Upcoming
  - Green: Success/Confirmed
  - Blue: Info/Completed
  - Gray: Neutral/Pending

- **Icons**: Lucide icons throughout
- **Charts**: Recharts library for visualizations
- **Cards**: Clean card-based layout
- **Badges**: Status indicators
- **Responsive**: Mobile-first design

### User Experience
- **Loading States**: Spinners during data fetch
- **Empty States**: Helpful messages and actions
- **Hover Effects**: Interactive elements
- **Tooltips**: Chart data on hover
- **Smooth Transitions**: Animated state changes

---

## 🔄 User Workflows

### Viewing Favorites
```
1. Click "Favorites" in navbar
2. View all saved properties
3. Click property to view details
4. Remove unwanted favorites
5. Browse more properties if needed
```

### Checking Payment Reminders
```
1. Login as renter
2. Navigate to dashboard
3. View payment alerts at top
4. Note payment dates and amounts
5. Plan payments accordingly
```

### Analyzing Spending
```
1. Go to renter dashboard
2. View spending chart
3. Toggle between monthly/yearly
4. Check spending by property type
5. Review average rent paid
6. Compare with budget
```

### Reviewing Rental History
```
1. Scroll to rental history section
2. View all past and current rentals
3. Check dates and amounts
4. Click "View" to see property details
5. Track rental patterns
```

---

## 🛠️ Technical Implementation

### Backend API

**Endpoint**: `GET /api/analytics/renter-analytics/`

**Authentication**: Required (Renter role only)

**Response Structure**:
```json
{
  "overview": {
    "total_bookings": 10,
    "confirmed_bookings": 8,
    "completed_bookings": 5,
    "pending_bookings": 2,
    "total_spent": 15000.00,
    "active_rentals": 1,
    "avg_rent_paid": 500.00,
    "favorites_count": 5
  },
  "monthly_spending": [...],
  "yearly_spending": [...],
  "rental_history": [...],
  "payment_reminders": [...],
  "spending_by_type": [...]
}
```

### Frontend Components

**Files Created**:
- `frontend/src/pages/Favorites.jsx`
- `frontend/src/pages/RenterDashboardEnhanced.jsx`

**Services Used**:
- `analyticsService.getRenterAnalytics()`
- `propertyService.getFavorites()`
- `propertyService.toggleFavorite(propertyId)`

**Libraries**:
- React (hooks: useState, useEffect)
- React Router (Link, navigation)
- Recharts (charts and graphs)
- Lucide React (icons)

---

## 📱 Responsive Design

### Desktop (lg+)
- 3-column favorites grid
- 4-column stats cards
- 2-column analytics charts
- Full-width table

### Tablet (md)
- 2-column favorites grid
- 2-column stats cards
- Stacked charts
- Scrollable table

### Mobile (sm)
- 1-column layout
- Stacked stats cards
- Full-width charts
- Horizontal scroll table

---

## 💡 Tips for Renters

### Managing Favorites
1. Save properties you're interested in
2. Compare multiple options
3. Check back for price changes
4. Remove outdated favorites
5. Act quickly on popular properties

### Tracking Spending
1. Review monthly spending regularly
2. Set a rental budget
3. Compare with market averages
4. Track spending by property type
5. Plan for future rentals

### Payment Management
1. Check dashboard regularly for reminders
2. Set calendar alerts for payment dates
3. Pay rent on time to maintain good record
4. Keep payment receipts
5. Contact owner if payment issues arise

### Rental History
1. Keep track of past rentals
2. Note good landlords/properties
3. Use history for future decisions
4. Review spending patterns
5. Learn from past experiences

---

## 🐛 Troubleshooting

### Favorites Not Loading
- Check internet connection
- Ensure you're logged in as renter
- Refresh the page
- Clear browser cache

### Payment Reminders Not Showing
- Ensure you have active rentals
- Check rental start dates are set
- Verify booking status is "confirmed"
- Reminders only show 30 days in advance

### Charts Not Displaying
- Ensure you have booking history
- Check that bookings are confirmed/completed
- Try toggling between monthly/yearly
- Refresh the page

### Rental History Empty
- Make sure you have made bookings
- Check booking status
- Verify bookings are for rentals (not visits)
- Contact support if data is missing

---

## 🔐 Security & Privacy

### Data Protection
- Only renters can access their own data
- Authentication required for all endpoints
- Secure API calls with JWT tokens
- No data shared with other users

### Privacy Features
- Personal rental history is private
- Spending data is confidential
- Payment reminders are user-specific
- Favorites are not visible to others

---

## 🚀 Future Enhancements

Planned improvements:
1. **Email/SMS Notifications**: Automatic payment reminders
2. **Calendar Integration**: Sync payment dates to calendar
3. **Recurring Payments**: Set up auto-pay
4. **Expense Export**: Download spending reports
5. **Budget Alerts**: Notify when exceeding budget
6. **Rental Comparison**: Compare past rentals
7. **Review System**: Rate past rentals
8. **Wishlist Notes**: Add notes to favorites
9. **Price Alerts**: Notify on price drops
10. **Shared Favorites**: Share with family/friends

---

## 📞 Support

For issues or questions:
- Contact support through Support page
- Check USER_GUIDE.md for general help
- Review API_DOCUMENTATION.md for technical details

---

## 📝 Summary

### What Renters Can Now Do

✅ **Favorites Page**:
- View all saved properties in one place
- Remove favorites easily
- Quick access to property details
- See when properties were favorited

✅ **Enhanced Dashboard**:
- Track all rental history
- View spending analytics (monthly/yearly)
- See payment reminders automatically
- Analyze spending by property type
- Monitor active rentals
- Access quick actions

✅ **Payment Reminders**:
- Get alerts 30 days before payment due
- See urgent payments (7 days or less)
- View payment amounts and dates
- Never miss a rent payment

✅ **Spending Analytics**:
- Track monthly and yearly spending
- See spending by property type
- Calculate average rent paid
- Visualize spending trends

✅ **Rental History**:
- Complete history of all rentals
- Property details and dates
- Status tracking
- Easy access to properties

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: ✅ Complete and Functional
