# 🚀 Complete Deployment Guide: Railway + Vercel

This guide will walk you through deploying your **Housing & Rent Analyzer** project with:
- **Backend**: Django API on Railway
- **Frontend**: React app on Vercel

---

## 📋 Prerequisites

1. **Accounts Needed**:
   - [Railway Account](https://railway.app/) (GitHub login recommended)
   - [Vercel Account](https://vercel.com/) (GitHub login recommended)
   - GitHub repository with your code

2. **Local Setup Complete**:
   - Your project should work locally
   - Backend runs on `http://localhost:8000`
   - Frontend runs on `http://localhost:5173`

---

## 🎯 Part 1: Backend Deployment on Railway

### Step 1: Prepare Your Backend

1. **Check your `railway.toml` file** (already exists in your project):
   ```toml
   [build]
   builder = "nixpacks"

   [deploy]
   startCommand = "cd backend && python manage.py makemigrations --no-input && python manage.py migrate --no-input && python manage.py collectstatic --no-input && python manage.py createsuperuser_auto && python manage.py runserver 0.0.0.0:$PORT"
   restartPolicyType = "on_failure"
   restartPolicyMaxRetries = 10

   [[services]]
   name = "web"
   source = "."
   [services.variables]
   PYTHON_VERSION = "3.11"
   ```

2. **Verify your `requirements.txt`**:
   ```
   Django==5.0
   djangorestframework==3.14.0
   django-cors-headers==4.3.1
   PyJWT==2.8.0
   mysqlclient==2.2.0
   python-decouple==3.8
   gunicorn==21.2.0
   ```

### Step 2: Configure Environment Variables

1. **Create `.env.example` in backend** (if not exists):
   ```env
   DEBUG=False
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=mysql://user:password@host:port/database_name
   ALLOWED_HOSTS=railway.app,localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
   ```

2. **Update Django settings** to use environment variables:
   ```python
   # In housing_analyzer/settings.py
   from decouple import config

   DEBUG = config('DEBUG', default=False, cast=bool)
   SECRET_KEY = config('SECRET_KEY')
   ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')
   ```

### Step 3: Deploy to Railway

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app/)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect your Django project

3. **Configure Database**:
   - In Railway dashboard, go to your project
   - Click "New Service" → "Add Database" → "MySQL"
   - Railway will provide a `DATABASE_URL` automatically

4. **Set Environment Variables**:
   - Go to your project settings → "Variables"
   - Add these variables:
     ```
     DEBUG=False
     SECRET_KEY=your-secure-secret-key
     ALLOWED_HOSTS=railway.app
     CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
     ```

5. **Deploy**:
   - Railway will automatically build and deploy
   - Wait for deployment to complete (green checkmark)

6. **Get Your Backend URL**:
   - Click on your backend service
   - Copy the URL (e.g., `https://your-app.railway.app`)

---

## 🎯 Part 2: Frontend Deployment on Vercel

### Step 1: Prepare Your Frontend

1. **Update API URL for production**:
   ```javascript
   // In frontend/src/services/api.js or similar
   const API_BASE_URL = import.meta.env.VITE_API_URL || 
     'http://localhost:8000/api';
   ```

2. **Create `vercel.json`** in frontend directory:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install",
     "framework": "vite"
   }
   ```

### Step 2: Configure Environment Variables

1. **Create `.env.production`** in frontend:
   ```env
   VITE_API_URL=https://your-railway-app.railway.app/api
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

### Step 3: Deploy to Vercel

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository
   - **Important**: Set root directory to `frontend`
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Set Environment Variables**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-railway-app.railway.app/api
     VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

5. **Get Your Frontend URL**:
   - Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## 🔗 Part 3: Connect Frontend & Backend

### Step 1: Update CORS Settings

1. **Go back to Railway**:
   - In your backend service settings
   - Update `CORS_ALLOWED_ORIGINS`:
     ```
     https://your-app.vercel.app
     ```

2. **Update ALLOWED_HOSTS**:
   ```
   railway.app,your-railway-app.railway.app
   ```

### Step 2: Redeploy Backend

1. **Trigger a new deployment**:
   - Either push a small change to GitHub
   - Or use Railway's "Redeploy" button

---

## ✅ Testing Your Deployment

### Step 1: Test Backend API

1. **Visit your Railway URL**:
   - `https://your-app.railway.app/api/`
   - Should see API endpoints or Django debug page

2. **Test specific endpoints**:
   - `https://your-app.railway.app/api/auth/login/`
   - `https://your-app.railway.app/api/properties/`

### Step 2: Test Frontend

1. **Visit your Vercel URL**:
   - `https://your-app.vercel.app`
   - Should see your React app

2. **Test API connection**:
   - Try to login/register
   - Check browser console for API calls

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

1. **CORS Errors**:
   - Make sure `CORS_ALLOWED_ORIGINS` includes your Vercel URL
   - Check for trailing slashes in URLs

2. **Database Connection**:
   - Verify `DATABASE_URL` is set correctly in Railway
   - Check if migrations ran successfully

3. **Build Failures**:
   - Check Railway/Vercel build logs
   - Ensure all dependencies are in `requirements.txt`/`package.json`

4. **Environment Variables**:
   - Double-check variable names (VITE_ prefix for frontend)
   - Ensure no spaces in values

### Debug Commands

```bash
# Test backend locally with production settings
cd backend
python manage.py check --deploy

# Test frontend build locally
cd frontend
npm run build
npm run preview
```

---

## 📋 Final Checklist

- [ ] Backend deployed on Railway with green status
- [ ] Database connected and migrations applied
- [ ] Frontend deployed on Vercel successfully
- [ ] CORS configured correctly
- [ ] Environment variables set on both platforms
- [ ] API calls working from frontend to backend
- [ ] User authentication working
- [ ] Static files serving correctly

---

## 🎉 You're Live!

Your Housing & Rent Analyzer is now deployed:
- **Backend**: `https://your-app.railway.app`
- **Frontend**: `https://your-app.vercel.app`

Users can now access your application from anywhere in the world!

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/5.0/howto/deployment/
- **React Deployment**: https://vitejs.dev/guide/build.html

---

**Built with ❤️ by Group 05**
