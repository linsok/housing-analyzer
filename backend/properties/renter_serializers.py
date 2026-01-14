from rest_framework import serializers
from .models import Property, PropertyImage

class SimplePropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_primary']
        read_only_fields = fields

class PropertySerializer(serializers.ModelSerializer):
    """Simple property serializer for renter dashboard"""
    primary_image = serializers.SerializerMethodField()
    images = SimplePropertyImageSerializer(many=True, read_only=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'property_type', 'city', 'area', 'rent_price', 'currency',
            'bedrooms', 'bathrooms', 'area_sqm', 'is_furnished', 'status',
            'primary_image', 'images', 'owner_name'
        ]
        read_only_fields = fields

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return self.context['request'].build_absolute_uri(primary.image.url)
        return None

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"
