"""
Test Bakong Library with Real Token
"""

import os
from django.conf import settings

def test_bakong_library():
    """Test if bakong-khqr library works with real token"""
    
    print("=== TESTING BAKONG LIBRARY ===")
    
    # Get token
    token = os.getenv('BAKONG_API_TOKEN') or getattr(settings, 'BAKONG_API_TOKEN', None)
    bank_account = os.getenv('BAKONG_BANK_ACCOUNT') or getattr(settings, 'BAKONG_BANK_ACCOUNT', None)
    
    print(f"Token: {token[:20] if token else 'NONE'}...")
    print(f"Bank Account: {bank_account}")
    
    if not token:
        return {"error": "No token found"}
    
    if not bank_account:
        return {"error": "No bank account found"}
    
    try:
        # Test library initialization
        from bakong_khqr import KHQR
        khqr = KHQR(token)
        print("✅ Library initialized successfully")
        
        # Test QR generation
        qr_data = khqr.create_qr(
            bank_account=bank_account,
            merchant_name="SOKLIN HOUSING",
            merchant_city="Phnom Penh",
            amount=1.0,
            currency="USD",
            store_label="Test",
            phone_number="855977569023",
            bill_number="TEST123",
            terminal_label='Test',
            static=False
        )
        print(f"✅ QR data generated: {qr_data[:50]}...")
        
        # Test MD5 generation
        md5_hash = khqr.generate_md5(qr_data)
        print(f"✅ MD5 hash: {md5_hash}")
        
        # Test deeplink
        deeplink = khqr.generate_deeplink(
            qr_data,
            callback="https://test.com",
            appIconUrl="https://test.com/logo.png",
            appName="Test"
        )
        print(f"✅ Deeplink: {deeplink[:50]}...")
        
        return {
            "success": True,
            "qr_data": qr_data,
            "md5_hash": md5_hash,
            "deeplink": deeplink,
            "message": "Library works perfectly!"
        }
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return {"error": f"Library not installed: {e}"}
        
    except Exception as e:
        print(f"❌ Error: {e}")
        error_str = str(e).lower()
        
        if "cambodia" in error_str or "geographic" in error_str:
            return {
                "error": "Geographic restriction",
                "message": "Need Cambodia IP address",
                "details": str(e)
            }
        elif "token" in error_str:
            return {
                "error": "Token issue",
                "message": "Token might be invalid",
                "details": str(e)
            }
        else:
            return {
                "error": "Library error",
                "message": "Unknown error occurred",
                "details": str(e)
            }
