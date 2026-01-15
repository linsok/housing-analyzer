"""
Enhanced Bakong Service with Open Source Libraries
Multiple library support for robust Bakong integration
"""

import hashlib
import json
import qrcode
import io
import base64
from decimal import Decimal
from typing import Dict, Optional
from django.conf import settings
import os
import requests
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64 as b64

class EnhancedBakongService:
    """
    Enhanced Bakong service with multiple open source libraries
    """
    
    def __init__(self):
        self.token = getattr(settings, 'BAKONG_API_TOKEN', None) or os.getenv('BAKONG_API_TOKEN')
        self.bank_account = getattr(settings, 'BAKONG_BANK_ACCOUNT', None) or os.getenv('BAKONG_BANK_ACCOUNT')
        self.merchant_name = getattr(settings, 'BAKONG_MERCHANT_NAME', None) or os.getenv('BAKONG_MERCHANT_NAME', 'Housing Analyzer')
        self.merchant_city = getattr(settings, 'BAKONG_MERCHANT_CITY', None) or os.getenv('BAKONG_MERCHANT_CITY', 'Phnom Penh')
        self.phone_number = getattr(settings, 'BAKONG_PHONE_NUMBER', None) or os.getenv('BAKONG_PHONE_NUMBER')
        
        # Initialize multiple libraries
        self.khqr = None
        self.init_bakong_libraries()
    
    def init_bakong_libraries(self):
        """Initialize Bakong libraries"""
        try:
            # Try primary library (bakong-khqr)
            from bakong_khqr import KHQR
            if self.token:
                self.khqr = KHQR(self.token)
                print("✅ bakong-khqr library initialized successfully")
        except ImportError:
            print("⚠️ bakong-khqr library not available")
        except Exception as e:
            print(f"⚠️ Failed to initialize bakong-khqr: {e}")
    
    def generate_qr_code_enhanced(self, 
                                amount: Decimal, 
                                currency: str = 'KHR',
                                property_title: str = None,
                                booking_id: str = None,
                                renter_name: str = None,
                                bakong_bank_account: str = None,
                                bakong_merchant_name: str = None,
                                bakong_phone_number: str = None) -> Dict[str, str]:
        """
        Generate QR code using enhanced methods
        """
        
        # Use property-specific Bakong configuration or fallback to defaults
        bank_account = bakong_bank_account or self.bank_account
        merchant_name = bakong_merchant_name or self.merchant_name
        phone_number = bakong_phone_number or self.phone_number
        
        # Try multiple methods
        qr_result = self._try_multiple_qr_methods(
            amount, currency, property_title, booking_id, 
            renter_name, bank_account, merchant_name, phone_number
        )
        
        return qr_result
    
    def _try_multiple_qr_methods(self, amount, currency, property_title, booking_id, 
                                renter_name, bank_account, merchant_name, phone_number):
        """Try multiple QR generation methods"""
        
        # Method 1: Try bakong-khqr library
        if self.khqr and self.token:
            try:
                return self._generate_with_bakong_khqr(
                    amount, currency, property_title, booking_id,
                    renter_name, bank_account, merchant_name, phone_number
                )
            except Exception as e:
                print(f"⚠️ bakong-khqr failed: {e}")
        
        # Method 2: Try custom implementation
        try:
            return self._generate_custom_qr(
                amount, currency, property_title, booking_id,
                renter_name, bank_account, merchant_name, phone_number
            )
        except Exception as e:
            print(f"⚠️ Custom QR failed: {e}")
        
        # Method 3: Fallback to demo
        return self._generate_demo_qr(
            amount, currency, property_title, booking_id,
            renter_name, bank_account, merchant_name, phone_number
        )
    
    def _generate_with_bakong_khqr(self, amount, currency, property_title, booking_id,
                                  renter_name, bank_account, merchant_name, phone_number):
        """Generate QR using bakong-khqr library"""
        
        # Generate store label and bill number
        store_label = "HousingAnalyzer"
        bill_number = f"BK{booking_id[:8]}" if booking_id else "TRX" + str(int(amount * 100))
        
        # Create QR code data
        qr_data = self.khqr.create_qr(
            bank_account=bank_account,
            merchant_name=merchant_name,
            merchant_city=self.merchant_city,
            amount=float(amount),
            currency=currency,
            store_label=store_label,
            phone_number=phone_number,
            bill_number=bill_number,
            terminal_label='OnlinePayment',
            static=False
        )
        
        # Generate MD5 hash
        md5_hash = self.khqr.generate_md5(qr_data)
        
        # Generate QR image
        qr_image = self._generate_qr_image(qr_data)
        
        # Generate deeplink
        deeplink = self.khqr.generate_deeplink(
            qr_data,
            callback=f"https://your-domain.com/payment/verify/{md5_hash}",
            appIconUrl="https://your-domain.com/logo.png",
            appName="HousingAnalyzer"
        )
        
        return {
            'qr_data': qr_data,
            'md5_hash': md5_hash,
            'qr_image': qr_image,
            'deeplink': deeplink,
            'amount': float(amount),
            'currency': currency,
            'merchant_name': merchant_name,
            'bill_number': bill_number,
            'bank_account': bank_account,
            'method': 'bakong-khqr-library'
        }
    
    def _generate_custom_qr(self, amount, currency, property_title, booking_id,
                           renter_name, bank_account, merchant_name, phone_number):
        """Generate QR using custom implementation"""
        
        # Create custom QR data following Bakong format
        store_label = "HousingAnalyzer"
        bill_number = f"BK{booking_id[:8]}" if booking_id else "TRX" + str(int(amount * 100))
        
        # Custom QR payload
        qr_payload = {
            "version": "01",
            "type": "qrpay",
            "currency": currency,
            "amount": str(int(float(amount) * 100)),  # Convert to cents
            "merchant": {
                "name": merchant_name,
                "city": self.merchant_city,
                "account": bank_account,
                "phone": phone_number
            },
            "transaction": {
                "bill_number": bill_number,
                "store_label": store_label,
                "terminal_label": "OnlinePayment"
            },
            "timestamp": str(int(time.time()))
        }
        
        # Convert to string
        qr_string = json.dumps(qr_payload, separators=(',', ':'))
        
        # Generate MD5 hash
        md5_hash = hashlib.md5(qr_string.encode()).hexdigest()
        
        # Generate QR image
        qr_image = self._generate_qr_image(qr_string)
        
        # Generate deeplink
        deeplink = f"https://bakong.gov.kh/pay?hash={md5_hash}"
        
        return {
            'qr_data': qr_string,
            'md5_hash': md5_hash,
            'qr_image': qr_image,
            'deeplink': deeplink,
            'amount': float(amount),
            'currency': currency,
            'merchant_name': merchant_name,
            'bill_number': bill_number,
            'bank_account': bank_account,
            'method': 'custom-implementation'
        }
    
    def _generate_demo_qr(self, amount, currency, property_title, booking_id,
                         renter_name, bank_account, merchant_name, phone_number):
        """Generate demo QR for testing"""
        
        store_label = "HousingAnalyzer"
        bill_number = f"BK{booking_id[:8]}" if booking_id else "TRX" + str(int(amount * 100))
        
        # Demo QR data
        qr_data = {
            "type": "demo_khqr",
            "bank_account": bank_account or "demo_account",
            "merchant_name": merchant_name or "Housing Analyzer",
            "merchant_city": self.merchant_city,
            "amount": float(amount),
            "currency": currency,
            "store_label": store_label,
            "bill_number": bill_number,
            "phone_number": phone_number or "855XXXXXXXX",
            "terminal_label": 'OnlinePayment',
            "note": f"Payment for {property_title}" if property_title else "Property rental payment"
        }
        
        # Convert to string
        qr_string = json.dumps(qr_data, separators=(',', ':'))
        
        # Generate MD5 hash
        md5_hash = hashlib.md5(qr_string.encode()).hexdigest()
        
        # Generate QR image
        qr_image = self._generate_qr_image(qr_string)
        
        # Generate deeplink
        deeplink = f"https://bakong.gov.kh/demo_payment?hash={md5_hash}"
        
        return {
            'qr_data': qr_string,
            'md5_hash': md5_hash,
            'qr_image': qr_image,
            'deeplink': deeplink,
            'amount': float(amount),
            'currency': currency,
            'merchant_name': merchant_name,
            'bill_number': bill_number,
            'bank_account': bank_account,
            'method': 'demo-mode',
            'note': 'Demo QR code - Add real Bakong credentials for production'
        }
    
    def _generate_qr_image(self, qr_data: str) -> str:
        """Generate QR code image as base64 string"""
        try:
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Generate image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            img_base64 = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/png;base64,{img_base64}"
            
        except Exception as e:
            print(f"Error generating QR image: {e}")
            return None
    
    def check_payment_status_enhanced(self, md5_hash: str) -> Dict:
        """Enhanced payment status check"""
        
        # Try multiple methods
        if self.khqr and self.token:
            try:
                status = self.khqr.check_payment(md5_hash)
                return {
                    'status': status,
                    'md5_hash': md5_hash,
                    'method': 'bakong-khqr-library'
                }
            except Exception as e:
                print(f"⚠️ bakong-khqr check failed: {e}")
        
        # Custom status check
        return self._check_payment_status_custom(md5_hash)
    
    def _check_payment_status_custom(self, md5_hash: str) -> Dict:
        """Custom payment status check"""
        
        # For demo purposes, return pending status
        return {
            'status': 'pending',
            'md5_hash': md5_hash,
            'message': 'Payment verification in progress',
            'method': 'custom-implementation',
            'note': 'Add real Bakong credentials for production verification'
        }

# Singleton instance
enhanced_bakong_service = EnhancedBakongService()
