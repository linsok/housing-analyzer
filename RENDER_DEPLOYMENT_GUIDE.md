# Render.com Deployment Guide for Housing Analyzer

This guide will help you deploy your Django backend to Render.com - **NO CREDIT CARD REQUIRED!**

## Why Render.com?

✅ **Free tier** - No credit card needed  
✅ **Automatic deployments** from GitHub  
✅ **Free PostgreSQL database** included  
✅ **Easy setup** - No CLI installation needed  
✅ **Auto SSL certificates**  
✅ **750 hours/month** free (enough for 24/7 operation)

---

## Prerequisites

1. **GitHub Account** - You need your code on GitHub
2. **Render.com Account** - Free signup at https://render.com

---

## Step 1: Push Your Code to GitHub

If you haven't already pushed your code to GitHub:

```powershell
# Navigate to your project root
cd D:\WCT2-HOUSE-RENT\WCTll-Project

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Important**: Make sure your `.env` file is in `.gitignore` (it already is) - never push secrets to GitHub!

---

## Step 2: Sign Up for Render.com

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your repositories

---

## Step 3: Create a New Web Service

### Option A: Using Blueprint (Recommended - Easiest)

1. **Click "New +"** → **"Blueprint"**
2. **Connect your GitHub repository**
3. **Render will detect `render.yaml`** and configure everything automatically
4. **Click "Apply"**
5. **Skip to Step 5** (Environment Variables)

### Option B: Manual Setup

1. **Click "New +"** → **"Web Service"**
2. **Connect your GitHub repository**
3. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `housing-analyzer` |
   | **Region** | Choose closest to you |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `./build.sh` |
   | **Start Command** | `gunicorn housing_analyzer.wsgi:application` |
   | **Plan** | `Free` |

4. **Click "Advanced"** and add environment variables (see Step 5)

---

## Step 4: Create PostgreSQL Database

1. **Click "New +"** → **"PostgreSQL"**
2. **Configure:**
   - **Name**: `housing-analyzer-db`
   - **Database**: `housing_analyzer`
   - **User**: `housing_analyzer`
   - **Region**: Same as your web service
   - **Plan**: **Free**
3. **Click "Create Database"**
4. **Wait 2-3 minutes** for database to be ready
5. **Copy the "Internal Database URL"** (you'll need this)

---

## Step 5: Set Environment Variables

In your **Web Service** settings, go to **"Environment"** tab and add:

### Required Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `SECRET_KEY` | Generate one (see below) | Django secret key |
| `DEBUG` | `False` | Disable debug in production |
| `ALLOWED_HOSTS` | `your-app-name.onrender.com` | Your Render URL |
| `DATABASE_URL` | Paste from database | Internal Database URL |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.com` | Your frontend URL |

### Optional Variables:

| Key | Value |
|-----|-------|
| `STRIPE_PUBLIC_KEY` | Your Stripe public key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `GOOGLE_MAPS_API_KEY` | Your Google Maps API key |

### Generate SECRET_KEY:

Run this in your local terminal:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and paste it as the `SECRET_KEY` value.

---

## Step 6: Deploy!

1. **Click "Create Web Service"** (if manual setup)
2. **Or "Apply Blueprint"** (if using render.yaml)
3. **Wait 5-10 minutes** for the first deployment
4. **Watch the logs** for any errors

---

## Step 7: Verify Deployment

1. **Check the logs** - Should see "Booting worker" messages
2. **Visit your app URL**: `https://your-app-name.onrender.com`
3. **Test the API**: `https://your-app-name.onrender.com/api/`
4. **Access admin**: `https://your-app-name.onrender.com/admin/`

---

## Step 8: Create Superuser

You need to create an admin user:

1. Go to your **Web Service** dashboard
2. Click **"Shell"** tab (or use SSH)
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Follow the prompts to create your admin account

---

## Important Notes

### Free Tier Limitations

- **750 hours/month** free (enough for 24/7)
- **Spins down after 15 minutes** of inactivity
- **First request after spin-down** takes 30-60 seconds
- **100GB bandwidth/month**
- **PostgreSQL**: 1GB storage, 97 connection limit

### Automatic Deployments

- **Every push to GitHub** triggers a new deployment
- **Disable auto-deploy**: Go to Settings → Build & Deploy → Turn off "Auto-Deploy"

### Static Files

- Served by **WhiteNoise** (already configured)
- Collected during build via `build.sh`

### Media Files

- **Not persistent** on free tier
- Files uploaded will be **lost on redeploy**
- **Solution**: Use external storage like:
  - **Cloudinary** (free tier available)
  - **AWS S3**
  - **Render Disks** (paid feature)

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to your service dashboard
2. Click on the failed deployment
3. Read the logs for errors

**Common issues:**
- Missing dependencies in `requirements.txt`
- Python version mismatch
- Build script permissions

**Fix build script permissions:**
```bash
# In your local terminal
git update-index --chmod=+x backend/build.sh
git commit -m "Make build.sh executable"
git push
```

### App Won't Start

**Check logs:**
- Look for errors in the "Logs" tab
- Common issues:
  - Missing environment variables
  - Database connection errors
  - Port binding issues

**Verify environment variables:**
- Go to Environment tab
- Make sure all required variables are set
- Check for typos

### Database Connection Issues

**Verify DATABASE_URL:**
1. Go to your PostgreSQL database
2. Copy the **Internal Database URL**
3. Paste it in your web service's `DATABASE_URL` environment variable
4. Make sure it starts with `postgresql://`

### Static Files Not Loading

**Check build logs:**
- Look for "Collecting static files" message
- Should see "X static files copied"

**Verify settings:**
- `STATIC_ROOT` should be `BASE_DIR / 'staticfiles'`
- `STATICFILES_STORAGE` should use WhiteNoise

### App Spins Down (Free Tier)

**This is normal behavior:**
- Free tier apps spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Subsequent requests are fast

**Solutions:**
- Upgrade to paid tier ($7/month) for always-on
- Use a ping service (not recommended for free tier)
- Accept the spin-down behavior

---

## Monitoring & Management

### View Logs

1. Go to your service dashboard
2. Click **"Logs"** tab
3. See real-time logs

### Manual Deploy

1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Or choose a specific branch/commit

### Restart Service

1. Go to **"Settings"** tab
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**

### Shell Access

1. Go to **"Shell"** tab
2. Run Django management commands:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py shell
   ```

---

## Scaling (Paid Plans)

If you need more resources:

### Starter Plan ($7/month)
- Always-on (no spin-down)
- 512MB RAM
- Faster builds

### Standard Plan ($25/month)
- 2GB RAM
- More CPU
- Better performance

---

## Custom Domain (Optional)

1. Go to **"Settings"** tab
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Follow DNS configuration instructions
5. Free SSL certificate included!

---

## Updating Your Application

### Automatic Updates (Recommended)

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```powershell
   git add .
   git commit -m "Update feature"
   git push
   ```
3. Render automatically deploys the changes
4. Watch the deployment in the dashboard

### Manual Updates

1. Push to GitHub (without auto-deploy)
2. Go to Render dashboard
3. Click **"Manual Deploy"**
4. Choose commit to deploy

---

## Database Backups

### Free Tier
- **No automatic backups**
- Manual backup via shell:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```

### Paid Database Plans
- Automatic daily backups
- Point-in-time recovery
- Starting at $7/month

---

## Cost Optimization

### Stay on Free Tier

✅ **1 web service** (750 hours/month)  
✅ **1 PostgreSQL database** (1GB storage)  
✅ **100GB bandwidth/month**  
✅ **Auto spin-down** enabled

### When to Upgrade

- Need always-on service (no spin-down)
- Need more than 1GB database storage
- Need more than 100GB bandwidth
- Need automatic backups

---

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to GitHub
- ✅ Use Render's environment variables
- ✅ Rotate `SECRET_KEY` regularly

### Database
- ✅ Use **Internal Database URL** (not external)
- ✅ Never expose database credentials
- ✅ Use strong passwords

### HTTPS
- ✅ Render provides free SSL
- ✅ Force HTTPS in production (already configured)

---

## Next Steps After Deployment

1. ✅ **Test all API endpoints**
2. ✅ **Create superuser account**
3. ✅ **Update frontend** to use new backend URL
4. ✅ **Configure CORS** to allow frontend domain
5. ✅ **Set up media storage** (Cloudinary/S3)
6. ✅ **Monitor logs** for errors
7. ✅ **Set up custom domain** (optional)

---

## Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **Django on Render**: https://render.com/docs/deploy-django
- **PostgreSQL on Render**: https://render.com/docs/databases
- **Support**: https://render.com/support

---

## Quick Reference Commands

### Local Development
```powershell
# Run locally
python manage.py runserver

# Make migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Render Shell
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell

# Check database
python manage.py dbshell
```

### Git Commands
```powershell
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push (triggers auto-deploy)
git push
```

---

## Support

If you encounter issues:

1. **Check logs** in Render dashboard
2. **Review this guide** for common solutions
3. **Render Community**: https://community.render.com
4. **Render Support**: support@render.com

---

**You're all set! 🚀 Your Django backend will be live on Render.com with zero cost!**
