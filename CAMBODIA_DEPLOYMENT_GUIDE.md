# 🇰🇭 Cambodia Deployment Guide for Real Bakong Integration

## 🎯 Goal: Deploy your Housing Analyzer with real Bakong payments for public use

## 🌍 Current Status
- ✅ App works perfectly locally
- ✅ App works on Railway (but with demo Bakong)
- ❌ Real Bakong needs Cambodia IP addresses

## 🚀 Solution Options

### Option 1: AWS Singapore + Cambodia IP Range (RECOMMENDED)
**Why**: Singapore is closest to Cambodia, AWS has Cambodia IP ranges

**Steps**:
1. **Create AWS Account** (if you don't have)
2. **Deploy to Singapore Region**:
   ```bash
   # For Django Backend
   aws ec2 run-instances --region ap-southeast-1 --image-id ami-0abcdef1234567890 --instance-type t3.micro
   
   # Or use AWS App Runner (easier)
   aws apprunner create-service --region ap-southeast-1
   ```

3. **Configure Elastic IP**:
   - Request Cambodia IP range from AWS
   - Or use Singapore IP (may work with Bakong)

4. **Deploy Your App**:
   ```bash
   # Clone your repo
   git clone https://github.com/linsok/housing-analyzer.git
   
   # Setup environment
   cd housing-analyzer/backend
   pip install -r requirements.txt
   
   # Configure environment variables
   export BAKONG_API_TOKEN="your_token"
   export DATABASE_URL="your_db"
   
   # Run with gunicorn
   gunicorn housing_analyzer.wsgi:application --bind 0.0.0.0:8000
   ```

### Option 2: Cambodia VPS Providers
**Providers**:
- **Sabay Technology**: `https://sabay.com`
- **Online Technology**: `https://online.com.kh`
- **Cambodia Data Center**: `https://cdc.com.kh`

**Benefits**:
- ✅ Real Cambodia IP addresses
- ✅ Guaranteed Bakong API access
- ✅ Local support

### Option 3: Railway + Cambodia Proxy
**Setup**:
1. Keep Railway for main app
2. Set up Cambodia proxy for Bakong only
3. Route Bakong requests through proxy

## 🔧 Environment Variables for Production

```bash
# Bakong Configuration (Get from NBC)
BAKONG_API_TOKEN=your_real_bakong_token
BAKONG_BANK_ACCOUNT=your_real_bank_account
BAKONG_MERCHANT_NAME=Your_Merchant_Name
BAKONG_MERCHANT_CITY=Phnom Penh
BAKONG_PHONE_NUMBER=+855XXXXXXXX

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Django Settings
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## 📋 Getting Bakong API Credentials

### Contact National Bank of Cambodia:
- **Email**: `bakong@nbc.gov.kh`
- **Phone**: `+855 23 426 678`
- **Website**: `https://bakong.gov.kh`

### Required Documents:
1. **Business Registration** (if company)
2. **ID Card/Passport** (if individual)
3. **Bank Account Information**
4. **Project Description**
5. **Technical Integration Plan**

### Email Template:
```
Subject: Bakong API Integration Request - Housing Analyzer Platform

Dear Bakong Team,

I am the developer of Housing & Rent Analyzer, a real estate platform in Cambodia.

Project Details:
- Platform: Housing & Rent Analyzer
- Purpose: Property rental payments
- Expected Volume: 100+ transactions/month
- Technical Stack: Django + React
- Current Status: Fully developed, ready for production

We would like to integrate Bakong KHQR payments for our users. Please provide:
1. API documentation
2. Test credentials
3. Production access requirements

Thank you,
[Your Name]
[Your Contact]
[Your Website]
```

## 🚀 Quick Deployment Steps

### Step 1: Choose Hosting Provider
- **AWS Singapore** (recommended for scalability)
- **Cambodia VPS** (recommended for Bakong compatibility)

### Step 2: Setup Server
```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Python & dependencies
sudo apt install python3 python3-pip python3-venv nginx -y

# Clone your project
git clone https://github.com/linsok/housing-analyzer.git
cd housing-analyzer/backend

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup environment variables
nano .env
```

### Step 3: Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /media/ {
        alias /path/to/your/media/;
    }
}
```

### Step 4: Setup SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

### Step 5: Deploy Frontend
```bash
# Build React app
cd frontend
npm run build

# Deploy to Vercel or same server
vercel --prod
```

## 🎯 Expected Timeline

1. **Day 1**: Choose hosting, setup server
2. **Day 2**: Contact NBC for Bakong API
3. **Day 3-5**: Get API credentials
4. **Day 6**: Configure and test
5. **Day 7**: Go live! 🎉

## 💰 Cost Estimates

### AWS Singapore:
- **Server**: $5-20/month (t3.micro to t3.small)
- **Database**: $15-50/month (RDS)
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$20-70/month

### Cambodia VPS:
- **Server**: $30-100/month
- **Support**: Included
- **Bakong Access**: Guaranteed
- **Total**: ~$30-100/month

## 🎉 Success Criteria

When deployed:
- ✅ Real Bakong QR codes generate
- ✅ Real payment verification works
- ✅ Users can pay with KHQR
- ✅ Public can access your app
- ✅ SSL certificate installed
- ✅ Domain name configured

## 📞 Need Help?

- **For Bakong API**: Contact NBC
- **For AWS**: AWS Support
- **For Cambodia Hosting**: Local providers
- **For Technical Issues**: I'm here to help! 🚀

---

**Your Housing & Rent Analyzer can be live with real Bakong payments in 1 week!** 🇰🇭✨
