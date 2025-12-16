from django.contrib import admin
from django.utils.html import format_html
from .models import Property, PropertyImage, PropertyDocument, Favorite, PropertyView, Report


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    readonly_fields = ['image_thumbnail']
    fields = ['image', 'image_thumbnail', 'caption', 'is_primary', 'is_qr_code', 'order']
    
    def image_thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
        return "No image"
    image_thumbnail.short_description = 'Preview'


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'property_type', 'city', 'rent_price', 
                    'status', 'verification_status', 'created_at']
    list_filter = ['property_type', 'status', 'verification_status', 'city', 'is_furnished']
    search_fields = ['title', 'description', 'city', 'area', 'owner__username']
    inlines = [PropertyImageInline]
    readonly_fields = ['view_count', 'favorite_count', 'rating', 'created_at', 'updated_at']


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'image_thumbnail', 'caption', 'is_primary', 'is_qr_code_badge', 'order', 'created_at']
    list_filter = ['is_primary', 'is_qr_code', 'created_at']
    search_fields = ['property__title', 'caption']
    readonly_fields = ['image_thumbnail']
    ordering = ['property', 'order', '-is_qr_code', '-is_primary']
    
    def image_thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
        return "No image"
    image_thumbnail.short_description = 'Preview'
    
    def is_qr_code_badge(self, obj):
        if obj.is_qr_code:
            return format_html('<span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 4px;">QR Code</span>')
        return "No"
    is_qr_code_badge.short_description = 'QR Code'
    is_qr_code_badge.admin_order_field = 'is_qr_code'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'property', 'created_at']
    search_fields = ['user__username', 'property__title']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['property', 'reported_by', 'reason', 'status', 'created_at']
    list_filter = ['reason', 'status', 'created_at']
    search_fields = ['property__title', 'reported_by__username', 'description']
