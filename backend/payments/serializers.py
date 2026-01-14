from rest_framework import serializers
from .models import Payment, QRCode


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'user', 'amount', 'currency', 'payment_method',
            'status', 'transaction_id', 'payment_proof', 'description', 'notes',
            'created_at', 'completed_at'
        ]
        read_only_fields = ['user', 'status', 'transaction_id', 'completed_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = ['id', 'payment', 'qr_image', 'qr_data', 'expires_at', 'created_at']
