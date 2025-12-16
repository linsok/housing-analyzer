from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'property', 'booking', 'reviewer', 'reviewer_name',
            'overall_rating', 'cleanliness', 'accuracy', 'location', 'value',
            'title', 'comment', 'is_verified', 'owner_response', 'responded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['reviewer', 'is_verified', 'owner_response', 'responded_at']
    
    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class OwnerResponseSerializer(serializers.Serializer):
    owner_response = serializers.CharField()
