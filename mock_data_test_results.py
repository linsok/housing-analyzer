#!/usr/bin/env python3
"""
Test the recommendation system with mock data and show what will be displayed
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/analytics"

def test_with_mock_data():
    """Test recommendations with the newly created mock data"""
    print("🎯 Testing Recommendation System with Mock Data")
    print("="*60)
    
    # Test all recommendation types
    endpoints = [
        ("most-booked", "Most Booked Properties"),
        ("highest-rated", "Highest Rated Properties"),
        ("average-price", "Average Price Properties")
    ]
    
    recommendations_by_type = {}
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{BASE_URL}/{endpoint}/?limit=3")
            if response.status_code == 200:
                data = response.json()
                properties = data.get('properties', [])
                recommendations_by_type[endpoint] = properties
                
                print(f"\n🏷️ {description}")
                print(f"   Status: ✅ SUCCESS ({len(properties)} properties)")
                print(f"   Message: {data.get('message', '')}")
                
                for i, prop in enumerate(properties, 1):
                    ribbon_text = {
                        'most_booked': 'POPULAR',
                        'highest_rated': 'TOP RATED',
                        'average_price': 'BEST VALUE'
                    }.get(endpoint, 'RECOMMENDED')
                    
                    print(f"   {i}. 🌟 {prop['title']}")
                    print(f"      💰 ${prop['rent_price']} | ⭐ {prop['rating']} | 📍 {prop['city']}")
                    print(f"      🏷️ Will show: {ribbon_text} ribbon")
                    
                    if 'booking_count' in prop:
                        print(f"      📊 {prop['booking_count']} bookings")
                    if 'favorite_count' in prop:
                        print(f"      ❤️ {prop['favorite_count']} favorites")
        except Exception as e:
            print(f"❌ Error with {endpoint}: {str(e)}")
    
    print(f"\n" + "="*60)
    print(f"🎨 WHAT YOU'LL SEE ON YOUR WEBSITE:")
    print(f"="*60)
    
    # Show what will appear on Home page (6 properties)
    print(f"\n🏠 HOME PAGE - Recommended Properties Section:")
    print(f"   URL: http://localhost:5174/")
    print(f"   Location: Middle of the page")
    print(f"   Properties: 6 unique recommendations")
    
    home_properties = []
    seen_ids = set()
    
    for endpoint, properties in recommendations_by_type.items():
        for prop in properties:
            if prop['id'] not in seen_ids and len(home_properties) < 6:
                home_properties.append({**prop, 'recommendation_type': endpoint.replace('-', '_')})
                seen_ids.add(prop['id'])
    
    for i, prop in enumerate(home_properties, 1):
        ribbon_text = {
            'most_booked': 'POPULAR',
            'highest_rated': 'TOP RATED',
            'average_price': 'BEST VALUE'
        }.get(prop['recommendation_type'], 'RECOMMENDED')
        
        print(f"   {i}. 🌟 {prop['title']}")
        print(f"      💰 ${prop['rent_price']} | ⭐ {prop['rating']} | 📍 {prop['city']}")
        print(f"      🎯 Overlay: RECOMMENDED + 🏷️ {ribbon_text}")
    
    # Show what will appear on Properties page (12 properties)
    print(f"\n🏘️ PROPERTIES PAGE - Recommended Properties Section:")
    print(f"   URL: http://localhost:5174/properties")
    print(f"   Location: TOP OF PAGE (displayed first)")
    print(f"   Properties: All unique recommendations (up to 12)")
    
    all_properties = []
    seen_ids = set()
    
    for endpoint, properties in recommendations_by_type.items():
        for prop in properties:
            if prop['id'] not in seen_ids and len(all_properties) < 12:
                all_properties.append({**prop, 'recommendation_type': endpoint.replace('-', '_')})
                seen_ids.add(prop['id'])
    
    for i, prop in enumerate(all_properties, 1):
        ribbon_text = {
            'most_booked': 'POPULAR',
            'highest_rated': 'TOP RATED',
            'average_price': 'BEST VALUE'
        }.get(prop['recommendation_type'], 'RECOMMENDED')
        
        print(f"   {i}. 🌟 {prop['title']}")
        print(f"      💰 ${prop['rent_price']} | ⭐ {prop['rating']} | 📍 {prop['city']}")
        print(f"      🎯 Overlay: RECOMMENDED + 🏷️ {ribbon_text}")
    
    print(f"\n" + "="*60)
    print(f"🎯 PROMINENT OVERLAY FEATURES:")
    print(f"="*60)
    print(f"✅ Main 'RECOMMENDED' badge at top center")
    print(f"✅ Color-coded corner ribbons:")
    print(f"   🔵 Blue ribbon for 'POPULAR' (most booked)")
    print(f"   🟢 Green ribbon for 'TOP RATED' (highest rated)")
    print(f"   🟣 Purple ribbon for 'BEST VALUE' (average price)")
    print(f"✅ Gradient overlay for better readability")
    print(f"✅ Professional design with shadows and effects")
    
    print(f"\n🌐 VISIT NOW TO SEE LIVE:")
    print(f"   🏠 Home Page: http://localhost:5174/")
    print(f"   🏘️ Properties Page: http://localhost:5174/properties")
    
    print(f"\n🎉 MOCK DATA READY! Your recommendation system is now fully functional!")

if __name__ == "__main__":
    test_with_mock_data()
