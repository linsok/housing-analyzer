# 🗄️ Railway Database Setup Guide

## ✅ Current Status
- ✅ Backend deployment: **Successful**
- ✅ MySQL service: **Available**
- 🔄 Need to: **Connect backend to database**

## 📋 Steps to Connect Database

### Step 1: Get MySQL Credentials

1. **Go to your MySQL service in Railway**
2. **Click on "Connect" tab**
3. **Copy the DATABASE_URL** (it looks like):
   ```
   mysql://user:password@host:port/database
   ```

### Step 2: Set Environment Variables

1. **Go to your backend service** (web service)
2. **Click on "Variables" tab**
3. **Add these environment variables**:

#### Required Variables:
```
DATABASE_URL=mysql://user:password@host:port/database
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
ALLOWED_HOSTS=railway.app,web-production-6f713.up.railway.app
```

#### Optional Variables (for frontend):
```
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

### Step 3: Test the Connection

1. **Save the variables**
2. **Railway will automatically redeploy**
3. **Wait 2-3 minutes for deployment**
4. **Test your API**: `https://web-production-6f713.up.railway.app/api/`

## 🔍 Testing Your Backend

### Test API Endpoints:
- **API Info**: `https://web-production-6f713.up.railway.app/`
- **Admin Panel**: `https://web-production-6f713.up.railway.app/admin/`
- **Auth Endpoints**: `https://web-production-6f713.up.railway.app/api/auth/`

### Expected Response:
You should see a JSON response like:
```json
{
    "message": "Housing & Rent Analyzer API",
    "version": "1.0.0",
    "endpoints": {
        "admin": "/admin/",
        "auth": "/api/auth/",
        "properties": "/api/properties/",
        ...
    }
}
```

## 🚨 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: 
- Verify DATABASE_URL is correct
- Check if MySQL service is running
- Make sure user has permissions

### Issue: "502 Bad Gateway"
**Solution**:
- Check deployment logs
- Ensure all environment variables are set
- Wait for full deployment

### Issue: "CORS errors"
**Solution**:
- Add your frontend URL to CORS_ALLOWED_ORIGINS
- Check frontend is calling correct backend URL

## 🎯 Next Steps After Database Connection

1. **Run migrations** (should happen automatically)
2. **Create superuser** (optional, for admin access)
3. **Test API endpoints**
4. **Deploy frontend to Vercel**
5. **Connect frontend to backend**

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Database Guide**: https://docs.railway.app/databases
- **Environment Variables**: https://docs.railway.app/develop/variables

---

**Your Backend URL**: https://web-production-6f713.up.railway.app
**Status**: ✅ Ready for database connection
