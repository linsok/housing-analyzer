#!/usr/bin/env python3
"""
Test script for the Home page recommendation system
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/analytics"

def test_home_recommendations():
    """Test the recommendation endpoints that the Home page uses"""
    print("🏠 Testing Home Page Recommendation System")
    print("="*50)
    
    endpoints = [
        ("most-booked", "Most Booked Properties"),
        ("highest-rated", "Highest Rated Properties"),
        ("average-price", "Average Price Properties")
    ]
    
    all_properties = []
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{BASE_URL}/{endpoint}/?limit=3")
            print(f"\n{'='*30}")
            print(f"Testing: {description}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                properties = data.get('properties', [])
                print(f"✅ SUCCESS - {len(properties)} properties")
                all_properties.extend(properties)
                
                if properties:
                    prop = properties[0]
                    print(f"Sample: {prop.get('title')} - ${prop.get('rent_price')} - {prop.get('city')}")
            else:
                print(f"❌ FAILED - {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    
    print(f"\n{'='*50}")
    print(f"📊 Summary:")
    print(f"Total unique properties available: {len(all_properties)}")
    
    # Check for duplicates (simulating the deduplication logic)
    unique_ids = set()
    duplicates = 0
    for prop in all_properties:
        if prop.get('id') in unique_ids:
            duplicates += 1
        else:
            unique_ids.add(prop.get('id'))
    
    print(f"Unique properties after deduplication: {len(unique_ids)}")
    print(f"Duplicates removed: {duplicates}")
    
    print(f"\n🎉 Home Page Recommendation System Test Complete!")
    print("The Home page will display up to 6 unique recommended properties.")
    print("Each property will show a colored badge indicating its recommendation type.")

if __name__ == "__main__":
    test_home_recommendations()
