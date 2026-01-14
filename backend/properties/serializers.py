from rest_framework import serializers
import json
from .models import Property, PropertyImage, PropertyDocument, Favorite, PropertyView, Report
from users.serializers import UserSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Always build full URL for images
        if instance.image and hasattr(instance.image, 'url'):
            image_url = instance.image.url
            if request and hasattr(request, 'build_absolute_uri'):
                # Build full URL for API requests
                data['image'] = request.build_absolute_uri(image_url)
            else:
                # For admin or other contexts, ensure full URL
                if not image_url.startswith('http'):
                    from django.conf import settings
                    image_url = f"https://web-production-6f713.up.railway.app{image_url}"
                data['image'] = image_url
        else:
            # Fallback placeholder if no real image
            property_id = instance.property.id if instance.property else 'Unknown'
            data['image'] = f"https://picsum.photos/400/300?random={property_id}"
        
        return data
    
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'caption', 'is_primary', 'order', 'created_at']


class PropertyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyDocument
        fields = ['id', 'document', 'document_type', 'description', 'uploaded_at']


class PropertyListSerializer(serializers.ModelSerializer):
    """Serializer for property list view"""
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_verified = serializers.BooleanField(source='owner.is_verified', read_only=True)
    owner_phone = serializers.CharField(source='owner.phone', read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'property_type', 'address', 'city', 'area', 'rent_price', 'currency',
            'bedrooms', 'bathrooms', 'area_sqm', 'is_furnished', 'status',
            'verification_status', 'rating', 'view_count', 'primary_image',
            'owner_name', 'owner_verified', 'owner_phone', 'is_favorited', 'created_at'
        ]
    
    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return self.context['request'].build_absolute_uri(primary.image.url) if primary.image else None
        first_image = obj.images.first()
        return self.context['request'].build_absolute_uri(first_image.image.url) if first_image and first_image.image else None
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, property=obj).exists()
        return False


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Serializer for property detail view"""
    owner = UserSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    documents = PropertyDocumentSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    is_verified = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'owner', 'title', 'description', 'property_type', 'address',
            'city', 'district', 'area', 'postal_code', 'latitude', 'longitude',
            'rent_price', 'deposit', 'currency', 'bedrooms', 'bathrooms', 'area_sqm',
            'floor_number', 'is_furnished', 'facilities', 'rules', 'pets_allowed',
            'smoking_allowed', 'status', 'verification_status', 'is_verified',
            'view_count', 'favorite_count', 'rating', 'available_from',
            'use_bakong_payment', 'bakong_bank_account', 'bakong_merchant_name', 'bakong_phone_number',
            'images', 'documents', 'is_favorited', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'owner', 'verification_status', 'view_count', 'favorite_count',
            'rating', 'created_at', 'updated_at'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, property=obj).exists()
        return False


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating properties"""
    
    def to_internal_value(self, data):
        # Handle facilities field that might come as JSON string
        print(f"Received data: {data}")
        if 'facilities' in data:
            print(f"Facilities field type: {type(data['facilities'])}")
            print(f"Facilities field value: {data['facilities']}")
            
        if 'facilities' in data and isinstance(data['facilities'], str):
            try:
                data['facilities'] = json.loads(data['facilities'])
                print(f"Parsed facilities: {data['facilities']}")
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing facilities: {e}")
                data['facilities'] = []
        
        return super().to_internal_value(data)
    
    class Meta:
        model = Property
        fields = [
            'title', 'description', 'property_type', 'address', 'city', 'district',
            'area', 'postal_code', 'latitude', 'longitude', 'rent_price', 'deposit',
            'currency', 'bedrooms', 'bathrooms', 'area_sqm', 'floor_number',
            'is_furnished', 'facilities', 'rules', 'pets_allowed', 'smoking_allowed',
            'status', 'available_from', 'use_bakong_payment', 'bakong_bank_account', 
            'bakong_merchant_name', 'bakong_phone_number'
        ]
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Reset verification status to pending when property is updated
        instance.verification_status = 'pending'
        instance.verified_at = None
        instance.verified_by = None
        return super().update(instance, validated_data)


class FavoriteSerializer(serializers.ModelSerializer):
    property = serializers.SerializerMethodField()
    
    class Meta:
        model = Favorite
        fields = ['id', 'property', 'created_at']
    
    def get_property(self, obj):
        """Get property with images"""
        property_obj = obj.property
        images = []
        for img in property_obj.images.all():
            images.append({
                'id': img.id,
                'image': self.context['request'].build_absolute_uri(img.image.url) if img.image else None,
                'is_primary': getattr(img, 'is_primary', False),
                'is_qr_code': getattr(img, 'is_qr_code', False),
                'order': getattr(img, 'order', 0)
            })
        
        return {
            'id': property_obj.id,
            'title': property_obj.title,
            'property_type': property_obj.property_type,
            'city': property_obj.city,
            'area': property_obj.area,
            'district': property_obj.district,
            'address': property_obj.address,
            'rent_price': str(property_obj.rent_price),
            'deposit': str(property_obj.deposit),
            'currency': property_obj.currency,
            'bedrooms': property_obj.bedrooms,
            'bathrooms': property_obj.bathrooms,
            'area_sqm': str(property_obj.area_sqm) if property_obj.area_sqm else None,
            'is_furnished': property_obj.is_furnished,
            'status': property_obj.status,
            'verification_status': property_obj.verification_status,
            'rating': str(property_obj.rating),
            'view_count': property_obj.view_count,
            'favorite_count': property_obj.favorite_count,
            'images': images,
            'created_at': property_obj.created_at.isoformat(),
        }


class ReportSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    property_title = serializers.CharField(source='property.title', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'property', 'property_title', 'reported_by', 'reason',
            'description', 'status', 'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['reported_by', 'status', 'admin_notes', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['reported_by'] = self.context['request'].user
        return super().create(validated_data)


class PropertyVerificationSerializer(serializers.Serializer):
    """Serializer for admin to verify properties"""
    verification_status = serializers.ChoiceField(choices=['verified', 'rejected'])
    notes = serializers.CharField(required=False, allow_blank=True)
