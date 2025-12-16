# Housing & Rent Analyzer - Setup Guide

## Prerequisites

- **Python 3.10+** installed
- **Node.js 18+** and npm installed
- **MySQL 8.0+** installed and running
- **Git** (optional, for version control)

## Backend Setup (Django)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Database

Create a MySQL database:
```sql
CREATE DATABASE housing_analyzer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Create Environment File

Copy `.env.example` to `.env` and configure:
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Edit `.env` file:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True

DB_NAME=housing_analyzer
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 6. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 8. Create Media Directories
```bash
mkdir media
mkdir media/profiles
mkdir media/properties
mkdir media/documents
mkdir media/payments
mkdir media/qr_codes
```

### 9. Run Development Server
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

## Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File

Copy `.env.example` to `.env`:
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Testing the Application

### 1. Access the Application
Open your browser and navigate to `http://localhost:5173`

### 2. Create Test Accounts

**Admin Account:**
- Use the superuser account created earlier
- Access admin panel at `http://localhost:8000/admin`

**Property Owner Account:**
1. Click "Sign Up" on the homepage
2. Select "Property Owner" role
3. Fill in the registration form
4. Login with your credentials
5. Upload verification documents
6. Wait for admin approval (or approve via admin panel)

**Renter Account:**
1. Click "Sign Up" on the homepage
2. Select "Renter" role
3. Fill in the registration form
4. Login and start browsing properties

### 3. Test Core Features

**As Admin:**
- Verify property owners
- Verify properties
- Review reports
- View analytics dashboard

**As Property Owner:**
- Add new properties
- Upload property images
- View analytics
- Manage bookings
- Respond to reviews

**As Renter:**
- Browse properties
- Filter and search
- Save favorites
- Book properties or schedule visits
- Leave reviews
- Make payments

## Common Issues & Solutions

### Database Connection Error
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists: `SHOW DATABASES;`

### Port Already in Use
**Backend:**
```bash
python manage.py runserver 8001
```

**Frontend:**
```bash
npm run dev -- --port 5174
```

### CORS Errors
- Ensure backend is running
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`
- Verify API URL in frontend `.env`

### Missing Dependencies
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### Migration Errors
```bash
# Reset migrations (WARNING: This will delete all data)
python manage.py migrate --fake
python manage.py migrate --fake-initial
python manage.py migrate
```

## Production Deployment

### Backend (Django)

1. **Update Settings:**
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
```

2. **Collect Static Files:**
```bash
python manage.py collectstatic
```

3. **Use Production Server:**
```bash
gunicorn housing_analyzer.wsgi:application
```

### Frontend (React)

1. **Build for Production:**
```bash
npm run build
```

2. **Deploy `dist` folder** to your hosting service (Netlify, Vercel, etc.)

3. **Update Environment Variables** with production API URL

## Additional Configuration

### Google Maps API
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Places API
3. Add key to both backend and frontend `.env` files

### Payment Gateway (Stripe)
1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/)
2. Add keys to backend `.env` file
3. Configure webhook endpoints

## Support

For issues or questions:
- Check the documentation in `README.md`
- Review error logs in terminal
- Contact the development team

---

**Happy Coding! 🚀**
