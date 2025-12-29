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
        
        # Start with base queryset based on user role
        if user.role == 'admin':
            queryset = Booking.objects.all()
        elif user.role == 'owner':
            queryset = Booking.objects.filter(property__owner=user)
        else:  # renter
            queryset = Booking.objects.filter(renter=user)
        
        # Filter by booking_type if provided in query params
        booking_type = self.request.query_params.get('booking_type')
        if booking_type:
            queryset = queryset.filter(booking_type=booking_type)
        
        return queryset
    
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
        
        # Check if this is an owner rejection with a reason
        reason = request.data.get('reason', '')
        is_owner_rejection = booking.property.owner == request.user and reason
        
        if is_owner_rejection:
            booking.status = 'rejected'
            booking.owner_notes = reason
        else:
            booking.status = 'cancelled'
        
        booking.save()
        
        # Create a message about the rejection/cancellation if there's a reason
        if reason:
            from users.models import User
            Message.objects.create(
                booking=booking,
                property=booking.property,
                sender=request.user,
                receiver=booking.renter if is_owner_rejection else booking.property.owner,
                content=f"Viewing request {'rejected' if is_owner_rejection else 'cancelled'}: {reason}"
            )
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark booking as completed"""
        print("\n=== Starting complete action ===")  # Debug log
        booking = self.get_object()
        print(f"Booking ID: {booking.id}, Status: {booking.status}")  # Debug log
        
        if booking.property.owner != request.user:
            return Response(
                {'error': 'Only property owner can complete bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = 'completed'
        booking.completed_at = timezone.now()
        booking.save()
        print(f"Booking marked as completed. New status: {booking.status}")  # Debug log
        
        # Send email notification to renter
        from utils.email_service import EmailService
        print("About to send email notification...")  # Debug log
        
        # Send different email based on booking type
        if booking.booking_type == 'visit':
            email_sent = EmailService.send_visit_completion_notification(booking)
            print(f"Visit completion email sending {'succeeded' if email_sent else 'failed'}")  # Debug log
        else:
            email_sent = EmailService.send_booking_completion_notification(booking)
            print(f"Booking completion email sending {'succeeded' if email_sent else 'failed'}")  # Debug log
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def viewings(self, request):
        """Schedule a property viewing"""
        from properties.models import Property
        from users.models import User
        from datetime import datetime
        
        print("=== VIEWING BOOKING DEBUG ===")
        print("Request data:", request.data)
        print("User:", request.user)
        
        try:
            property_id = request.data.get('property')
            visit_time = request.data.get('visit_time')
            notes = request.data.get('notes', '')
            contact_info = request.data.get('contact_info', {})
            
            print(f"Extracted data - property_id: {property_id}, visit_time: {visit_time}")
            
            if not property_id or not visit_time:
                print("ERROR: Missing property_id or visit_time")
                return Response(
                    {'error': 'Property ID and visit time are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate property exists
            try:
                property = Property.objects.get(id=property_id)
                print(f"Found property: {property.title}, owner: {property.owner}")
            except Property.DoesNotExist:
                print(f"ERROR: Property not found with id: {property_id}")
                return Response(
                    {'error': 'Property not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Parse and validate visit_time
            try:
                visit_datetime = datetime.fromisoformat(visit_time.replace('Z', '+00:00'))
                # Make timezone-aware if it's naive
                if visit_datetime.tzinfo is None:
                    visit_datetime = timezone.make_aware(visit_datetime)
                print(f"Parsed visit_time: {visit_datetime}")
            except ValueError as e:
                print(f"ERROR: Invalid visit_time format: {e}")
                return Response(
                    {'error': f'Invalid visit time format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create viewing booking
            print("Creating booking...")
            try:
                booking = Booking.objects.create(
                    property=property,
                    renter=request.user,
                    booking_type='visit',
                    start_date=visit_datetime.date(),  # Add required start_date from visit_time
                    visit_time=visit_datetime,
                    message=notes,
                    contact_phone=contact_info.get('phone', ''),
                    status='pending',
                    member_count=1  # Default for viewings
                )
                print(f"Booking created successfully: {booking.id}")
            except Exception as e:
                print(f"ERROR creating booking: {e}")
                return Response(
                    {'error': f'Failed to create booking: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Create message to property owner
            print("Creating message...")
            try:
                message = Message.objects.create(
                    booking=booking,
                    property=property,
                    sender=request.user,
                    receiver=property.owner,
                    content=f"Viewing request for {visit_datetime}. {notes}"
                )
                print(f"Message created successfully: {message.id}")
            except Exception as e:
                print(f"ERROR creating message: {e}")
                # Don't fail the whole process if message creation fails
                pass
            
            serializer = self.get_serializer(booking)
            return Response({
                'booking': serializer.data,
                'message': 'Viewing request submitted successfully. Waiting for property owner confirmation.'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"UNEXPECTED ERROR: {str(e)}")
            print("Full traceback:")
            traceback.print_exc()
            return Response(
                {'error': f'Failed to schedule viewing: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def availability(self, request):
        """Check availability for a property on a specific date"""
        property_id = request.query_params.get('property_id')
        date = request.query_params.get('date')
        
        if not property_id or not date:
            return Response(
                {'error': 'Property ID and date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            from properties.models import Property
            
            property = Property.objects.get(id=property_id)
            
            # Check existing viewings for the date
            existing_viewings = Booking.objects.filter(
                property=property,
                booking_type='visit',
                visit_time__date=date,
                status__in=['pending', 'confirmed']
            )
            
            # Get all time slots
            all_slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
            booked_slots = []
            
            for viewing in existing_viewings:
                if viewing.visit_time:
                    time_str = viewing.visit_time.strftime('%H:%M')
                    if time_str in all_slots:
                        booked_slots.append(time_str)
            
            available_slots = [slot for slot in all_slots if slot not in booked_slots]
            
            return Response({
                'available': len(available_slots) > 0,
                'available_slots': available_slots,
                'booked_slots': booked_slots
            })
            
        except Property.DoesNotExist:
            return Response(
                {'error': 'Property not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to check availability: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def viewing_requests(self, request):
        """Get viewing requests for a property (for property owners)"""
        property_id = request.query_params.get('property_id')
        
        if not property_id:
            return Response(
                {'error': 'Property ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from properties.models import Property
            
            property = Property.objects.get(id=property_id)
            
            # Check if user is the property owner
            if property.owner != request.user:
                return Response(
                    {'error': 'Only property owner can view viewing requests'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get viewing requests for this property
            viewings = Booking.objects.filter(
                property=property,
                booking_type='visit'
            ).select_related('renter').order_by('-created_at')
            
            serializer = self.get_serializer(viewings, many=True)
            return Response(serializer.data)
            
        except Property.DoesNotExist:
            return Response(
                {'error': 'Property not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to get viewing requests: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
