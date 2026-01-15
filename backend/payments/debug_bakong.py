"""
Debug Bakong Service to Check Variables
"""

import os
from django.conf import settings

def debug_bakong_variables():
    """Debug Bakong environment variables"""
    
    print("=== BAKONG VARIABLES DEBUG ===")
    
    # Check environment variables
    bakong_token = os.getenv('BAKONG_API_TOKEN')
    bakong_account = os.getenv('BAKONG_BANK_ACCOUNT')
    bakong_merchant = os.getenv('BAKONG_MERCHANT_NAME')
    bakong_city = os.getenv('BAKONG_MERCHANT_CITY')
    bakong_phone = os.getenv('BAKONG_PHONE_NUMBER')
    
    print(f"BAKONG_API_TOKEN: {bakong_token}")
    print(f"BAKONG_BANK_ACCOUNT: {bakong_account}")
    print(f"BAKONG_MERCHANT_NAME: {bakong_merchant}")
    print(f"BAKONG_MERCHANT_CITY: {bakong_city}")
    print(f"BAKONG_PHONE_NUMBER: {bakong_phone}")
    
    # Check Django settings
    print("\n=== DJANGO SETTINGS DEBUG ===")
    django_token = getattr(settings, 'BAKONG_API_TOKEN', None)
    django_account = getattr(settings, 'BAKONG_BANK_ACCOUNT', None)
    django_merchant = getattr(settings, 'BAKONG_MERCHANT_NAME', None)
    
    print(f"Django BAKONG_API_TOKEN: {django_token}")
    print(f"Django BAKONG_BANK_ACCOUNT: {django_account}")
    print(f"Django BAKONG_MERCHANT_NAME: {django_merchant}")
    
    # Check if token is valid
    if bakong_token:
        print(f"\nToken length: {len(bakong_token)}")
        print(f"Token starts with: {bakong_token[:10] if len(bakong_token) > 10 else 'TOO_SHORT'}")
    else:
        print("\n❌ BAKONG_API_TOKEN is None or empty!")
    
    # Check if account is valid
    if bakong_account:
        print(f"Account format: {bakong_account}")
    else:
        print("❌ BAKONG_BANK_ACCOUNT is None or empty!")
    
    print("\n=== RECOMMENDATIONS ===")
    
    if not bakong_token:
        print("❌ Add BAKONG_API_TOKEN to Railway variables")
    
    if not bakong_account:
        print("❌ Add BAKONG_BANK_ACCOUNT to Railway variables")
    
    if bakong_token and bakong_account:
        print("✅ Variables look good - checking library initialization...")
        
        try:
            from bakong_khqr import KHQR
            khqr = KHQR(bakong_token)
            print("✅ bakong-khqr library initialized successfully")
            
            # Test QR generation
            qr_data = khqr.create_qr(
                bank_account=bakong_account,
                merchant_name=bakong_merchant or "Test Merchant",
                merchant_city=bakong_city or "Phnom Penh",
                amount=1.0,
                currency="USD",
                store_label="Test",
                phone_number=bakong_phone or "+855XXXXXXXX",
                bill_number="TEST123",
                terminal_label='Test',
                static=False
            )
            print(f"✅ QR data generated: {qr_data[:100]}...")
            
        except Exception as e:
            print(f"❌ Error with bakong-khqr: {e}")
    
    return {
        'token_set': bool(bakong_token),
        'account_set': bool(bakong_account),
        'merchant_set': bool(bakong_merchant),
        'city_set': bool(bakong_city),
        'phone_set': bool(bakong_phone)
    }
