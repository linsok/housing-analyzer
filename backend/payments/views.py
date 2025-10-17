from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import qrcode
from io import BytesIO
from django.core.files import File
from .models import Payment, QRCode
from .serializers import PaymentSerializer, QRCodeSerializer


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
