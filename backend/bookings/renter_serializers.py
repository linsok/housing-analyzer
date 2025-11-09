from rest_framework import serializers
from .models import Booking
from properties.renter_serializers import PropertySerializer

class RenterDashboardSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    can_cancel = serializers.SerializerMethodField()
    owner_contact = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'booking_type', 'start_date', 'end_date', 
            'visit_time', 'status', 'created_at', 'can_cancel', 'owner_contact'
        ]
        read_only_fields = fields

    def get_can_cancel(self, obj):
        # Allow cancellation within 24 hours of creation
        from django.utils import timezone
        time_since_creation = timezone.now() - obj.created_at
        return obj.status == 'pending' and time_since_creation.total_seconds() <= 86400  # 24 hours

    def get_owner_contact(self, obj):
        # Return owner's contact information if booking is confirmed
        if obj.status in ['confirmed', 'completed']:
            return {
                'owner_name': f"{obj.property.owner.first_name} {obj.property.owner.last_name}",
                'phone': obj.property.owner.phone,
                'email': obj.property.owner.email
            }
        return None
