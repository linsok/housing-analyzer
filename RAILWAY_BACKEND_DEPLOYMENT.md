# Railway Backend-Only Deployment Guide

## Overview
This guide covers deploying only the Django backend to Railway, with the frontend hosted separately (e.g., Vercel, Netlify).

## Prerequisites
- Railway account
- GitHub repository with this code
- Railway CLI (optional)

## Configuration Files

### 1. railway.toml
The `railway.toml` file is configured for backend-only deployment:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd backend && python deploy_media.py && python manage.py migrate --no-input && python manage.py collectstatic --no-input && gunicorn housing_analyzer.wsgi:application --bind 0.0.0.0:$PORT --workers 3"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
healthcheckPath = "/api/health/"
healthcheckTimeout = 100

[[services]]
name = "api"
source = "backend"

[services.variables]
PYTHON_VERSION = "3.11"

# Email configuration
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = "587"
EMAIL_USE_TLS = "true"
EMAIL_HOST_USER = "thoeunsoklin1209@gmail.com"
EMAIL_HOST_PASSWORD = "yjma gzdu pfog vkkc"
DEFAULT_FROM_EMAIL = "thoeunsoklin1209@gmail.com"
```

### 2. Environment Variables
Railway will automatically use the variables defined in `railway.toml`. You can also set them in the Railway dashboard:

#### Required Variables:
- `DATABASE_URL` - MySQL/PostgreSQL connection string
- `SECRET_KEY` - Django secret key
- `DEBUG=False` - Production mode
- `RAILWAY_PUBLIC_DOMAIN` - Auto-set by Railway

#### Optional Variables:
- Email settings (already configured in railway.toml)
- `STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY`
- `GOOGLE_MAPS_API_KEY`
- Bakong payment settings

## Deployment Steps

### 1. Connect Repository to Railway
1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect the `railway.toml` configuration

### 2. Configure Database
1. Go to your project → Settings → Variables
2. Add your database URL as `DATABASE_URL`
3. Example MySQL: `mysql://username:password@host:port/database`
4. Example PostgreSQL: `postgresql://username:password@host:port/database`

### 3. Set Environment Variables
Add any additional environment variables needed:
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.railway.app,localhost
```

### 4. Deploy
1. Railway will automatically deploy on first push
2. For subsequent deployments, push to GitHub:
   ```bash
   git push origin main
   ```

## API Endpoints

Once deployed, your API will be available at:
- Base URL: `https://your-app-name.railway.app`
- API Info: `https://your-app-name.railway.app/`
- Health Check: `https://your-app-name.railway.app/api/health/`
- Django Admin: `https://your-app-name.railway.app/admin/`

### Main API Routes:
- Authentication: `/api/auth/`
- Properties: `/api/properties/`
- Bookings: `/api/bookings/`
- Analytics: `/api/analytics/`
- Payments: `/api/payments/`
- Reviews: `/api/reviews/`

## Frontend Configuration

Update your frontend API base URL to point to the Railway backend:

```javascript
// In frontend .env or config
VITE_API_URL=https://your-app-name.railway.app
```

## Monitoring and Debugging

### Health Check
- Visit `/api/health/` to check if the API is running
- Railway will automatically monitor this endpoint

### Logs
- View logs in Railway dashboard under "Logs"
- Check for email configuration output on startup

### Common Issues
1. **Database Connection**: Ensure `DATABASE_URL` is correct
2. **CORS**: Update `CORS_ALLOWED_ORIGINS` in settings
3. **Static Files**: Railway handles static files automatically
4. **Media Files**: Media files are served via `/media/` endpoint

## Maintenance

### Database Migrations
Migrations run automatically on deployment. To run manually:
```bash
# Visit: https://your-app-name.railway.app/run-migrations/
# POST request to trigger migrations
```

### Create Superuser
```bash
# Visit: https://your-app-name.railway.app/create-superuser/
# POST request to create admin user (admin/admin123)
```

### Debug Users
```bash
# Visit: https://your-app-name.railway.app/check-users/
# View all users in the system
```

## Production Considerations

1. **Security**: Ensure `DEBUG=False` in production
2. **HTTPS**: Railway provides automatic SSL
3. **Domain**: Consider custom domain for production
4. **Backups**: Set up database backups in Railway
5. **Monitoring**: Use Railway's built-in monitoring

## Email Configuration

Email is configured using Gmail SMTP. Ensure:
- Gmail account with "Less secure apps" enabled OR App Password
- Correct email settings in environment variables
- Test email functionality via admin panel

## Support

For issues:
1. Check Railway logs
2. Verify environment variables
3. Test health check endpoint
4. Review Django admin panel
5. Check CORS configuration
