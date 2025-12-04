# Fly.io Deployment Guide for Housing Analyzer

This guide will help you deploy your Django backend to Fly.io.

## Prerequisites

1. **Install Fly.io CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Verify installation
   fly version
   ```

2. **Create Fly.io Account**
   ```bash
   fly auth signup
   # Or login if you already have an account
   fly auth login
   ```

## Deployment Steps

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Launch Your App on Fly.io
```bash
fly launch
```

When prompted:
- **App name**: Choose a unique name (e.g., `housing-analyzer-yourname`)
- **Region**: Choose closest to your users (e.g., `sin` for Singapore)
- **PostgreSQL database**: **YES** - Select "Yes" to create a PostgreSQL database
- **Redis**: **NO** - Not needed for this project
- **Deploy now**: **NO** - We need to set environment variables first

### 3. Set Environment Variables (Secrets)

```bash
# Required: Django Secret Key (generate a new one for production)
fly secrets set SECRET_KEY="your-super-secret-key-here-change-this"

# Required: Disable Debug mode in production
fly secrets set DEBUG=False

# Required: Set allowed hosts (replace with your actual fly.io domain)
fly secrets set ALLOWED_HOSTS="your-app-name.fly.dev,localhost,127.0.0.1"

# Required: CORS origins (add your frontend URL)
fly secrets set CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com,http://localhost:3000,http://localhost:5173"

# Optional: Payment settings (if using Stripe)
fly secrets set STRIPE_PUBLIC_KEY="your-stripe-public-key"
fly secrets set STRIPE_SECRET_KEY="your-stripe-secret-key"

# Optional: Google Maps API
fly secrets set GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

**Note**: The `DATABASE_URL` will be automatically set by Fly.io when you create the PostgreSQL database.

### 4. Create PostgreSQL Database

If you didn't create it during `fly launch`, create it now:

```bash
fly postgres create
```

Then attach it to your app:

```bash
fly postgres attach <postgres-app-name>
```

This will automatically set the `DATABASE_URL` secret.

### 5. Update fly.toml (if needed)

The `fly.toml` file has been created. You may want to adjust:
- `app` name
- `primary_region`
- Memory/CPU settings based on your needs

### 6. Deploy Your Application

```bash
fly deploy
```

This will:
- Build your Docker image
- Push it to Fly.io
- Deploy your application
- Run migrations automatically

### 7. Run Database Migrations

After first deployment:

```bash
fly ssh console
python manage.py migrate
python manage.py createsuperuser
exit
```

Or use:
```bash
fly ssh console -C "python manage.py migrate"
fly ssh console -C "python manage.py createsuperuser"
```

### 8. Access Your Application

```bash
# Open your app in browser
fly open

# View logs
fly logs

# Check app status
fly status

# SSH into your app
fly ssh console
```

## Database Configuration

Your app is configured to use:
- **PostgreSQL** on Fly.io (production) - automatically configured via `DATABASE_URL`
- **SQL Server** locally (development) - configured via `.env` file

The `settings.py` automatically detects which database to use based on the `DATABASE_URL` environment variable.

## Scaling Your Application

```bash
# Scale to 2 instances
fly scale count 2

# Scale memory
fly scale memory 1024

# Scale VM size
fly scale vm shared-cpu-2x
```

## Monitoring and Debugging

```bash
# View real-time logs
fly logs

# Check app metrics
fly dashboard

# SSH into running instance
fly ssh console

# Restart app
fly apps restart
```

## Important Notes

### Static Files
- Static files are served by WhiteNoise
- They're collected during Docker build: `python manage.py collectstatic --noinput`
- Accessible at `/static/` URL

### Media Files
- Media files are stored in the container's `/app/media` directory
- **Warning**: Files uploaded to Fly.io containers are ephemeral
- For persistent media storage, consider using:
  - AWS S3
  - Cloudinary
  - Fly.io Volumes (for persistent storage)

### Using Fly.io Volumes for Media Files

If you need persistent media storage:

```bash
# Create a volume
fly volumes create media_data --size 10

# Update fly.toml to mount the volume
# Add this section:
# [mounts]
#   source = "media_data"
#   destination = "/app/media"
```

### Environment Variables

All sensitive data should be stored as secrets:
```bash
fly secrets list  # View all secrets
fly secrets set KEY=VALUE  # Set a secret
fly secrets unset KEY  # Remove a secret
```

## Troubleshooting

### Build Fails
```bash
# Check build logs
fly logs

# Try local Docker build first
docker build -t housing-analyzer .
docker run -p 8000:8000 housing-analyzer
```

### Database Connection Issues
```bash
# Check if DATABASE_URL is set
fly ssh console -C "env | grep DATABASE_URL"

# Verify database is attached
fly postgres list
```

### App Won't Start
```bash
# Check logs
fly logs

# Verify health checks
fly checks list

# SSH into container
fly ssh console
```

### Static Files Not Loading
```bash
# Verify static files were collected
fly ssh console -C "ls -la /app/staticfiles"

# Check STATIC_ROOT setting
fly ssh console -C "python manage.py diffsettings | grep STATIC"
```

## Cost Optimization

Fly.io offers:
- **Free tier**: 3 shared-cpu-1x VMs with 256MB RAM each
- **Auto-stop machines**: Configured in `fly.toml` to stop when idle
- **Auto-start machines**: Starts on incoming requests

Your current configuration uses:
- 1 shared CPU
- 512MB RAM
- Auto-stop/start enabled

## Updating Your Application

```bash
# Make changes to your code
# Then deploy
fly deploy

# Or deploy with specific Dockerfile
fly deploy --dockerfile Dockerfile
```

## Custom Domain

```bash
# Add custom domain
fly certs create yourdomain.com

# Add DNS records as instructed
# Then verify
fly certs show yourdomain.com
```

## Backup Database

```bash
# Create backup
fly postgres backup create -a <postgres-app-name>

# List backups
fly postgres backup list -a <postgres-app-name>
```

## Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Django on Fly.io](https://fly.io/docs/django/)
- [Fly.io PostgreSQL](https://fly.io/docs/postgres/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)

## Next Steps

1. ✅ Deploy backend to Fly.io
2. Configure frontend to use Fly.io backend URL
3. Set up custom domain (optional)
4. Configure persistent media storage (if needed)
5. Set up monitoring and alerts
6. Configure automated backups
