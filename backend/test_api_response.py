#!/usr/bin/env python
import os
import django
import json

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from bookings.models import Booking
from bookings.serializers import BookingSerializer
from users.models import User
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model

User = get_user_model()

# Test the API response for the problematic booking
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
            
            print(f'\n=== SERIALIZED DATA ===')
            # Create a mock request context
            factory = APIRequestFactory()
            request = factory.get('/')
            request.user = user
            
            serializer = BookingSerializer(booking, context={'request': request})
            serialized_data = serializer.data
            
            print('Key serialized fields:')
            print(f'monthly_rent: {serialized_data.get("monthly_rent")}')
            print(f'property_details.rent_price: {serialized_data.get("property_details", {}).get("rent_price")}')
            
            # Test the frontend transform logic
            print(f'\n=== FRONTEND TRANSFORM LOGIC ===')
            monthly_payment = float(
                serialized_data.get('monthly_rent') or 
                serialized_data.get('property_details', {}).get('rent_price') or 
                0
            )
            print(f'Calculated monthly_payment: {monthly_payment}')
            
        else:
            print('No booking found')
    else:
        print('User not found')
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
