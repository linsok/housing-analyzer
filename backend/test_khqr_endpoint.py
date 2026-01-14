#!/usr/bin/env python
"""
Test the KHQR generation endpoint directly
"""
import os
import sys
import json
import requests

# Test data
test_data = {
    "amount": 50.0,
    "currency": "KHR",
    "property_title": "Test Property",
    "booking_id": "TEST123456",
    "renter_name": "Test User",
    "property_id": 1
}

try:
    print("Testing KHQR generation endpoint...")
    print(f"Request data: {json.dumps(test_data, indent=2)}")
    
    response = requests.post(
        "http://localhost:8000/api/payments/generate_khqr/",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        result = response.json()
        print("✓ KHQR generation successful!")
        print(f"Response keys: {list(result.keys())}")
        if 'qr_data' in result:
            print(f"QR Data: {result['qr_data'][:50]}...")
        if 'md5_hash' in result:
            print(f"MD5 Hash: {result['md5_hash']}")
    else:
        print("✗ KHQR generation failed!")
        try:
            error_data = response.json()
            print(f"Error response: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw response: {response.text}")
            
except requests.exceptions.ConnectionError:
    print("✗ Cannot connect to backend server. Please make sure the Django server is running on http://localhost:8000")
except Exception as e:
    print(f"✗ Test failed with error: {e}")
