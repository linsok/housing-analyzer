# Render.com Quick Start Checklist

## ✅ Pre-Deployment Checklist

### Files Created (Already Done ✓)
- ✅ `backend/render.yaml` - Render configuration
- ✅ `backend/build.sh` - Build script
- ✅ `backend/Dockerfile` - Docker configuration (optional)
- ✅ `backend/.dockerignore` - Docker ignore file
- ✅ `.gitignore` - Git ignore file (protects .env)
- ✅ `backend/requirements.txt` - Python dependencies

---

## 📋 Step-by-Step Deployment

### 1. Push to GitHub (5 minutes)

```powershell
# Navigate to project root
cd D:\WCT2-HOUSE-RENT\WCTll-Project

# Check git status
git status

# If not initialized, run:
git init
git add .
git commit -m "Initial commit - Ready for Render deployment"

# Create a new repository on GitHub (https://github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**⚠️ Important**: Make sure `.env` is NOT pushed (it's in .gitignore)

---

### 2. Sign Up for Render (2 minutes)

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repositories

---

### 3. Deploy Using Blueprint (Easiest - 3 minutes)

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Select your GitHub repository
3. Render will detect `render.yaml`
4. Click **"Apply"**
5. Wait for services to be created

---

### 4. Set Environment Variables (3 minutes)

#### Generate SECRET_KEY:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### In Render Dashboard:

1. Go to your **Web Service** → **Environment** tab
2. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `SECRET_KEY` | Generated key from above | `django-insecure-abc123...` |
| `DEBUG` | `False` | `False` |
| `ALLOWED_HOSTS` | Your Render URL | `housing-analyzer.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Your frontend URL | `https://yourfrontend.com,http://localhost:3000` |

3. **Save Changes**

**Note**: `DATABASE_URL` is automatically set by Render when you create the PostgreSQL database

---

### 5. Wait for Deployment (5-10 minutes)

1. Watch the **Logs** tab
2. Look for "Build succeeded" message
3. Then "Booting worker" messages
4. Your app is live when you see "Listening on 0.0.0.0:10000"

---

### 6. Create Superuser (2 minutes)

1. Go to your **Web Service** dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Enter username, email, and password

---

### 7. Test Your Deployment (2 minutes)

Visit these URLs (replace with your actual URL):

- **API Root**: `https://your-app.onrender.com/api/`
- **Admin Panel**: `https://your-app.onrender.com/admin/`
- **Health Check**: `https://your-app.onrender.com/`

---

## 🎯 Your App URLs

After deployment, you'll have:

- **Web Service**: `https://housing-analyzer.onrender.com`
- **API Endpoint**: `https://housing-analyzer.onrender.com/api/`
- **Admin Panel**: `https://housing-analyzer.onrender.com/admin/`
- **Database**: Internal PostgreSQL (automatically connected)

---

## 🔧 Common Issues & Solutions

### Issue: Build fails with "Permission denied: build.sh"

**Solution:**
```powershell
git update-index --chmod=+x backend/build.sh
git commit -m "Make build.sh executable"
git push
```

### Issue: "No module named 'decouple'"

**Solution**: Already fixed - `python-decouple` is in `requirements.txt`

### Issue: Database connection error

**Solution**: 
1. Make sure PostgreSQL database is created
2. Verify `DATABASE_URL` is set in environment variables
3. Check database is in the same region as web service

### Issue: Static files not loading

**Solution**: Already configured with WhiteNoise - should work automatically

### Issue: CORS errors from frontend

**Solution**: Add your frontend URL to `CORS_ALLOWED_ORIGINS` environment variable

---

## 📱 Update Your Frontend

After backend is deployed, update your frontend to use the new API URL:

```javascript
// In your frontend .env or config file
VITE_API_URL=https://housing-analyzer.onrender.com/api
```

---

## 🚀 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Test all API endpoints
3. ✅ Create superuser
4. ✅ Update frontend API URL
5. ✅ Deploy frontend (Vercel/Netlify)
6. ✅ Update CORS settings with frontend URL
7. ✅ Set up media storage (Cloudinary)

---

## 💰 Free Tier Limits

Your app will run **completely free** with:

- ✅ 750 hours/month (24/7 operation)
- ✅ 1GB PostgreSQL database
- ✅ 100GB bandwidth/month
- ⚠️ Spins down after 15 min inactivity (first request takes 30-60s)

---

## 📚 Documentation

- **Full Guide**: See `RENDER_DEPLOYMENT_GUIDE.md`
- **Render Docs**: https://render.com/docs
- **Django on Render**: https://render.com/docs/deploy-django

---

## ✨ That's It!

Your Django backend will be live on Render.com with:
- ✅ Free hosting
- ✅ PostgreSQL database
- ✅ Automatic HTTPS
- ✅ Auto-deployments from GitHub
- ✅ No credit card required

**Total Time**: ~20 minutes from start to finish!
