#!/usr/bin/env python
"""
Test script to verify Bakong configuration
"""
import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up environment variables manually for testing
os.environ['BAKONG_API_TOKEN'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMjNiZGQ3NmIwNDgzNDAyYiJ9LCJpYXQiOjE3NjY0OTY0NDMsImV4cCI6MTc3NDI3MjQ0M30.ZjHJURnAXqQEuwsiqb9ltbF-xA0sgqaWfevdatnyjUk'
os.environ['BAKONG_BANK_ACCOUNT'] = 'sok_lin@bkrt'
os.environ['BAKONG_MERCHANT_NAME'] = 'SOKLIN HOUSING'
os.environ['BAKONG_MERCHANT_CITY'] = 'Phnom Penh'
os.environ['BAKONG_PHONE_NUMBER'] = '855977569023'

try:
    from bakong_khqr import KHQR
    
    print("✓ bakong_khqr package imported successfully")
    
    # Test KHQR initialization
    token = os.environ.get('BAKONG_API_TOKEN')
    if token:
        print("✓ BAKONG_API_TOKEN found")
        
        try:
            khqr = KHQR(token)
            print("✓ KHQR service initialized successfully")
            
            # Test QR generation with minimal data
            try:
                qr_data = khqr.create_qr(
                    bank_account="sok_lin@bkrt",
                    merchant_name="Test Merchant",
                    merchant_city="Phnom Penh",
                    amount=1.0,
                    currency="KHR",
                    store_label="TestStore",
                    phone_number="855977569023",
                    bill_number="TEST123",
                    terminal_label="OnlinePayment"
                )
                print("✓ QR code generation test successful")
                print(f"QR data length: {len(qr_data)} characters")
                
            except Exception as e:
                print(f"✗ QR code generation test failed: {e}")
                
        except Exception as e:
            print(f"✗ KHQR service initialization failed: {e}")
    else:
        print("✗ BAKONG_API_TOKEN not found")
        
except ImportError as e:
    print(f"✗ Failed to import bakong_khqr: {e}")
    print("Please install with: pip install bakong-khqr==0.4.19")

print("\nConfiguration check completed.")
