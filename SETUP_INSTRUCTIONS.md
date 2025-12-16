# Quick Setup Guide

## Step-by-Step Instructions

### 1. Open PowerShell in the backend directory
```powershell
cd "D:\DSE\Year3-S1\Web and Cloud Technology II\wctll-project2\WCTll-Project\backend"
```

### 2. Run migrations to create database tables
```powershell
python manage.py migrate
```

### 3. Populate database with mock data
```powershell
python manage.py populate_data
```

### 4. Start the backend server
```powershell
python manage.py runserver
```

### 5. In a NEW PowerShell window, start the frontend
```powershell
cd "D:\DSE\Year3-S1\Web and Cloud Technology II\wctll-project2\WCTll-Project\frontend"
npm run dev
```

## Login Credentials

After populating the database, you can login with:

### Admin Account
- Email: `admin@myrentor.com`
- Password: `admin123`
- Access: Full admin dashboard

### Property Owner Accounts
- Email: `owner1@myrentor.com` (or owner2, owner3)
- Password: `owner123`
- Access: Owner dashboard to manage properties

### Renter Accounts
- Email: `renter1@myrentor.com` (or renter2, renter3)
- Password: `renter123`
- Access: Renter dashboard to browse and favorite properties

## What You'll Get

- ✅ 10 verified properties across Cambodia
- ✅ 7 users (1 admin, 3 owners, 3 renters)
- ✅ 20+ property reviews
- ✅ Properties with images, ratings, and facilities
- ✅ Fully functional dashboards for all user types

## Troubleshooting

If you get any errors, make sure:
1. All Python packages are installed: `pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter python-decouple Pillow requests qrcode whitenoise gunicorn`
2. You're in the correct directory
3. Python is installed and in your PATH

## Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin
