from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import UserPreference, PasswordResetOTP
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserVerificationSerializer,
    AdminVerifyUserSerializer, UserPreferenceSerializer, UserProfileSerializer,
    EmailTokenObtainPairSerializer, PasswordResetRequestSerializer,
    OTPVerifySerializer, PasswordResetConfirmSerializer
)

User = get_user_model()


class EmailTokenObtainPairView(TokenObtainPairView):
    """Token obtain pair view that authenticates users via email."""
    serializer_class = EmailTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'register':
            return UserRegistrationSerializer
        elif self.action == 'profile':
            return UserProfileSerializer
        elif self.action == 'upload_verification':
            return UserVerificationSerializer
        return UserSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Register a new user"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create user preferences
        UserPreference.objects.create(user=user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """Get or update current user profile"""
        user = request.user
        
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(old_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})
    
    @action(detail=False, methods=['post'])
    def upload_verification(self, request):
        """Upload verification documents (for property owners)"""
        user = request.user
        
        if user.role != 'owner':
            return Response(
                {'error': 'Only property owners can upload verification documents'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(verification_status='pending')
        
        return Response({
            'message': 'Verification documents uploaded successfully',
            'user': UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        """Admin verifies a property owner"""
        user = self.get_object()
        serializer = AdminVerifyUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        verification_status = serializer.validated_data['verification_status']
        user.verification_status = verification_status
        
        if verification_status == 'verified':
            user.verified_at = timezone.now()
            user.verified_by = request.user
            user.trust_score = 5.00  # Initial trust score
        
        user.save()
        
        return Response({
            'message': f'User {verification_status} successfully',
            'user': UserSerializer(user).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending_verifications(self, request):
        """Get all users pending verification"""
        users = User.objects.filter(
            role='owner',
            verification_status='pending'
        )
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)


class PublicAuthViewSet(viewsets.GenericViewSet):
    """ViewSet for public authentication endpoints (no auth required)"""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def forgot_password(self, request):
        """Send OTP for password reset"""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate OTP
        otp = PasswordResetOTP.generate_otp(user)
        
        # Send OTP email
        try:
            send_mail(
                subject='Password Reset OTP - My Rentor',
                message=f'''
Hello {user.first_name or user.username},

You requested a password reset for your My Rentor account.

Your OTP code is: {otp.otp_code}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

Thank you,
My Rentor Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'OTP sent successfully to your email'
            })
            
        except Exception as e:
            return Response({
                'error': 'Failed to send OTP email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        """Verify OTP for password reset"""
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        return Response({
            'message': 'OTP verified successfully',
            'email': serializer.validated_data['email']
        })
    
    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        """Reset password using OTP"""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        otp = serializer.otp
        new_password = serializer.validated_data['new_password']
        
        # Update user password
        user = otp.user
        user.set_password(new_password)
        user.save()
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        return Response({
            'message': 'Password reset successfully'
        })


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for user preferences"""
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def my_preferences(self, request):
        """Get or update current user preferences"""
        preference, created = UserPreference.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(preference)
            return Response(serializer.data)
        
        serializer = self.get_serializer(preference, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
