# 🚀 AWS Singapore Deployment Step-by-Step Guide

## Step 1: Create AWS Account

### 1.1 Sign Up for AWS
1. Go to: https://aws.amazon.com
2. Click "Create an AWS Account"
3. Fill in your information:
   - **Email**: Use your email
   - **Password**: Create strong password
   - **Account Name**: "Housing Analyzer" or your name
4. **Choose**: Personal Account
5. **Phone Verification**: Enter your phone number
6. **Payment Method**: Add credit card (required for free tier)

### 1.2 Verify Identity
- AWS may ask for ID verification
- Upload ID card or passport
- Wait 1-2 hours for approval

### 1.3 Choose Free Tier
- Select "Free Tier" plan
- You get 12 months free + 750 hours/month EC2

---

## Step 2: Setup AWS CLI

### 2.1 Install AWS CLI
**Windows:**
```bash
# Download and install AWS CLI
# https://aws.amazon.com/cli/
```

**Mac/Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2.2 Configure AWS CLI
```bash
aws configure
```
Enter your credentials (from AWS console):
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: `ap-southeast-1` (Singapore)
- **Default output format**: `json`

---

## Step 3: Create Security Group

### 3.1 Create Security Group
```bash
aws ec2 create-security-group --group-name "housing-analyzer-sg" --description "Security group for Housing Analyzer" --region ap-southeast-1
```

### 3.2 Add Inbound Rules
```bash
# Allow HTTP (port 80)
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 80 --cidr 0.0.0.0/0 --region ap-southeast-1

# Allow HTTPS (port 443)
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 443 --cidr 0.0.0.0/0 --region ap-southeast-1

# Allow SSH (port 22)
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 22 --cidr 0.0.0.0/0 --region ap-southeast-1

# Allow Django (port 8000)
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 8000 --cidr 0.0.0.0/0 --region ap-southeast-1
```

---

## Step 4: Launch EC2 Instance

### 4.1 Create EC2 Instance
```bash
aws ec2 run-instances \
  --image-id ami-0b5eea76982371e70 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --region ap-southeast-1 \
  --user-data file://user-data.sh
```

### 4.2 Create User Data Script
Create `user-data.sh`:
```bash
#!/bin/bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx git -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
cd /home/ubuntu
git clone https://github.com/linsok/housing-analyzer.git

# Create docker-compose.yml
cd housing-analyzer
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: housing_analyzer
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:password@db:5432/housing_analyzer
      - SECRET_KEY=your-secret-key-here
      - BAKONG_API_TOKEN=${BAKONG_API_TOKEN}
      - BAKONG_BANK_ACCOUNT=${BAKONG_BANK_ACCOUNT}
      - BAKONG_MERCHANT_NAME=${BAKONG_MERCHANT_NAME}
      - BAKONG_PHONE_NUMBER=${BAKONG_PHONE_NUMBER}
    volumes:
      - ./media:/app/media

volumes:
  postgres_data:
EOF

# Start services
sudo docker-compose up -d
```

---

## Step 5: Setup Dockerfile

### 5.1 Create Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create media directory
RUN mkdir -p /app/media

# Expose port
EXPOSE 8000

# Run migrations and start server
RUN python manage.py migrate
CMD ["gunicorn", "housing_analyzer.wsgi:application", "--bind", "0.0.0.0:8000"]
```

---

## Step 6: Configure Environment Variables

### 6.1 Create .env file
```bash
# On your EC2 instance
cd /home/ubuntu/housing-analyzer
nano .env
```

Add your environment variables:
```env
# Django Settings
SECRET_KEY=your-very-secret-key-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=your-ec2-ip.compute.amazonaws.com,yourdomain.com

# Database
DATABASE_URL=postgresql://postgres:password@db:5432/housing_analyzer

# Bakong Configuration (Get from NBC)
BAKONG_API_TOKEN=your_real_bakong_token
BAKONG_BANK_ACCOUNT=your_real_bank_account
BAKONG_MERCHANT_NAME=Your_Merchant_Name
BAKONG_MERCHANT_CITY=Phnom Penh
BAKONG_PHONE_NUMBER=+855XXXXXXXX

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Static/Media Files
STATIC_URL=/static/
MEDIA_URL=/media/
```

---

## Step 7: Setup Nginx

### 7.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/housing-analyzer
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-ec2-ip.compute.amazonaws.com yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /media/ {
        alias /home/ubuntu/housing-analyzer/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /static/ {
        alias /home/ubuntu/housing-analyzer/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/housing-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 8: Setup SSL Certificate

### 8.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8.3 Auto-renew SSL
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Step 9: Deploy Frontend

### 9.1 Build Frontend
```bash
cd /home/ubuntu/housing-analyzer/frontend
npm install
npm run build
```

### 9.2 Serve Frontend with Nginx
Update Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    location / {
        root /home/ubuntu/housing-analyzer/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Media files
    location /media/ {
        alias /home/ubuntu/housing-analyzer/media/;
    }
}
```

---

## Step 10: Test Bakong Integration

### 10.1 Check IP Location
```bash
curl ipinfo.io
```
Should show Singapore or Cambodia IP.

### 10.2 Test Bakong API
```bash
# Test Bakong connection
curl -X POST https://api.bakong.gov.kh/v1/check_payment \
  -H "Authorization: Bearer $BAKONG_API_TOKEN" \
  -d '{"md5_hash": "test"}'
```

---

## Step 11: Go Live!

### 11.1 Final Checks
- [ ] Backend running on port 8000
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Frontend built and served
- [ ] Bakong API working
- [ ] Database connected

### 11.2 Update Domain
1. Buy domain (Namecheap, GoDaddy, etc.)
2. Point DNS to EC2 IP
3. Update ALLOWED_HOSTS in Django
4. Update CORS settings

### 11.3 Monitor Performance
```bash
# Check logs
sudo docker-compose logs -f

# Check server status
sudo systemctl status nginx
```

---

## 🎯 Success Metrics

When done:
- ✅ Real Bakong QR codes generate
- ✅ Real payment verification works
- ✅ HTTPS://yourdomain.com works
- ✅ Public can access from Cambodia
- ✅ SSL certificate valid
- ✅ Fast loading times

## 💰 Cost Breakdown

- **EC2 t3.micro**: ~$10/month
- **RDS PostgreSQL**: ~$15/month
- **Domain**: ~$12/year
- **SSL**: Free
- **Total**: ~$25/month

## 🚀 Next Steps

1. **Complete AWS setup** (1-2 days)
2. **Contact NBC for Bakong API** (2-3 days)
3. **Test and go live** (1 day)
4. **Monitor and optimize** (ongoing)

---

**Your Housing & Rent Analyzer will be live with real Bakong payments!** 🇰🇭✨
