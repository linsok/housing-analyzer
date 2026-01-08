from rest_framework import serializers
from .models import Booking, Message
from properties.serializers import PropertyListSerializer
from users.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    property_details = PropertyListSerializer(source='property', read_only=True)
    renter_details = UserSerializer(source='renter', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'renter', 'booking_type', 'status', 'start_date', 'end_date',
            'monthly_rent', 'deposit_amount', 'total_amount', 'message', 'owner_notes',
            'contact_phone', 'member_count', 'transaction_image', 'transaction_submitted_at',
            'bakong_md5_hash', 'payment_method', 'confirmed_at', 'completed_at',
            'checked_out_at', 'hidden_by_owner', 'created_at', 'updated_at',
            'property_details', 'renter_details'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'renter', 'status', 'owner_notes', 'confirmed_at']
    
    def to_representation(self, instance):
        """Override to ensure monthly_rent always shows property rent price"""
        data = super().to_representation(instance)
        
        # Debug logging
        print(f"=== SERIALIZER DEBUG ===")
        print(f"Booking ID: {instance.id}")
        print(f"Original monthly_rent: {data.get('monthly_rent')}")
        print(f"Property rent_price: {data.get('property_details', {}).get('rent_price')}")
        
        # Always use property rent price for monthly_rent if booking monthly_rent is 0 or falsy
        monthly_rent = data.get('monthly_rent')
        property_rent_price = data.get('property_details', {}).get('rent_price')
        
        if not monthly_rent and property_rent_price:
            data['monthly_rent'] = property_rent_price
            print(f"Updated monthly_rent to: {data['monthly_rent']}")
        else:
            print(f"Keeping monthly_rent as: {monthly_rent}")
        
        print(f"=== END SERIALIZER DEBUG ===")
        return data
    
    def create(self, validated_data):
        validated_data['renter'] = self.context['request'].user
        
        # Calculate amounts for rental bookings
        if validated_data['booking_type'] == 'rental':
            property_obj = validated_data['property']
            validated_data['monthly_rent'] = property_obj.rent_price
            validated_data['deposit_amount'] = property_obj.deposit
            validated_data['total_amount'] = property_obj.rent_price + property_obj.deposit
        
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'booking', 'property', 'sender', 'sender_name',
            'receiver', 'receiver_name', 'content', 'is_read', 'created_at'
        ]
        read_only_fields = ['sender', 'is_read']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
