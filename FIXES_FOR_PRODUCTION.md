# 🔧 Production Fixes Guide

## ✅ Current Status
- ✅ Backend: Working on Railway
- ✅ Frontend: Working on Vercel  
- ✅ API Connection: Working
- ⚠️ Media Files: Some 404 errors
- ❌ Bakong Payment: Not configured

## 🛠️ Issues to Fix

### 1. Media Files (404 Errors)
**Problem**: Some property images are not loading
**Solution**: Add media URL configuration to Railway

**Add to Railway Backend Variables**:
```
RAILWAY_PUBLIC_DOMAIN=web-production-6f713.up.railway.app
```

### 2. Bakong KHQR Payment (500 Error)
**Problem**: "Bakong KHQR service is not properly configured"
**Solution**: Add Bakong environment variables

**Add to Railway Backend Variables**:
```
BAKONG_API_TOKEN=your-bakong-token
BAKONG_BANK_ACCOUNT=your-bank-account
BAKONG_MERCHANT_NAME=Housing Analyzer
BAKONG_MERCHANT_CITY=Phnom Penh
BAKONG_PHONE_NUMBER=your-phone-number
```

## 📋 Quick Fix Steps

### Step 1: Fix Media Files
1. Go to Railway → Backend service → Variables
2. Add: `RAILWAY_PUBLIC_DOMAIN=web-production-6f713.up.railway.app`
3. Save and wait for redeployment

### Step 2: Configure Bakong (Optional)
If you want KHQR payments to work:
1. Get Bakong API credentials from NBC Bank
2. Add the 5 Bakong variables above
3. Save and wait for redeployment

### Step 3: Update Frontend CORS
Add your Vercel URL to Railway CORS settings:
```
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

## 🎯 Expected Results

After fixes:
- ✅ All property images should load
- ✅ KHQR payment should work (if configured)
- ✅ No more 404/500 errors
- ✅ Fully functional housing platform

## 🚀 Your Live URLs

- **Backend**: https://web-production-6f713.up.railway.app
- **Frontend**: https://your-vercel-app.vercel.app
- **Admin**: https://web-production-6f713.up.railway.app/admin/

## 📞 Need Help?

- For Bakong API: Contact National Bank of Cambodia
- For Railway issues: Check deployment logs
- For frontend issues: Check browser console

---

**Your Housing & Rent Analyzer is 95% complete!** 🎉
