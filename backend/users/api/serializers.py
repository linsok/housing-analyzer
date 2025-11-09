from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models_evaluation import OwnerEvaluation

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for evaluation display"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'profile_picture']
        read_only_fields = fields
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class OwnerEvaluationSerializer(serializers.ModelSerializer):
    """Serializer for OwnerEvaluation model (read operations)"""
    owner = UserBasicSerializer(read_only=True)
    evaluated_by = UserBasicSerializer(read_only=True)
    reviewed_by = UserBasicSerializer(read_only=True)
    
    # Add human-readable fields
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    created_at_formatted = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)
    
    class Meta:
        model = OwnerEvaluation
        fields = [
            'id',
            'owner',
            'evaluated_by',
            'rating',
            'rating_display',
            'comments',
            'response_time',
            'property_quality',
            'communication',
            'reliability',
            'is_approved',
            'reviewed_by',
            'created_at',
            'created_at_formatted',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'evaluated_by', 'reviewed_by', 'is_approved'
        ]


class OwnerEvaluationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating OwnerEvaluation"""
    class Meta:
        model = OwnerEvaluation
        fields = [
            'owner',
            'rating',
            'comments',
            'response_time',
            'property_quality',
            'communication',
            'reliability',
        ]
    
    def validate_owner(self, value):
        """Validate that the owner has the correct role."""
        if value.role != 'owner':
            raise serializers.ValidationError("The specified user is not a property owner.")
        return value
    
    def validate(self, data):
        """Validate that either a rating or all criteria are provided."""
        has_criteria = all([
            data.get('response_time'),
            data.get('property_quality'),
            data.get('communication'),
            data.get('reliability')
        ])
        
        if not (data.get('rating') or has_criteria):
            raise serializers.ValidationError(
                "Either provide an overall rating or all individual criteria."
            )
        
        return data
    
    def create(self, validated_data):
        """Create a new evaluation."""
        # Ensure the evaluator is set to the current user
        validated_data['evaluated_by'] = self.context['request'].user
        
        # If rating is not provided, calculate it from criteria
        if 'rating' not in validated_data:
            validated_data['rating'] = self.calculate_rating(validated_data)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update an existing evaluation."""
        # If criteria are updated but rating isn't, recalculate rating
        if any(field in validated_data for field in ['response_time', 'property_quality', 'communication', 'reliability']):
            if 'rating' not in validated_data:
                criteria = {
                    'response_time': validated_data.get('response_time', instance.response_time),
                    'property_quality': validated_data.get('property_quality', instance.property_quality),
                    'communication': validated_data.get('communication', instance.communication),
                    'reliability': validated_data.get('reliability', instance.reliability),
                }
                validated_data['rating'] = self.calculate_rating(criteria)
        
        return super().update(instance, validated_data)
    
    @staticmethod
    def calculate_rating(criteria):
        """Calculate overall rating from individual criteria."""
        total = 0
        count = 0
        
        for field in ['response_time', 'property_quality', 'communication', 'reliability']:
            if field in criteria and criteria[field] is not None:
                total += criteria[field]
                count += 1
        
        return round(total / count) if count > 0 else 0


class OwnerEvaluationMetricsSerializer(serializers.Serializer):
    """Serializer for owner evaluation metrics"""
    total_evaluations = serializers.IntegerField()
    average_rating = serializers.FloatField()
    rating_distribution = serializers.ListField(child=serializers.DictField())
    average_response_time = serializers.FloatField(required=False)
    average_property_quality = serializers.FloatField(required=False)
    average_communication = serializers.FloatField(required=False)
    average_reliability = serializers.FloatField(required=False)
    recent_evaluations = serializers.ListField(required=False)
    percentile_rank = serializers.DictField(required=False)
    overall_percentile = serializers.FloatField(required=False)
