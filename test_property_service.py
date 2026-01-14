#!/usr/bin/env python3
"""
Test if the propertyService methods are working correctly
"""
import subprocess
import sys
import os

def test_property_service():
    """Test the property service methods by checking the API endpoints"""
    print("🔧 Testing Property Service Methods")
    print("="*50)
    
    # Test if the API endpoints are working
    endpoints = [
        "http://127.0.0.1:8000/api/analytics/most-booked/?limit=3",
        "http://127.0.0.1:8000/api/analytics/highest-rated/?limit=3", 
        "http://127.0.0.1:8000/api/analytics/average-price/?limit=3"
    ]
    
    for endpoint in endpoints:
        try:
            import requests
            response = requests.get(endpoint)
            if response.status_code == 200:
                data = response.json()
                properties = data.get('properties', [])
                print(f"✅ {endpoint.split('/')[-2]}: {len(properties)} properties")
                if properties:
                    prop = properties[0]
                    print(f"   Sample: {prop['title']} - ${prop['rent_price']}")
            else:
                print(f"❌ {endpoint.split('/')[-2]}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint.split('/')[-2]}: {str(e)}")
    
    print(f"\n🌐 Frontend Testing Instructions:")
    print(f"="*50)
    print(f"1. Open browser: http://localhost:5174")
    print(f"2. Open Developer Console (F12)")
    print(f"3. Look for debug messages:")
    print(f"   🔍 Loading recommended properties...")
    print(f"   📡 API Responses: {...}")
    print(f"   🎯 Combined recommendations: [...]")
    print(f"   🏠 PropertyCard rendering: {...}")
    print(f"   🎯 Recommendation detection: {...}")
    print(f"\n4. Check if properties show up in the Recommended Properties section")
    print(f"5. Check if properties have the 🌟 RECOMMENDED overlay")
    
    print(f"\n🔍 Expected Console Output:")
    print(f"="*50)
    print(f"🔍 Loading recommended properties...")
    print(f"📡 API Responses: {{mostBooked: {{properties: [...]}}, ...}}")
    print(f"🎯 Combined recommendations: [{{recommendation_type: 'most_booked', ...}}]")
    print(f"✅ Final recommendations for display: [{{title: 'Luxury Apartment', ...}}]")
    print(f"🏠 PropertyCard rendering: {{id: 96, title: 'Luxury Apartment', recommendation_type: 'most_booked'}}")
    print(f"🎯 Recommendation detection: {{propertyId: 96, isNewRecommendation: true, willShowOverlay: true}}")

if __name__ == "__main__":
    test_property_service()
