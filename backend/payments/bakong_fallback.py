"""
Fallback QR Code Generator for Bakong API
Used when Bakong API is not available (geographic restrictions)
"""

import qrcode
import io
import base64
from decimal import Decimal
import hashlib
import json

def generate_fallback_qr_code(amount: Decimal, 
                             currency: str = 'KHR',
                             property_title: str = None,
                             booking_id: str = None,
                             renter_name: str = None,
                             bakong_bank_account: str = None,
                             bakong_merchant_name: str = None,
                             bakong_phone_number: str = None) -> dict:
    """
    Generate a fallback QR code when Bakong API is not available
    
    Returns:
        Dictionary with mock QR data for demonstration purposes
    """
    
    # Create mock QR data
    store_label = "HousingAnalyzer"
    bill_number = f"BK{booking_id[:8]}" if booking_id else "TRX" + str(int(amount * 100))
    
    # Mock QR data (simulating Bakong format)
    qr_data = {
        "type": "mock_khqr",
        "bank_account": bakong_bank_account or "mock_bank_account",
        "merchant_name": bakong_merchant_name or "Housing Analyzer",
        "merchant_city": "Phnom Penh",
        "amount": float(amount),
        "currency": currency,
        "store_label": store_label,
        "bill_number": bill_number,
        "phone_number": bakong_phone_number or "855XXXXXXXX",
        "terminal_label": 'OnlinePayment',
        "note": f"Payment for {property_title}" if property_title else "Property rental payment"
    }
    
    # Convert to string for QR code
    qr_string = json.dumps(qr_data, separators=(',', ':'))
    
    # Generate MD5 hash
    md5_hash = hashlib.md5(qr_string.encode()).hexdigest()
    
    # Generate QR code image
    qr_image = _generate_qr_image(qr_string)
    
    # Generate mock deeplink
    deeplink = f"https://bakong.gov.kh/mock_payment?hash={md5_hash}"
    
    return {
        'qr_data': qr_string,
        'md5_hash': md5_hash,
        'qr_image': qr_image,
        'deeplink': deeplink,
        'amount': float(amount),
        'currency': currency,
        'merchant_name': bakong_merchant_name or "Housing Analyzer",
        'bill_number': bill_number,
        'bank_account': bakong_bank_account or "mock_bank_account",
        'note': 'This is a demonstration QR code. Bakong API requires Cambodia IP addresses.'
    }

def check_fallback_payment_status(md5_hash: str) -> dict:
    """
    Check payment status for fallback QR codes
    
    Returns:
        Mock payment status for demonstration purposes
    """
    # Mock payment status - in real implementation, this would check with Bakong
    # For demo purposes, we'll return a "pending" status
    
    return {
        'status': 'pending',
        'md5_hash': md5_hash,
        'message': 'This is a demonstration payment status. Real Bakong API requires Cambodia IP addresses.',
        'transaction_id': f"MOCK_{md5_hash[:8]}",
        'amount': None,  # Would be populated in real implementation
        'currency': None,
        'timestamp': None,
        'is_mock': True
    }

def _generate_qr_image(qr_data: str) -> str:
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
        print(f"Error generating QR image: {e}")
        return None
