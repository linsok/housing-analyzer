# 🎉 Housing Analyzer - Complete User Guide

## 🚀 Project is Running!

**Backend:** http://localhost:8000  
**Frontend:** http://localhost:5173  
**Admin Panel:** http://localhost:8000/admin

---

## 👥 All Users in the System

### 1. 🔑 Admin User
**Username:** `admin`  
**Password:** `admin123`  
**Role:** Administrator  
**Access:** Full system access, can manage all users and properties

**What you can do:**
- View platform-wide analytics
- Manage all users
- Verify properties
- Handle reports
- Access admin dashboard

---

### 2. 🏠 Property Owners (3 users)

#### Owner 1: John Smith
- **Username:** `john_owner`
- **Password:** `password123`
- **Email:** john@example.com
- **Properties:** Modern 2BR Apartment in BKK1, Luxury Penthouse in BKK3

#### Owner 2: Sarah Johnson
- **Username:** `sarah_owner`
- **Password:** `password123`
- **Email:** sarah@example.com
- **Properties:** Spacious Villa with Pool in Toul Kork

#### Owner 3: Mike Williams
- **Username:** `mike_owner`
- **Password:** `password123`
- **Email:** mike@example.com
- **Properties:** Cozy Studio in Riverside, 3BR Condo in Diamond Island, Affordable 1BR in Toul Tumpung

**What owners can do:**
- List properties
- Manage bookings
- View property performance
- See analytics for their properties
- Respond to reviews

---

### 3. 🏘️ Renters (4 users)

#### Renter 1: Alice Brown
- **Username:** `alice_renter`
- **Password:** `password123`
- **Email:** alice@example.com
- **Status:** Has active booking for Modern 2BR Apartment

#### Renter 2: Bob Davis
- **Username:** `bob_renter`
- **Password:** `password123`
- **Email:** bob@example.com
- **Status:** Completed booking for Cozy Studio

#### Renter 3: Carol Wilson
- **Username:** `carol_renter`
- **Password:** `password123`
- **Email:** carol@example.com
- **Status:** Has pending visit for 3BR Condo

#### Renter 4: David Taylor
- **Username:** `david_renter`
- **Password:** `password123`
- **Email:** david@example.com
- **Status:** New user, no bookings yet

**What renters can do:**
- Search properties
- Book properties
- Leave reviews
- Save favorites
- View market trends
- See personalized recommendations

---

## 🏢 Properties in the System

### 1. Modern 2BR Apartment in BKK1
- **Owner:** John Smith
- **Price:** $800/month
- **Type:** Apartment
- **Bedrooms:** 2
- **Status:** Rented (by Alice)
- **Rating:** ⭐⭐⭐⭐⭐ (5.0)

### 2. Spacious Villa with Pool in Toul Kork
- **Owner:** Sarah Johnson
- **Price:** $2,500/month
- **Type:** House
- **Bedrooms:** 4
- **Status:** Available
- **Features:** Pool, Garden, Pet-friendly

### 3. Cozy Studio in Riverside
- **Owner:** Mike Williams
- **Price:** $350/month
- **Type:** Studio
- **Bedrooms:** 1
- **Status:** Available
- **Rating:** ⭐⭐⭐⭐ (4.0)

### 4. 3BR Condo in Diamond Island
- **Owner:** Mike Williams
- **Price:** $1,800/month
- **Type:** Condo
- **Bedrooms:** 3
- **Status:** Available (Visit scheduled)

### 5. Affordable 1BR in Toul Tumpung
- **Owner:** Mike Williams
- **Price:** $450/month
- **Type:** Apartment
- **Bedrooms:** 1
- **Status:** Available
- **Features:** Pet-friendly, Smoking allowed

### 6. Luxury Penthouse in BKK3
- **Owner:** John Smith
- **Price:** $3,000/month
- **Type:** Apartment
- **Bedrooms:** 3
- **Status:** Available
- **Features:** Penthouse, Terrace, City views

---

## 🎯 How to Access Different Views

### As Admin
1. Go to http://localhost:5173
2. Click **Login**
3. Enter: `admin` / `admin123`
4. You'll see:
   - Admin Dashboard
   - Platform statistics
   - User management
   - Property verification
   - Market Trends with admin analytics

### As Property Owner
1. Go to http://localhost:5173
2. Click **Login**
3. Enter: `john_owner` / `password123` (or any owner)
4. You'll see:
   - Owner Dashboard
   - Your properties
   - Booking requests
   - Property performance analytics
   - Market Trends with owner-specific data

### As Renter
1. Go to http://localhost:5173
2. Click **Login**
3. Enter: `alice_renter` / `password123` (or any renter)
4. You'll see:
   - Renter Dashboard
   - Browse properties
   - Your bookings
   - Favorites
   - Market Trends with recommendations

### As Guest (Not Logged In)
1. Go to http://localhost:5173
2. Browse without logging in
3. You'll see:
   - Public property listings
   - Market Trends (general analytics)
   - About Us
   - Support

---

## 📊 View All Users in Database

### Option 1: Django Admin Panel
1. Go to http://localhost:8000/admin
2. Login with: `admin` / `admin123`
3. Click on **Users** under "USERS"
4. You'll see a list of all users with:
   - Username
   - Email
   - Role
   - Status
   - Actions (Edit, Delete)

### Option 2: SQL Server Management Studio
1. Open **SQL Server Management Studio**
2. Connect to `localhost\SQLEXPRESS`
3. Expand: Databases → housing_analyzer → Tables
4. Right-click on `users_user` → Select Top 1000 Rows
5. You'll see all user data

### Option 3: Python Shell
```bash
cd backend
python manage.py shell
```

Then run:
```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Show all users
for user in User.objects.all():
    print(f"{user.username} - {user.role} - {user.email}")

# Count by role
print(f"\nAdmins: {User.objects.filter(role='admin').count()}")
print(f"Owners: {User.objects.filter(role='owner').count()}")
print(f"Renters: {User.objects.filter(role='renter').count()}")
```

---

## 🎨 Features to Explore

### 1. Market Trends Page
- **URL:** http://localhost:5173/market-trends
- **Features:**
  - Price trends over time (Area chart)
  - Price by city (Composed chart)
  - Price by property type (Bar chart)
  - Price distribution (Pie chart)
  - Bedroom distribution (Bar chart)
  - Furnished vs Unfurnished (Pie chart)
  - Role-specific analytics

### 2. Property Listings
- **URL:** http://localhost:5173/properties
- **Features:**
  - Search and filter
  - View property details
  - Book properties
  - Save favorites

### 3. Dashboards
- **Admin:** http://localhost:5173/admin-dashboard
- **Owner:** http://localhost:5173/owner-dashboard
- **Renter:** http://localhost:5173/renter-dashboard

---

## 🔧 Useful Commands

### View Database Tables
```bash
cd backend
python manage.py dbshell
```

Then run SQL:
```sql
-- Count users by role
SELECT role, COUNT(*) as count 
FROM users_user 
GROUP BY role;

-- List all properties
SELECT title, rent_price, city, status 
FROM properties_property;

-- List all bookings
SELECT * FROM bookings_booking;
```

### Add More Data
```bash
cd backend
python populate_data.py
```

### Reset Database (if needed)
```bash
cd backend
python manage.py flush
python populate_data.py
```

---

## 📱 Test Different User Experiences

### Test as Owner (John)
1. Login as `john_owner`
2. Go to Owner Dashboard
3. See your 2 properties
4. Check property performance
5. View Market Trends (see owner-specific analytics)

### Test as Renter (Alice)
1. Login as `alice_renter`
2. Go to Renter Dashboard
3. See your active booking
4. Browse properties
5. View Market Trends (see personalized recommendations)

### Test as Admin
1. Login as `admin`
2. Go to Admin Dashboard
3. See platform statistics
4. Manage users at http://localhost:8000/admin
5. View Market Trends (see platform-wide analytics)

---

## 🎉 Summary

**Total Users:** 9
- 1 Admin
- 3 Property Owners
- 5 Renters (including admin can act as renter)

**Total Properties:** 6
**Total Bookings:** 3
**Total Reviews:** 2

**All passwords:** `password123` (except admin: `admin123`)

---

## 🆘 Need Help?

- Backend not starting? Check if port 8000 is free
- Frontend not starting? Check if port 5173 is free
- Can't login? Use the credentials above
- Database issues? Check SQL Server is running
- Want to see raw data? Use SSMS or Django admin panel

**Enjoy exploring your Housing Analyzer project!** 🏠✨
