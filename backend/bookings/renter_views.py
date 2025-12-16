from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Booking
from .renter_serializers import RenterDashboardSerializer
from .permissions import IsRenter

class RenterDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for renter dashboard operations.
    """
    permission_classes = [permissions.IsAuthenticated, IsRenter]
    
    def list(self, request):
        """List all bookings and visit requests for the current renter"""
        bookings = Booking.objects.filter(
            renter=request.user
        ).select_related('property', 'property__owner').order_by('-created_at')
        
        serializer = RenterDashboardSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        """Cancel a booking or visit request"""
        booking = get_object_or_404(
            Booking,
            id=pk,
            renter=request.user,
            status='pending'  # Only allow cancelling pending requests
        )
        
        # Check if within 24 hours
        time_since_creation = timezone.now() - booking.created_at
        if time_since_creation.total_seconds() > 86400:  # 24 hours
            return Response(
                {'error': 'Cannot cancel after 24 hours of booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        return Response({'status': 'Booking cancelled successfully'})

    @action(detail=True, methods=['get'])
    def owner_contact(self, request, pk=None):
        """Get owner's contact information"""
        booking = get_object_or_404(
            Booking,
            id=pk,
            renter=request.user,
            status__in=['confirmed', 'completed']
        )
        
        return Response({
            'owner_name': f"{booking.property.owner.first_name} {booking.property.owner.last_name}",
            'phone': booking.property.owner.phone,
            'email': booking.property.owner.email
        })
