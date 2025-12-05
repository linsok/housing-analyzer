from django.contrib import admin
from .models import Property, PropertyImage, PropertyDocument, Favorite, PropertyView, Report


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


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
    list_display = ['property', 'is_primary', 'is_qr_code', 'order', 'created_at']
    list_filter = ['is_primary', 'is_qr_code']
    search_fields = ['property__title', 'caption']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'property', 'created_at']
    search_fields = ['user__username', 'property__title']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['property', 'reported_by', 'reason', 'status', 'created_at']
    list_filter = ['reason', 'status', 'created_at']
    search_fields = ['property__title', 'reported_by__username', 'description']
