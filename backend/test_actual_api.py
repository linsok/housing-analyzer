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

# Test the actual API response that the frontend would receive
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
            print(f'=== TESTING BOOKING {booking.id} ===')
            print(f'Raw booking.monthly_rent: {booking.monthly_rent}')
            print(f'Raw booking.property.rent_price: {booking.property.rent_price}')
            
            # Test the serializer exactly as the API would use it
            print(f'\n=== SERIALIZER TEST ===')
            
            # Create a mock request context like the real API
            factory = APIRequestFactory()
            request = factory.get('/api/bookings/')
            request.user = user
            
            # Test the serializer
            serializer = BookingSerializer(booking, context={'request': request})
            
            # Check individual fields
            print(f'serializer.data["monthly_rent"]: {serializer.data.get("monthly_rent")}')
            print(f'serializer.data["property_details"]: {serializer.data.get("property_details", {})}')
            
            if serializer.data.get("property_details"):
                print(f'property_details.rent_price: {serializer.data["property_details"].get("rent_price")}')
            
            # Test the to_representation method directly
            print(f'\n=== TO_REPRESENTATION TEST ===')
            representation = serializer.to_representation(booking)
            print(f'representation["monthly_rent"]: {representation.get("monthly_rent")}')
            
            # Test what the frontend should receive
            print(f'\n=== FRONTEND LOGIC SIMULATION ===')
            frontend_booking = representation  # This is what the frontend receives
            
            monthly_payment = float(
                frontend_booking.get('monthly_rent') or 
                frontend_booking.get('property_details', {}).get('rent_price') or 
                0
            )
            print(f'Frontend calculation: {monthly_payment}')
            
        else:
            print('No booking found')
    else:
        print('User not found')
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
