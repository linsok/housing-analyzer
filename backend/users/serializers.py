from rest_framework import serializers
from django.core.exceptions import MultipleObjectsReturned
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import UserPreference

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    full_name = serializers.ReadOnlyField()
    is_verified = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'profile_picture', 'bio', 'verification_status',
            'is_verified', 'address', 'city', 'country', 'trust_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['verification_status', 'trust_score', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserVerificationSerializer(serializers.ModelSerializer):
    """Serializer for property owner verification"""
    class Meta:
        model = User
        fields = ['id_document', 'business_license']


class AdminVerifyUserSerializer(serializers.Serializer):
    """Serializer for admin to verify users"""
    verification_status = serializers.ChoiceField(choices=['verified', 'rejected'])
    notes = serializers.CharField(required=False, allow_blank=True)


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""
    class Meta:
        model = UserPreference
        fields = [
            'id', 'preferred_cities', 'preferred_areas', 'min_price', 'max_price',
            'property_types', 'furnished', 'required_facilities',
            'email_notifications', 'sms_notifications'
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """Complete user profile with preferences"""
    preferences = UserPreferenceSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    is_verified = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'profile_picture', 'bio', 'verification_status',
            'is_verified', 'address', 'city', 'country', 'trust_score',
            'preferences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['verification_status', 'trust_score']


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allow users to authenticate with their email address."""
    email = serializers.EmailField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Username field is populated automatically once we resolve the email
        self.fields[self.username_field].required = False

    def validate(self, attrs):
        email = attrs.pop('email', None)
        password = attrs.get('password')

        if not email:
            raise serializers.ValidationError({'email': 'This field is required.'})
        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('No active account found with the given credentials')
        except MultipleObjectsReturned:
            raise AuthenticationFailed('No active account found with the given credentials')

        attrs[self.username_field] = user.username

        return super().validate(attrs)
