from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Booking, Message
from .serializers import BookingSerializer, MessageSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for booking management"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Booking.objects.all()
        elif user.role == 'owner':
            return Booking.objects.filter(property__owner=user)
        else:  # renter
            return Booking.objects.filter(renter=user)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Property owner confirms a booking"""
        booking = self.get_object()
        
        if booking.property.owner != request.user:
            return Response(
                {'error': 'Only property owner can confirm bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = 'confirmed'
        booking.confirmed_at = timezone.now()
        booking.owner_notes = request.data.get('notes', '')
        booking.save()
        
        # Update property status if rental
        if booking.booking_type == 'rental':
            booking.property.status = 'rented'
            booking.property.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        if booking.renter != request.user and booking.property.owner != request.user:
            return Response(
                {'error': 'You cannot cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark booking as completed"""
        booking = self.get_object()
        
        if booking.property.owner != request.user:
            return Response(
                {'error': 'Only property owner can complete bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = 'completed'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for messaging"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver', 'property')
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get list of conversations"""
        user = request.user
        
        # Get unique conversation partners
        messages = Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver', 'property').order_by('-created_at')
        
        conversations = {}
        for message in messages:
            partner = message.receiver if message.sender == user else message.sender
            property_id = message.property.id
            key = f"{partner.id}_{property_id}"
            
            if key not in conversations:
                conversations[key] = {
                    'partner': {
                        'id': partner.id,
                        'name': partner.full_name,
                        'profile_picture': request.build_absolute_uri(partner.profile_picture.url) if partner.profile_picture else None
                    },
                    'property': {
                        'id': message.property.id,
                        'title': message.property.title
                    },
                    'last_message': {
                        'content': message.content,
                        'created_at': message.created_at,
                        'is_read': message.is_read,
                        'sender_id': message.sender.id
                    },
                    'unread_count': 0
                }
            
            if message.receiver == user and not message.is_read:
                conversations[key]['unread_count'] += 1
        
        return Response(list(conversations.values()))
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()
        
        if message.receiver != request.user:
            return Response(
                {'error': 'You can only mark your own messages as read'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.is_read = True
        message.save()
        
        serializer = self.get_serializer(message)
        return Response(serializer.data)
