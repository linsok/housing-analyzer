# Step-by-Step Guide: Connect to SQL Server

Follow these steps **in order**. Don't skip any step!

---

## ✅ STEP 1: Verify SQL Server is Running (DONE)

Your SQL Server Express is running! ✅

---

## ✅ STEP 2: ODBC Driver Installed (DONE)

ODBC Driver 17 for SQL Server is installed! ✅

---

## 📝 STEP 3: Update Your Database Password

1. Open this file: `backend\.env`
2. Find this line:
   ```
   DB_PASSWORD=YourPassword123
   ```
3. Replace `YourPassword123` with your actual SQL Server password
4. Save the file

**Don't know your password?** 
- If you use **Windows Authentication** (no password), tell me and I'll help you configure it differently
- If you forgot your password, you can reset it in SQL Server Management Studio

---

## 🗄️ STEP 4: Create Database in SQL Server

1. **Open SQL Server Management Studio (SSMS)**
2. **Connect** to your server:
   - Server name: `localhost\SQLEXPRESS`
   - Authentication: Choose your method (Windows or SQL Server)
   - Click **Connect**

3. **Create the database:**
   - Right-click on **Databases** in the left panel
   - Click **New Database...**
   - Database name: `housing_analyzer`
   - Click **OK**

**OR** run this SQL query in SSMS:
```sql
CREATE DATABASE housing_analyzer;
```

---

## 🐍 STEP 5: Install Python Packages

The installation is currently running in the background. Wait for it to complete.

**If it's not running**, open PowerShell in the project folder and run:
```powershell
cd backend
pip install -r requirements.txt
```

This will install:
- Django
- mssql-django (SQL Server driver)
- All other required packages

**Wait until you see "Successfully installed..."**

---

## 🧪 STEP 6: Test Database Connection

After packages are installed, run this test:

```powershell
cd backend
python test_connection.py
```

**Expected output:**
```
✅ CONNECTION SUCCESSFUL!
✅ All checks passed! Your database is ready.
```

**If you see errors:**
- Check your password in `.env` file
- Make sure database `housing_analyzer` exists
- Verify SQL Server is running

---

## 🔄 STEP 7: Run Database Migrations

This creates all the tables in your database:

```powershell
cd backend
python manage.py migrate
```

**Expected output:**
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying users.0001_initial... OK
  Applying properties.0001_initial... OK
  ... (many more lines)
```

---

## 👤 STEP 8: Create Admin User

```powershell
python manage.py createsuperuser
```

Follow the prompts:
- Username: (your choice, e.g., `admin`)
- Email: (your email)
- Password: (choose a password)
- Password (again): (repeat password)

---

## 🚀 STEP 9: Start the Backend Server

```powershell
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
```

**Keep this terminal open!** The server must run continuously.

---

## 🎨 STEP 10: Start the Frontend

**Open a NEW terminal** (don't close the backend terminal):

```powershell
cd frontend
npm install
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

## 🎉 STEP 11: Test Everything

1. **Open your browser**
2. Go to: `http://localhost:5173`
3. You should see the Housing Analyzer homepage
4. Click **Market Trends** in the navigation
5. You should see charts and analytics!

---

## 🔍 Verify Database in SSMS

1. Open SQL Server Management Studio
2. Connect to `localhost\SQLEXPRESS`
3. Expand **Databases** → **housing_analyzer** → **Tables**
4. You should see many tables like:
   - `users_user`
   - `properties_property`
   - `bookings_booking`
   - `analytics_renttrend`
   - And many more...

---

## ❌ Troubleshooting

### Problem: "Login failed for user 'sa'"
**Solution:** 
1. Your password in `.env` is wrong
2. OR SQL Server doesn't allow SQL Authentication
   - Open SSMS → Right-click server → Properties → Security
   - Select "SQL Server and Windows Authentication mode"
   - Restart SQL Server service

### Problem: "Cannot open database 'housing_analyzer'"
**Solution:** Create the database (see Step 4)

### Problem: "ODBC Driver not found"
**Solution:** Already installed! But if error persists, download from:
https://go.microsoft.com/fwlink/?linkid=2249004

### Problem: "pip: command not found"
**Solution:** Python not in PATH. Reinstall Python and check "Add to PATH"

### Problem: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

---

## 📞 Need Help?

If you're stuck on any step, tell me:
1. Which step number you're on
2. What error message you see (copy the full error)
3. Screenshot if possible

I'll help you fix it!

---

## 🎯 Current Status

- ✅ SQL Server Express running
- ✅ ODBC Driver 17 installed
- ✅ .env file created
- ⏳ Python packages installing...
- ⏳ Waiting for you to update password in .env
- ⏳ Waiting for database creation

**Next step for you:** Update the password in `backend\.env` file, then continue with Step 4!
