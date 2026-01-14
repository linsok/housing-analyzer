# Market Trends & Analytics - Feature Documentation

## Overview

The Market Trends page has been completely redesigned with comprehensive analytics and role-based insights for **Renters**, **Property Owners**, and **Admins**.

## New Features

### 1. **Enhanced Charts & Visualizations**

#### Price Trends Over Time (Area Chart)
- Shows average, minimum, and maximum rent prices over the last 6 months
- Gradient-filled area chart for better visual appeal
- Helps users understand market trends and seasonality

#### Price by City (Composed Chart)
- Combines bar chart (average price) and line chart (property count)
- Shows top 10 cities by average rent
- Dual Y-axis for better data comparison

#### Price by Property Type (Bar Chart)
- Average rent prices for different property types (House, Apartment, Condo, etc.)
- Helps users compare costs across property categories

#### Price Range Distribution (Pie Chart)
- Shows distribution of properties across price ranges:
  - Under $500
  - $500-$1000
  - $1000-$1500
  - $1500-$2000
  - $2000-$3000
  - Over $3000

#### Bedroom Distribution (Bar Chart)
- Property count by number of bedrooms
- Helps renters find properties matching their needs

#### Furnished vs Unfurnished (Pie Chart)
- Visual comparison of furnished and unfurnished properties
- Includes count and average price for each category

### 2. **Role-Based Analytics**

#### For Renters
**Personal Dashboard:**
- Total bookings count
- Active bookings
- Favorite properties count

**Personalized Recommendations:**
- Top 5 recommended properties based on ratings and views
- Quick view of property details (title, city, type, price, rating)

#### For Property Owners
**Performance Metrics:**
- Total properties owned
- Available properties
- Total views across all properties
- Average rent price

**Top Performing Properties Table:**
- Shows top 5 properties by views
- Displays: Property name, price, views, favorites, and rating
- Helps owners identify which properties are most popular

**Booking Statistics:**
- Total bookings
- Pending bookings
- Confirmed bookings

#### For Admins
**Platform Overview:**
- Total users
- Total properties
- Total bookings
- Estimated revenue

**Recent Activity (Last 30 Days):**
- New users registered
- New properties listed
- New bookings made

### 3. **Market Overview Statistics**

Four key metrics displayed at the top:
- **Average Rent Price** - Market-wide average
- **Total Properties** - Number of verified properties
- **Cities Covered** - Geographic reach
- **Property Types** - Variety of listings

## API Endpoints

### New Endpoint: `/api/analytics/market-trends/`
**Method:** GET  
**Authentication:** Optional (returns role-specific data if authenticated)

**Response Structure:**
```json
{
  "user_role": "owner|renter|admin|guest",
  "market_overview": {
    "total_properties": 150,
    "avg_rent": 850.50,
    "cities_count": 12
  },
  "price_trends": [...],
  "price_by_city": [...],
  "price_by_type": [...],
  "bedroom_distribution": [...],
  "furnished_stats": {...},
  "top_areas": [...],
  "price_distribution": [...],
  "role_specific": {...}
}
```

## Technical Implementation

### Backend Changes

**File:** `backend/analytics/views.py`
- Added `market_trends_comprehensive()` function
- Implements role-based data filtering
- Aggregates data from multiple models (Property, Booking, User)
- Calculates statistics using Django ORM aggregation

**File:** `backend/analytics/urls.py`
- Added route: `path('market-trends/', views.market_trends_comprehensive)`

**File:** `backend/requirements.txt`
- Added `mssql-django==1.4` for SQL Server support

### Frontend Changes

**File:** `frontend/src/pages/MarketTrend.jsx`
- Complete rewrite with new data structure
- Integrated with analytics API
- Added role-based conditional rendering
- Implemented 8 different chart types using Recharts library

**File:** `frontend/src/services/analyticsService.js`
- Added `getMarketTrends()` method

### Chart Library: Recharts

The following chart components are used:
- `AreaChart` - Price trends over time
- `ComposedChart` - Price by city with dual axis
- `BarChart` - Property type, bedroom distribution
- `PieChart` - Price distribution, furnished stats
- `LineChart` - Trend lines

## SQL Server Integration

### Database Configuration

**File:** `backend/settings.py`
- Already configured for SQL Server with ODBC Driver 17
- Uses environment variables for credentials

**File:** `backend/.env.example`
- Updated with SQL Server default port (1433)
- Default user changed to `sa`

### Setup Instructions

See `SQL_SERVER_SETUP.md` for detailed setup guide including:
1. ODBC Driver installation
2. Database configuration
3. User creation and permissions
4. Migration steps
5. Troubleshooting guide

## User Experience Improvements

### For All Users
- **Loading State:** Spinner while data loads
- **Error Handling:** Retry button if data fails to load
- **Responsive Design:** Works on mobile, tablet, and desktop
- **Visual Hierarchy:** Clear sections with proper headings
- **Color Coding:** Consistent color scheme across charts

### For Authenticated Users
- **Personalized Insights:** Data specific to their role
- **Quick Actions:** Direct links to relevant sections
- **Performance Tracking:** Visual representation of their activity

## Data Insights Provided

### Market Intelligence
1. **Price Trends** - Identify market direction (rising/falling)
2. **Geographic Analysis** - Compare prices across cities
3. **Property Type Analysis** - Understand demand by type
4. **Affordability Distribution** - See price range availability

### Business Intelligence (Owners)
1. **Property Performance** - Which properties get most attention
2. **Competitive Pricing** - Compare your prices to market average
3. **Demand Indicators** - Views and favorites as demand signals

### Platform Intelligence (Admins)
1. **Growth Metrics** - User and property growth trends
2. **Activity Monitoring** - Recent platform activity
3. **Revenue Tracking** - Estimated platform revenue

## Future Enhancements (Suggestions)

1. **Filters:** Add city/type filters to charts
2. **Export:** Allow users to export chart data as CSV/PDF
3. **Comparison:** Side-by-side property comparison tool
4. **Predictions:** ML-based price predictions
5. **Alerts:** Notify users of significant market changes
6. **Interactive Maps:** Geographic visualization of properties
7. **Time Range Selector:** Custom date range for trends
8. **Saved Reports:** Allow users to save custom report views

## Performance Considerations

- **Database Indexing:** Ensure indexes on `city`, `property_type`, `created_at`
- **Caching:** Consider Redis caching for frequently accessed analytics
- **Pagination:** Limit data returned for large datasets
- **Lazy Loading:** Load charts progressively as user scrolls

## Testing Checklist

- [ ] Verify charts render correctly with real data
- [ ] Test role-based data visibility
- [ ] Check responsive design on mobile devices
- [ ] Validate SQL Server connection
- [ ] Test error handling with network failures
- [ ] Verify loading states
- [ ] Check data accuracy against database
- [ ] Test with different user roles (guest, renter, owner, admin)

## Deployment Notes

1. Ensure ODBC Driver 17 is installed on production server
2. Set proper environment variables in production `.env`
3. Run migrations on production database
4. Configure SQL Server firewall rules
5. Enable SQL Server authentication mode
6. Set up database backup schedule
7. Monitor query performance and optimize as needed

## Support & Maintenance

- **Database Backups:** Daily automated backups recommended
- **Monitoring:** Set up alerts for API endpoint failures
- **Updates:** Keep `mssql-django` package updated
- **Security:** Regularly update SQL Server and apply security patches
