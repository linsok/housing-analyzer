#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from bookings.models import Booking
from users.models import User

# Test the actual logic that should be working
try:
    user = User.objects.filter(email='soklin1220lin@gmail.com').first()
    if user:
        # Get the booking that's causing issues
        booking = Booking.objects.filter(
            renter=user,
            booking_type='rental',
            property__title='Premier Room'
        ).order_by('-created_at').first()
        
        if booking:
            print(f'=== BOOKING {booking.id} RAW DATA ===')
            print(f'booking.monthly_rent: {booking.monthly_rent}')
            print(f'booking.property.rent_price: {booking.property.rent_price}')
            
            # Test the backend serializer logic manually
            print(f'\n=== BACKEND SERIALIZER LOGIC ===')
            monthly_rent_from_booking = booking.monthly_rent
            property_rent_price = booking.property.rent_price
            
            # This is what the serializer's to_representation method should do
            if monthly_rent_from_booking == 0 and property_rent_price:
                corrected_monthly_rent = property_rent_price
                print(f'Serializer should set monthly_rent from 0 to {property_rent_price}')
            else:
                corrected_monthly_rent = monthly_rent_from_booking
                print(f'Serializer will keep monthly_rent as {monthly_rent_from_booking}')
            
            print(f'Final monthly_rent after serializer: {corrected_monthly_rent}')
            
            # Test the frontend transform logic
            print(f'\n=== FRONTEND TRANSFORM LOGIC ===')
            # Simulate what the frontend receives
            frontend_monthly_rent = corrected_monthly_rent
            frontend_property_rent_price = property_rent_price
            
            monthly_payment = float(
                frontend_monthly_rent or 
                frontend_property_rent_price or 
                0
            )
            print(f'Frontend calculation: {frontend_monthly_rent} or {frontend_property_rent_price} = {monthly_payment}')
            
            # Check if the booking actually has the issue
            print(f'\n=== ISSUE DIAGNOSIS ===')
            if corrected_monthly_rent == 0:
                print('PROBLEM: Backend serializer is not correcting the monthly_rent field!')
            else:
                print('Backend serializer should be working correctly.')
                
            if monthly_payment == 0:
                print('PROBLEM: Frontend logic is resulting in 0 payment!')
            else:
                print('Frontend logic should be working correctly.')
            
        else:
            print('No booking found')
    else:
        print('User not found')
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
