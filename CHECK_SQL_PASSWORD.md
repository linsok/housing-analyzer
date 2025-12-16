# How to Check/Set SQL Server Password

## 🔐 Two Ways to Connect to SQL Server

### Method 1: Windows Authentication (RECOMMENDED - No Password!)

This uses your Windows login. **Most common for local development.**

**How to check if you use this:**
1. Open **SQL Server Management Studio (SSMS)**
2. Look at the login screen:
   - If "Authentication" dropdown shows **"Windows Authentication"** → You use this!
   - Server name is usually: `localhost\SQLEXPRESS` or `.\SQLEXPRESS`

**✅ If you use Windows Authentication, follow these steps:**

#### Update your `.env` file:
```env
# Use Windows Authentication (Trusted Connection)
DB_NAME=housing_analyzer
DB_USER=
DB_PASSWORD=
DB_HOST=localhost\SQLEXPRESS
DB_PORT=1433
USE_WINDOWS_AUTH=True
```

---

### Method 2: SQL Server Authentication (Uses Password)

This requires a username (like `sa`) and password.

**How to check if you use this:**
1. Open **SQL Server Management Studio (SSMS)**
2. Look at the login screen:
   - If "Authentication" dropdown shows **"SQL Server Authentication"** → You use this!
   - You need to enter username and password

---

## 🔍 How to Find/Reset SQL Server Password

### If You Forgot Your `sa` Password:

#### Option A: Reset Password Using Windows Authentication

1. **Open SSMS**
2. **Connect using Windows Authentication** first
3. **Expand** Security → Logins
4. **Right-click** on `sa` → Properties
5. **Click** "Password" in left panel
6. **Enter new password** (twice)
7. **Click OK**

#### Option B: Reset via SQL Query

1. **Connect to SSMS** using Windows Authentication
2. **Open New Query**
3. **Run this SQL:**

```sql
-- Reset sa password
ALTER LOGIN sa WITH PASSWORD = 'NewPassword123!';
GO

-- Enable sa login (if disabled)
ALTER LOGIN sa ENABLE;
GO
```

---

## 🎯 Quick Test: Which Method Do You Use?

### Test 1: Try Connecting in SSMS

1. **Open SQL Server Management Studio**
2. **Try connecting with these settings:**

**Test A - Windows Authentication:**
- Server name: `localhost\SQLEXPRESS`
- Authentication: `Windows Authentication`
- Click **Connect**

**If this works** → You use Windows Authentication! ✅

**Test B - SQL Server Authentication:**
- Server name: `localhost\SQLEXPRESS`
- Authentication: `SQL Server Authentication`
- Login: `sa`
- Password: (try your password)
- Click **Connect**

**If this works** → You use SQL Server Authentication with password! ✅

---

## 🚀 Configure Your Project

### For Windows Authentication (No Password):

**Update `backend\.env`:**
```env
DB_NAME=housing_analyzer
DB_USER=
DB_PASSWORD=
DB_HOST=localhost\SQLEXPRESS
DB_PORT=1433
```

**Update `backend\housing_analyzer\settings.py`:**

Find the DATABASES section (around line 80) and replace with:

```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': config('DB_NAME', default='housing_analyzer'),
        'HOST': config('DB_HOST', default='localhost\\SQLEXPRESS'),
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'trusted_connection': 'yes',  # This enables Windows Authentication
        },
    }
}
```

---

### For SQL Server Authentication (With Password):

**Update `backend\.env`:**
```env
DB_NAME=housing_analyzer
DB_USER=sa
DB_PASSWORD=YourActualPassword123!
DB_HOST=localhost\SQLEXPRESS
DB_PORT=1433
```

Keep the settings.py as is (it's already configured for this).

---

## 🔧 Enable SQL Server Authentication (If Needed)

If SQL Server Authentication doesn't work:

1. **Open SSMS** (using Windows Authentication)
2. **Right-click** on your server name (top of tree)
3. **Click** Properties
4. **Click** Security (left panel)
5. **Select** "SQL Server and Windows Authentication mode"
6. **Click OK**
7. **Restart SQL Server:**
   - Open Services (Win + R, type `services.msc`)
   - Find "SQL Server (SQLEXPRESS)"
   - Right-click → Restart

---

## 📝 Summary

**Most Common Setup for Local Development:**
- ✅ Use **Windows Authentication** (no password needed)
- ✅ Server: `localhost\SQLEXPRESS`
- ✅ Just update settings.py to use `trusted_connection`

**Tell me which method you're using, and I'll help you configure it!**
