from django.contrib import admin
from .models import Payment, QRCode


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'user', 'amount', 'payment_method', 'status', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['user__username', 'transaction_id']


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ['payment', 'expires_at', 'created_at']
    list_filter = ['created_at']
