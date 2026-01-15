from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import qrcode
from io import BytesIO
from django.core.files import File
from decimal import Decimal
from .models import Payment, QRCode
from .serializers import PaymentSerializer, QRCodeSerializer
from .bakong_service import bakong_service
from .enhanced_bakong_service import enhanced_bakong_service


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for payment management"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Payment.objects.all()
        elif user.role == 'owner':
            return Payment.objects.filter(booking__property__owner=user)
        else:  # renter
            return Payment.objects.filter(user=user)
    
    @action(detail=True, methods=['post'])
    def generate_qr(self, request, pk=None):
        """Generate QR code for payment"""
        payment = self.get_object()
        
        if payment.user != request.user:
            return Response(
                {'error': 'You can only generate QR codes for your own payments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate QR code data
        qr_data = f"PAYMENT:{payment.id}:AMOUNT:{payment.amount}:CURRENCY:{payment.currency}"
        
        # Create QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Create or update QR code
        qr_code, created = QRCode.objects.get_or_create(
            payment=payment,
            defaults={
                'qr_data': qr_data,
                'expires_at': timezone.now() + timedelta(hours=24)
            }
        )
        
        qr_code.qr_image.save(f'qr_payment_{payment.id}.png', File(buffer), save=True)
        
        serializer = QRCodeSerializer(qr_code, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm payment (by property owner or admin)"""
        payment = self.get_object()
        
        if request.user.role not in ['admin', 'owner']:
            return Response(
                {'error': 'Only admin or property owner can confirm payments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.user.role == 'owner' and payment.booking.property.owner != request.user:
            return Response(
                {'error': 'You can only confirm payments for your properties'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        payment.status = 'completed'
        payment.completed_at = timezone.now()
        payment.notes = request.data.get('notes', '')
        payment.save()
        
        # Update booking status
        payment.booking.status = 'confirmed'
        payment.booking.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_proof(self, request, pk=None):
        """Upload payment proof"""
        payment = self.get_object()
        
        if payment.user != request.user:
            return Response(
                {'error': 'You can only upload proof for your own payments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        payment_proof = request.FILES.get('payment_proof')
        if not payment_proof:
            return Response(
                {'error': 'No payment proof provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.payment_proof = payment_proof
        payment.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def generate_khqr(self, request):
        """Generate Bakong KHQR code for payment"""
        try:
            amount = request.data.get('amount')
            currency = request.data.get('currency', 'KHR')
            property_title = request.data.get('property_title', 'Property Booking')
            booking_id = request.data.get('booking_id', '')
            renter_name = request.data.get('renter_name', '')
            property_id = request.data.get('property_id')
            
            if not amount:
                return Response(
                    {'error': 'Amount is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get property and check Bakong configuration
            bakong_bank_account = None
            bakong_merchant_name = None
            bakong_phone_number = None
            
            if property_id:
                try:
                    from properties.models import Property
                    property = Property.objects.get(id=property_id)
                    
                    if property.use_bakong_payment and property.bakong_bank_account:
                        bakong_bank_account = property.bakong_bank_account
                        bakong_merchant_name = property.bakong_merchant_name or property.title
                        bakong_phone_number = property.bakong_phone_number
                    else:
                        return Response(
                            {'error': 'This property does not have Bakong payment enabled'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Property.DoesNotExist:
                    return Response(
                        {'error': 'Property not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Convert amount to Decimal
            try:
                amount_decimal = Decimal(str(amount))
            except:
                return Response(
                    {'error': 'Invalid amount format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate KHQR code using enhanced service
            khqr_data = enhanced_bakong_service.generate_qr_code_enhanced(
                amount=amount_decimal,
                currency=currency,
                property_title=property_title,
                booking_id=booking_id,
                renter_name=renter_name,
                bakong_bank_account=bakong_bank_account,
                bakong_merchant_name=bakong_merchant_name,
                bakong_phone_number=bakong_phone_number
            )
            
            return Response(khqr_data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate KHQR code: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def check_payment_status(self, request):
        """Check Bakong payment status"""
        try:
            md5_hash = request.data.get('md5_hash')
            
            if not md5_hash:
                return Response(
                    {'error': 'MD5 hash is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check payment status using enhanced service
            status_info = enhanced_bakong_service.check_payment_status_enhanced(md5_hash)
            
            return Response(status_info)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to check payment status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def get_payment_details(self, request):
        """Get Bakong payment details"""
        try:
            md5_hash = request.data.get('md5_hash')
            
            if not md5_hash:
                return Response(
                    {'error': 'MD5 hash is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get payment details
            payment_info = bakong_service.get_payment_details(md5_hash)
            
            return Response(payment_info)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get payment details: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
