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
    
    @action(detail=False, methods=['post'])
    def payment_with_transaction(self, request):
        """Create booking with transaction receipt or Bakong KHQR payment"""
        from properties.models import Property
        from users.models import User
        from payments.models import Payment
        
        print("=== PAYMENT WITH TRANSACTION DEBUG ===")
        print("Request data:", request.data)
        print("Request files:", request.FILES)
        print("User:", request.user)
        
        try:
            # Extract data from FormData
            property_id = request.data.get('property_id')
            renter_id = request.data.get('renter_id')
            payment_method = request.data.get('payment_method', 'upload')
            amount = request.data.get('amount')
            bakong_md5_hash = request.data.get('bakong_md5_hash')
            transaction_image = request.FILES.get('transaction_image')
            
            print(f"Extracted - property_id: {property_id}, renter_id: {renter_id}, amount: {amount}, payment_method: {payment_method}")
            print(f"Bakong MD5 hash: {bakong_md5_hash}, Transaction image: {transaction_image}")
            
            # Validate required fields based on payment method
            if payment_method == 'bakong_khqr':
                if not all([property_id, renter_id, amount, bakong_md5_hash]):
                    error_msg = f"Missing required Bakong fields: property_id={property_id}, renter_id={renter_id}, amount={amount}, bakong_md5_hash={bakong_md5_hash}"
                    print(f"ERROR: {error_msg}")
                    return Response(
                        {'error': error_msg},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                if not all([property_id, renter_id, transaction_image, amount]):
                    error_msg = f"Missing required fields: property_id={property_id}, renter_id={renter_id}, transaction_image={transaction_image}, amount={amount}"
                    print(f"ERROR: {error_msg}")
                    return Response(
                        {'error': error_msg},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate property exists
            try:
                property = Property.objects.get(id=property_id)
                print(f"Found property: {property.title}")
            except Property.DoesNotExist:
                error_msg = f"Property not found with id: {property_id}"
                print(f"ERROR: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validate renter exists
            try:
                renter = User.objects.get(id=renter_id)
                print(f"Found renter: {renter.username}")
            except User.DoesNotExist:
                error_msg = f"User not found with id: {renter_id}"
                print(f"ERROR: {error_msg}")
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create booking first
            print("Creating booking...")
            booking = Booking.objects.create(
                property=property,
                renter=renter,
                booking_type=request.data.get('booking_type', 'rental'),
                start_date=request.data.get('preferredDate') or request.data.get('start_date'),
                contact_phone=request.data.get('phone'),
                member_count=request.data.get('memberCount', 1),
                message=request.data.get('notes', ''),
                deposit_amount=request.data.get('deposit_amount') or request.data.get('amount') or 0,
                total_amount=request.data.get('total_amount') or request.data.get('amount') or 0,
                status='confirmed' if payment_method == 'bakong_khqr' else 'pending_review',
                transaction_image=transaction_image,
                transaction_submitted_at=timezone.now(),
                bakong_md5_hash=bakong_md5_hash if payment_method == 'bakong_khqr' else None,
                payment_method=payment_method
            )
            
            print(f"Booking created successfully: {booking.id}")
            
            # Create payment record
            print("Creating payment record...")
            payment = Payment.objects.create(
                booking=booking,
                user=renter,
                amount=amount,
                payment_method='bakong_khqr' if payment_method == 'bakong_khqr' else 'qr_code',
                status='completed' if payment_method == 'bakong_khqr' else 'pending',
                payment_proof=transaction_image,
                bakong_md5_hash=bakong_md5_hash if payment_method == 'bakong_khqr' else None,
                description=f'Deposit payment for {property.title}'
            )
            
            print(f"Payment created successfully: {payment.id}")
            
            return Response({
                'id': booking.id,
                'payment_id': payment.id,
                'status': booking.status,
                'message': 'Booking and payment created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            error_msg = f"Exception occurred: {str(e)}"
            print(f"ERROR: {error_msg}")
            print("Full traceback:")
            traceback.print_exc()
            return Response(
                {'error': error_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
