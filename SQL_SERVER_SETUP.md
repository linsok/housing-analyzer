# SQL Server Database Setup Guide

## Prerequisites

1. **SQL Server Management Studio (SSMS)** installed
2. **SQL Server** instance running
3. **ODBC Driver 17 for SQL Server** installed

## Step 1: Install ODBC Driver

### Windows
1. Download ODBC Driver 17 from: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
2. Run the installer and follow the prompts

### Verify Installation
Open Command Prompt and run:
```cmd
odbcad32
```
Check if "ODBC Driver 17 for SQL Server" appears in the list.

## Step 2: Configure SQL Server

### Create Database
1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Your database `housing_analyzer` should already exist

### Create Login and User (if needed)
```sql
-- Create a login for Django
CREATE LOGIN django_user WITH PASSWORD = 'YourSecurePassword123!';

-- Switch to housing_analyzer database
USE housing_analyzer;

-- Create user and grant permissions
CREATE USER django_user FOR LOGIN django_user;
ALTER ROLE db_owner ADD MEMBER django_user;
```

## Step 3: Configure Django Backend

### 1. Install Required Packages
Navigate to the backend directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `mssql-django==1.4` - Django SQL Server backend
- All other required packages

### 2. Create .env File
Create a `.env` file in the `backend` directory with your database credentials:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True

# Database - SQL Server Configuration
DB_NAME=housing_analyzer
DB_USER=django_user
DB_PASSWORD=YourSecurePassword123!
DB_HOST=localhost
DB_PORT=1433

# Payment
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Important:** Replace the values with your actual credentials:
- `DB_USER`: Your SQL Server username (e.g., `sa` or custom user)
- `DB_PASSWORD`: Your SQL Server password
- `DB_HOST`: Usually `localhost` or your server IP
- `DB_PORT`: Default is `1433`

### 3. Verify Database Configuration
The `settings.py` file is already configured for SQL Server:

```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': config('DB_NAME', default='housing_analyzer'),
        'USER': config('DB_USER', default='django_user'),
        'PASSWORD': config('DB_PASSWORD', default='YourSecurePassword123!'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='1433'),
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}
```

## Step 4: Run Database Migrations

### 1. Test Database Connection
```bash
cd backend
python manage.py check
```

If successful, you should see: "System check identified no issues"

### 2. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

This will create all necessary tables in your `housing_analyzer` database.

### 3. Create Superuser
```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

## Step 5: Verify in SQL Server Management Studio

1. Open SSMS
2. Connect to your server
3. Expand Databases → housing_analyzer → Tables
4. You should see all Django tables created:
   - `users_user`
   - `properties_property`
   - `bookings_booking`
   - `analytics_renttrend`
   - And many more...

## Step 6: Start the Application

### Start Backend
```bash
cd backend
python manage.py runserver
```

The backend will run on: http://localhost:8000

### Start Frontend
Open a new terminal:
```bash
cd frontend
npm install  # First time only
npm run dev
```

The frontend will run on: http://localhost:5173

## Troubleshooting

### Error: "ODBC Driver not found"
**Solution:** Install ODBC Driver 17 for SQL Server (see Step 1)

### Error: "Login failed for user"
**Solution:** 
1. Check your credentials in `.env` file
2. Verify the user exists in SQL Server
3. Ensure the user has proper permissions on the database

### Error: "Cannot open database"
**Solution:**
1. Verify the database name is correct
2. Check if SQL Server service is running
3. Ensure firewall allows connections on port 1433

### Error: "Connection timeout"
**Solution:**
1. Check if SQL Server is configured to allow remote connections
2. Verify SQL Server Browser service is running
3. Check firewall settings

## Testing the Market Trends Feature

1. Navigate to: http://localhost:5173/market-trends
2. You should see comprehensive analytics with charts:
   - Price trends over time
   - Price by city
   - Price by property type
   - Bedroom distribution
   - Furnished vs unfurnished statistics
   - Role-specific insights (for logged-in users)

## Database Backup (Recommended)

### Create Backup
```sql
BACKUP DATABASE housing_analyzer
TO DISK = 'C:\Backups\housing_analyzer.bak'
WITH FORMAT, MEDIANAME = 'SQLServerBackups', NAME = 'Full Backup of housing_analyzer';
```

### Restore Backup
```sql
RESTORE DATABASE housing_analyzer
FROM DISK = 'C:\Backups\housing_analyzer.bak'
WITH REPLACE;
```

## Additional Notes

- The project is configured to use SQL Server by default
- If you want to switch back to SQLite for development, comment out the SQL Server configuration in `settings.py` and uncomment the SQLite configuration
- Always backup your database before running migrations
- Keep your `.env` file secure and never commit it to version control

## Support

If you encounter issues:
1. Check the Django logs in the terminal
2. Check SQL Server logs in SSMS
3. Verify all environment variables are set correctly
4. Ensure all services (SQL Server, Django, React) are running
