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
            'id', 'property', 'property_details', 'renter', 'renter_details',
            'booking_type', 'start_date', 'end_date', 'visit_time',
            'monthly_rent', 'deposit_amount', 'total_amount', 'status',
            'message', 'owner_notes', 'contact_phone', 'member_count',
            'transaction_image', 'transaction_submitted_at',
            'created_at', 'updated_at', 'confirmed_at'
        ]
        read_only_fields = ['renter', 'status', 'owner_notes', 'confirmed_at']
    
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
