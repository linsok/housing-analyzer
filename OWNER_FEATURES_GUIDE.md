# Property Owner Features Guide

## Overview
This guide covers all the enhanced features available for property owners, including property management, detailed analytics, and market insights.

---

## 🏠 Add Property Feature

### Access
- **Route**: `/owner/properties/new`
- **Button Location**: Owner Dashboard → "Add Property" button (top right and Quick Actions sidebar)

### Features

#### 1. **Basic Information**
- Property title (required)
- Detailed description (required)
- Property type selection:
  - Apartment
  - House
  - Room
  - Studio
  - Condo
- Listing type: For Rent or For Sale

#### 2. **Location Details**
- Full address (required)
- City (required)
- District (optional)
- Area/Neighborhood (optional)
- Postal code (optional)

#### 3. **Pricing**
- **For Rent**:
  - Monthly rent price (USD)
  - Security deposit (optional)
- **For Sale**:
  - Sale price (USD)

#### 4. **Property Details**
- Number of bedrooms (required)
- Number of bathrooms (required)
- Area in square meters (optional)
- Floor number (optional)
- Available from date (optional)

#### 5. **Property Features**
- Furnished status (checkbox)
- Pets allowed (checkbox)
- Smoking allowed (checkbox)

#### 6. **Facilities & Amenities**
Select from 15+ amenities:
- WiFi
- Parking
- Air Conditioning
- Gym
- Swimming Pool
- Security
- Elevator
- Balcony
- Garden
- Laundry
- Kitchen
- Heating
- TV
- Refrigerator
- Washing Machine

#### 7. **House Rules**
- Free text area for custom rules
- Examples: No parties, Quiet hours, etc.

#### 8. **Property Images**
- Upload up to 10 images (required)
- First image becomes the primary image
- Image preview with ability to remove
- Supports: JPG, PNG, and other common formats

### Submission Process
1. Fill in all required fields
2. Upload at least one image
3. Submit for admin review
4. Property status will be "Pending" until admin approval
5. Owner receives notification once approved/rejected

---

## 📊 Enhanced Analytics Dashboard

### Access
- **Route**: `/owner/analytics`
- **Button Location**: 
  - Owner Dashboard → "View Detailed Analytics" button
  - Owner Dashboard → Analytics banner card

### Analytics Features

#### 1. **Overview Statistics**
Four key metric cards:
- **Total Properties**: Count with verified status
- **Total Views**: All-time property views
- **Confirmed Guests**: Total confirmed bookings with pending count
- **Total Revenue**: Earnings with occupancy rate percentage

#### 2. **Guest Analytics (Time-based)**
Interactive chart with monthly/yearly toggle:

**Monthly View (Last 12 Months)**:
- Confirmed guests per month
- Pending bookings per month
- Revenue per month
- Area chart visualization

**Yearly View (Last 3 Years)**:
- Total guests per year
- Revenue per year
- Bar chart visualization

#### 3. **Views Trend**
- Line chart showing daily views for last 30 days
- Average daily views calculation
- Helps identify traffic patterns

#### 4. **Property Performance Comparison**
Detailed table and chart showing:
- Property title
- Rent price
- Total views
- Number of bookings
- Revenue generated
- Rating (with star icon)

**Visualizations**:
- Bar chart comparing views, bookings, and revenue
- Top 5 performing properties highlighted

#### 5. **Market Pricing Comparison**
Compare your pricing against market averages:

**Overall Comparison**:
- Your average rent price
- City/market average rent price
- Visual comparison with color coding

**By Property Type**:
- Bar chart comparing your average vs market average
- Broken down by property type (apartment, house, etc.)
- Market property count for each type

**Smart Insights**:
- ⚠️ Above Market Average: Warning with percentage difference
- ✅ Competitive Pricing: Confirmation of good positioning

#### 6. **Competitor Analysis**
View top 10 competing properties in your area:

**For Each Competitor**:
- Property title
- Property type and bedroom count
- Monthly rent price
- View count
- Favorite count
- Rating

**Insights Provided**:
- Learn from successful competitors
- Analyze pricing strategies
- Understand what attracts renters

#### 7. **Performance Recommendations**
Four actionable recommendation cards:

1. **Optimize Pricing**
   - Dynamic suggestions based on market comparison
   - Advice on price adjustments

2. **Increase Visibility**
   - Tips on improving property views
   - Photo and description optimization

3. **Enhance Guest Experience**
   - Focus on ratings and reviews
   - Service quality improvements

4. **Property Updates**
   - Maintenance and amenity suggestions
   - Value-add recommendations

---

## 🏠 Owner Dashboard Enhancements

### New Features Added

#### 1. **Analytics Quick Access Banner**
- Prominent card showing occupancy rate
- Direct link to full analytics
- Gradient design for visibility

#### 2. **Updated Quick Actions Sidebar**
Three action buttons:
- Add New Property
- View Detailed Analytics (NEW)
- View Market Trends

#### 3. **Improved Property Cards**
Each property shows:
- Primary image
- Title and location
- Status badges (Available, Rented, etc.)
- Verification status (Verified, Pending, Rejected)
- View count and favorite count
- Monthly rent price
- Quick action buttons (View, Edit)

---

## 🔄 Workflow

### Adding a New Property
```
1. Owner Dashboard → Click "Add Property"
2. Fill in property details form
3. Upload images (minimum 1, maximum 10)
4. Submit for review
5. Property status: "Pending Verification"
6. Admin reviews and approves/rejects
7. Property status changes to "Verified" or "Rejected"
8. If verified, property appears in public listings
```

### Monitoring Performance
```
1. Owner Dashboard → View overview statistics
2. Click "View Detailed Analytics"
3. Toggle between monthly/yearly guest data
4. Review property performance comparison
5. Check market pricing comparison
6. Analyze competitor properties
7. Implement recommendations
8. Monitor views trend for improvements
```

---

## 📈 Key Metrics Explained

### Occupancy Rate
- Calculation: (Occupied days / Total available days) × 100
- Based on confirmed and completed bookings
- Helps measure property utilization

### Revenue
- Sum of all completed booking payments
- Tracked monthly and yearly
- Excludes pending or cancelled bookings

### Views
- Count of property detail page visits
- Tracked per property and overall
- Includes both authenticated and guest users

### Market Average
- Calculated from all verified properties in same city
- Filtered by property type when applicable
- Updated in real-time

---

## 🎯 Best Practices

### For Better Performance

1. **Quality Images**
   - Upload high-resolution photos
   - Show all rooms and amenities
   - Use natural lighting
   - First image is most important

2. **Competitive Pricing**
   - Check market comparison regularly
   - Adjust based on demand
   - Consider seasonal pricing

3. **Detailed Descriptions**
   - Highlight unique features
   - Be honest and accurate
   - Include nearby amenities
   - Mention transportation access

4. **Quick Response**
   - Reply to inquiries promptly
   - Confirm bookings quickly
   - Maintain good communication

5. **Property Maintenance**
   - Keep properties in good condition
   - Update amenities regularly
   - Address issues immediately
   - Request good reviews

---

## 🔧 Technical Details

### Backend API Endpoints

#### Add Property
- **Endpoint**: `POST /api/properties/`
- **Auth**: Required (Owner role)
- **Returns**: Property object with pending status

#### Upload Images
- **Endpoint**: `POST /api/properties/{id}/upload_images/`
- **Auth**: Required (Owner role)
- **Accepts**: Multipart form data with images

#### Owner Analytics
- **Endpoint**: `GET /api/analytics/owner-analytics/`
- **Auth**: Required (Owner role)
- **Returns**: Comprehensive analytics object

### Frontend Routes
- `/owner/dashboard` - Main dashboard
- `/owner/properties/new` - Add property form
- `/owner/analytics` - Detailed analytics page
- `/owner/properties/{id}/edit` - Edit property (existing)

### Data Refresh
- Dashboard data: Loaded on page mount
- Analytics data: Loaded on page mount
- Real-time updates: Not implemented (manual refresh required)

---

## 🐛 Troubleshooting

### Property Not Showing After Creation
- Check verification status in dashboard
- Property must be approved by admin first
- Pending properties visible only to owner

### Analytics Not Loading
- Ensure you have at least one property
- Check network connection
- Verify owner role authentication

### Image Upload Fails
- Check file size (max recommended: 5MB per image)
- Verify file format (JPG, PNG supported)
- Ensure maximum 10 images limit

### Market Comparison Shows Zero
- Requires other properties in same city
- Need verified properties for comparison
- May show zero if you're first in area

---

## 📱 Mobile Responsiveness

All features are fully responsive:
- Dashboard: Stacked layout on mobile
- Add Property Form: Single column on small screens
- Analytics Charts: Responsive containers
- Tables: Horizontal scroll on mobile

---

## 🔐 Security & Permissions

### Owner Role Required
- All owner features require authentication
- Role must be "owner" in user profile
- Protected routes redirect to login if not authenticated

### Property Ownership
- Owners can only edit their own properties
- Cannot modify other owners' listings
- Admin approval required for new listings

---

## 📞 Support

For issues or questions:
- Contact admin through support page
- Check USER_GUIDE.md for general platform help
- Review API_DOCUMENTATION.md for technical details

---

## 🚀 Future Enhancements

Planned features:
- Real-time notifications for bookings
- Automated pricing suggestions
- Calendar availability management
- Direct messaging with renters
- Bulk property upload
- Advanced reporting exports
- Mobile app integration

---

**Last Updated**: October 2025
**Version**: 2.0
