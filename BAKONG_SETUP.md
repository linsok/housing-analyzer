# Bakong KHQR Payment Integration Setup Guide

This guide explains how to set up and configure Bakong KHQR payment integration for the Housing Analyzer application.

## Overview

The Bakong KHQR integration replaces the manual QR code upload system with automated KHQR code generation and instant payment verification using the National Bank of Cambodia's Bakong system.

## Prerequisites

1. **Bakong Developer Account**: You need a registered Bakong developer account
2. **Bakong API Token**: Obtain from [Bakong Developer Portal](https://api-bakong.nbc.gov.kh/register)
3. **Bank Account**: A Cambodian bank account registered with Bakong
4. **Server Requirements**: Server hosted in Cambodia (recommended for better API performance)

## Setup Instructions

### 1. Install Dependencies

The Bakong KHQR package is already included in `requirements.txt`:

```bash
pip install bakong-khqr==1.0.1
```

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Bakong KHQR Payment Configuration
BAKONG_API_TOKEN=your-bakong-developer-token-here
BAKONG_BANK_ACCOUNT=your-bank-account@bank-code
BAKONG_MERCHANT_NAME=Your Business Name
BAKONG_MERCHANT_CITY=Phnom Penh
BAKONG_PHONE_NUMBER=85512345678
```

#### Environment Variables Details:

- **BAKONG_API_TOKEN**: Your Bakong developer API token
- **BAKONG_BANK_ACCOUNT**: Your bank account in format `username@bankcode` (e.g., `john_doe@baka`)
- **BAKONG_MERCHANT_NAME**: Your business/merchant name displayed in QR codes
- **BAKONG_MERCHANT_CITY**: City where your business operates
- **BAKONG_PHONE_NUMBER**: Contact phone number (with country code 855)

### 3. Getting Your Bakong Credentials

#### Step 1: Register for Bakong Developer Access
1. Visit [Bakong Developer Portal](https://api-bakong.nbc.gov.kh/register)
2. Complete the registration process with KYC verification
3. Receive your API token

#### Step 2: Find Your Bank Account Format
1. Open the Bakong mobile app
2. Go to your profile
3. Find your account information in format `username@bankcode`
4. This is your `BAKONG_BANK_ACCOUNT` value

#### Step 3: Test Configuration
After setting up environment variables, test the integration:

```python
from payments.bakong_service import bakong_service

# Test KHQR generation
try:
    result = bakong_service.generate_qr_code(
        amount=1000,
        currency='KHR',
        property_title='Test Property',
        booking_id='TEST123',
        renter_name='Test User'
    )
    print("KHQR generated successfully!")
    print(f"MD5 Hash: {result['md5_hash']}")
except Exception as e:
    print(f"Error: {e}")
```

## Features

### 1. Automatic KHQR Generation
- Generates dynamic KHQR codes for each payment
- Includes property details and booking information
- Supports both KHR and USD currencies

### 2. Instant Payment Verification
- Real-time payment status checking
- Automatic booking confirmation upon successful payment
- No manual receipt upload required

### 3. Deep Link Integration
- Opens Bakong app directly from payment page
- Pre-fills payment information
- Improves user experience

### 4. Payment Tracking
- MD5 hash-based payment tracking
- Bulk payment verification support
- Transaction history retrieval

## API Endpoints

### Generate KHQR Code
```
POST /api/payments/generate_khqr/
```

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "KHR",
  "property_title": "Property Name",
  "booking_id": "BK123456",
  "renter_name": "John Doe"
}
```

**Response:**
```json
{
  "qr_data": "00020101021229180014user@bank52045999...",
  "md5_hash": "dfcabf4598d1c405a75540a3d4ca099d",
  "qr_image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "deeplink": "https://bakong.page.link/CgXb....ks6az9a38",
  "amount": 1000,
  "currency": "KHR",
  "merchant_name": "Your Business Name",
  "bill_number": "BK123456"
}
```

### Check Payment Status
```
POST /api/payments/check_payment_status/
```

**Request Body:**
```json
{
  "md5_hash": "dfcabf4598d1c405a75540a3d4ca099d"
}
```

**Response:**
```json
{
  "status": "PAID"  // or "UNPAID"
}
```

### Get Payment Details
```
POST /api/payments/get_payment_details/
```

**Request Body:**
```json
{
  "md5_hash": "dfcabf4598d1c405a75540a3d4ca099d"
}
```

**Response:**
```json
{
  "hash": "a7121ca103c.....eb3671b9601a6",
  "fromAccountId": "bankkhppxxx@bank",
  "toAccountId": "your_name@bank",
  "currency": "KHR",
  "amount": 1000,
  "description": "OnlinePayment",
  "createdDateMs": 1739395953000,
  "acknowledgedDateMs": 1739395954000
}
```

## Frontend Integration

The frontend `PaymentPage.jsx` automatically integrates with Bakong KHQR:

1. **QR Code Display**: Shows generated KHQR code with merchant information
2. **Payment Verification**: Real-time status checking with visual feedback
3. **Deep Links**: Direct integration with Bakong mobile app
4. **Auto-confirmation**: Instant booking confirmation upon payment

## Security Considerations

1. **API Token Security**: Keep your Bakong API token secure and never expose it in frontend code
2. **Server Location**: Consider hosting your server in Cambodia for better performance
3. **Rate Limiting**: Implement rate limiting for KHQR generation endpoints
4. **Amount Validation**: Always validate payment amounts before generating QR codes

## Troubleshooting

### Common Issues

#### 1. "Invalid Bakong API token"
- Verify your API token is correct and active
- Check if your developer account is properly verified

#### 2. "Bank account not found"
- Ensure your bank account format is correct: `username@bankcode`
- Verify your bank account is registered with Bakong

#### 3. "Failed to generate KHQR code"
- Check server internet connection
- Verify all required environment variables are set
- Check Bakong API service status

#### 4. "Payment verification timeout"
- Ensure customer has completed payment in Bakong app
- Check if MD5 hash is correct
- Verify network connectivity to Bakong API

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=True
```

This will provide detailed error messages and API response information.

## Testing

### Test Payments
Use the Bakong app's test mode to verify payments:
1. Generate a test KHQR code
2. Scan with Bakong app
3. Complete test payment
4. Verify instant booking confirmation

### Load Testing
Test with multiple concurrent payments:
```python
# Test bulk payment verification
md5_hashes = ["hash1", "hash2", "hash3"]
paid_hashes = bakong_service.check_bulk_payments(md5_hashes)
```

## Migration from Manual QR System

The Bakong integration replaces the previous manual QR upload system:

| Old System | New System |
|------------|------------|
| Property owners upload QR codes | Automatic KHQR generation |
| Manual receipt upload | Instant payment verification |
| Owner approval required | Automatic booking confirmation |
| Delayed processing | Real-time processing |

## Support

For Bakong API issues:
- Bakong Developer Documentation: https://api-bakong.nbc.gov.kh/
- Bakong GitHub: https://github.com/bsthen/bakong-khqr

For application issues:
- Check application logs
- Verify environment configuration
- Test API endpoints directly

## Compliance

This integration complies with:
- National Bank of Cambodia regulations
- Bakong KHQR standards
- Cambodian payment processing laws

Ensure your business operations comply with all local financial regulations when using this payment system.
