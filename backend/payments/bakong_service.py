from bakong_khqr import KHQR
from django.conf import settings
import qrcode
import io
import base64
from decimal import Decimal
from typing import Dict, Optional, Tuple
import os

class BakongKHQRService:
    """
    Service for generating Bakong KHQR codes and handling payments
    """
    
    def __init__(self):
        self.token = getattr(settings, 'BAKONG_API_TOKEN', None) or os.getenv('BAKONG_API_TOKEN')
        self.bank_account = getattr(settings, 'BAKONG_BANK_ACCOUNT', None) or os.getenv('BAKONG_BANK_ACCOUNT')
        self.merchant_name = getattr(settings, 'BAKONG_MERCHANT_NAME', None) or os.getenv('BAKONG_MERCHANT_NAME', 'Housing Analyzer')
        self.merchant_city = getattr(settings, 'BAKONG_MERCHANT_CITY', None) or os.getenv('BAKONG_MERCHANT_CITY', 'Phnom Penh')
        self.phone_number = getattr(settings, 'BAKONG_PHONE_NUMBER', None) or os.getenv('BAKONG_PHONE_NUMBER')
        
        # Don't initialize KHQR if configuration is missing
        self.khqr = None
        if self.token:
            try:
                self.khqr = KHQR(self.token)
                print("Bakong KHQR service initialized successfully")
            except Exception as e:
                print(f"Warning: Failed to initialize Bakong KHQR: {e}")
                self.khqr = None
        else:
            print("Warning: Bakong API token not configured")
    
    def generate_qr_code(self, 
                       amount: Decimal, 
                       currency: str = 'KHR',
                       property_title: str = None,
                       booking_id: str = None,
                       renter_name: str = None,
                       bakong_bank_account: str = None,
                       bakong_merchant_name: str = None,
                       bakong_phone_number: str = None) -> Dict[str, str]:
        """
        Generate KHQR code for payment
        
        Args:
            amount: Payment amount
            currency: Currency code (KHR or USD)
            property_title: Property title for reference
            booking_id: Booking ID for reference
            renter_name: Renter name for reference
            bakong_bank_account: Property owner's Bakong account
            bakong_merchant_name: Property owner's merchant name
            bakong_phone_number: Property owner's phone number
            
        Returns:
            Dictionary containing QR data, MD5 hash, and base64 QR image
        """
        if not self.khqr:
            raise Exception("Bakong KHQR service is not properly configured. Please check your environment variables.")
        
        try:
            # Use property-specific Bakong configuration or fallback to defaults
            bank_account = bakong_bank_account or self.bank_account
            merchant_name = bakong_merchant_name or self.merchant_name
            phone_number = bakong_phone_number or self.phone_number
            
            if not bank_account:
                raise Exception("Bank account is required for KHQR generation")
            # Generate store label and bill number from booking info
            store_label = "HousingAnalyzer"
            bill_number = f"BK{booking_id[:8]}" if booking_id else "TRX" + str(int(amount * 100))
            phone_number_to_use = phone_number or "855977569023"  # Default phone number
            
            # Create QR code data
            qr_data = self.khqr.create_qr(
                bank_account=bank_account,
                merchant_name=merchant_name,
                merchant_city=self.merchant_city,
                amount=float(amount),
                currency=currency,
                store_label=store_label,
                phone_number=phone_number_to_use,
                bill_number=bill_number,
                terminal_label='OnlinePayment',
                static=False  # Dynamic QR code
            )
            
            # Generate MD5 hash for payment tracking
            md5_hash = self.khqr.generate_md5(qr_data)
            
            # Generate QR code image
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
                'bank_account': bank_account
            }
            
        except Exception as e:
            raise Exception(f"Failed to generate KHQR code: {str(e)}")
    
    def _generate_qr_image(self, qr_data: str) -> str:
        """
        Generate QR code image as base64 string
        
        Args:
            qr_data: QR code data string
            
        Returns:
            Base64 encoded PNG image
        """
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
            raise Exception(f"Failed to generate QR image: {str(e)}")
    
    def check_payment_status(self, md5_hash: str) -> Dict:
        """
        Check payment status using MD5 hash
        
        Args:
            md5_hash: MD5 hash of the QR code
            
        Returns:
            Payment status information
        """
        if not self.khqr:
            raise Exception("Bakong KHQR service is not properly configured. Please check your environment variables.")
        
        try:
            status = self.khqr.check_payment(md5_hash)
            return {
                'status': status,
                'md5_hash': md5_hash
            }
        except Exception as e:
            raise Exception(f"Failed to check payment status: {str(e)}")
    
    def get_payment_details(self, md5_hash: str) -> Optional[Dict]:
        """
        Get payment details using MD5 hash
        
        Args:
            md5_hash: MD5 hash of the QR code
            
        Returns:
            Payment details if paid, None otherwise
        """
        if not self.khqr:
            raise Exception("Bakong KHQR service is not properly configured. Please check your environment variables.")
        
        try:
            payment_info = self.khqr.get_payment(md5_hash)
            return payment_info
        except Exception as e:
            raise Exception(f"Failed to get payment details: {str(e)}")
    
    def check_bulk_payments(self, md5_hashes: list) -> list:
        """
        Check multiple payment statuses
        
        Args:
            md5_hashes: List of MD5 hashes
            
        Returns:
            List of paid MD5 hashes
        """
        if not self.khqr:
            raise Exception("Bakong KHQR service is not properly configured. Please check your environment variables.")
        
        try:
            if len(md5_hashes) > 50:
                # Handle chunking for large lists
                paid_hashes = []
                for i in range(0, len(md5_hashes), 50):
                    batch = md5_hashes[i:i+50]
                    paid_hashes.extend(self.khqr.check_bulk_payments(batch))
                return paid_hashes
            else:
                return self.khqr.check_bulk_payments(md5_hashes)
        except Exception as e:
            raise Exception(f"Failed to check bulk payments: {str(e)}")

# Singleton instance
bakong_service = BakongKHQRService()
