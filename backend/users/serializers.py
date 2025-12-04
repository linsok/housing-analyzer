from rest_framework import serializers
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
