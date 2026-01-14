#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from bookings.models import Booking
from bookings.serializers import BookingSerializer
from users.models import User

# Test the to_representation method directly
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
            
            # Create serializer instance without request context
            serializer = BookingSerializer()
            
            # Test the to_representation method directly
            print(f'\n=== TO_REPRESENTATION DIRECT TEST ===')
            try:
                representation = serializer.to_representation(booking)
                print(f'monthly_rent in representation: {representation.get("monthly_rent")}')
                print(f'property_details in representation: {representation.get("property_details", {})}')
                
                if representation.get("property_details"):
                    print(f'property_details.rent_price: {representation["property_details"].get("rent_price")}')
                
                # Test the frontend logic
                print(f'\n=== FRONTEND LOGIC TEST ===')
                monthly_payment = float(
                    representation.get('monthly_rent') or 
                    representation.get('property_details', {}).get('rent_price') or 
                    0
                )
                print(f'Final monthly_payment: {monthly_payment}')
                
            except Exception as e:
                print(f'Error in to_representation: {e}')
                import traceback
                traceback.print_exc()
            
        else:
            print('No booking found')
    else:
        print('User not found')
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
