from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Avg, Count
from .models import Property, PropertyImage, PropertyDocument, Favorite, PropertyView, Report


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    readonly_fields = ['image_thumbnail']
    fields = ['image', 'image_thumbnail', 'caption', 'is_primary', 'order']
    
    def image_thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
        return "No image"
    image_thumbnail.short_description = 'Preview'


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'property_type', 'city', 'rent_price', 
                    'rating_display', 'rating_count', 'status', 'verification_status', 'created_at']
    list_filter = ['property_type', 'status', 'verification_status', 'city', 'is_furnished']
    search_fields = ['title', 'description', 'city', 'area', 'owner__username']
    inlines = [PropertyImageInline]
    readonly_fields = ['view_count', 'favorite_count', 'rating', 'rating_count_display', 'created_at', 'updated_at']
    
    def rating_display(self, obj):
        """Display rating with stars"""
        if obj.rating and obj.rating > 0:
            stars = '★' * int(round(obj.rating))
            empty_stars = '☆' * (5 - int(round(obj.rating)))
            return format_html(
                '<span style="color: #f39c12; font-size: 16px;">{}{}</span> ({})',
                stars, empty_stars, round(obj.rating, 1)
            )
        return '<span style="color: #999;">No ratings</span>'
    rating_display.short_description = 'Rating'
    rating_display.allow_tags = True
    
    def rating_count(self, obj):
        """Display number of ratings"""
        count = obj.reviews.count()
        if count > 0:
            return format_html('<span style="font-weight: bold;">{}</span> rating{}'.format(
                count, 's' if count != 1 else ''
            ))
        return '<span style="color: #999;">No ratings</span>'
    rating_count.short_description = 'Rating Count'
    rating_count.allow_tags = True
    
    def rating_count_display(self, obj):
        """Display rating count in readonly fields"""
        count = obj.reviews.count()
        return f"{count} rating{'s' if count != 1 else ''}"
    rating_count_display.short_description = 'Rating Count'


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'image_thumbnail', 'caption', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['property__title', 'caption']
    readonly_fields = ['image_thumbnail']
    ordering = ['property', 'order', '-is_primary']
    
    def image_thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" />', obj.image.url)
        return "No image"
    image_thumbnail.short_description = 'Preview'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'property', 'created_at']
    search_fields = ['user__username', 'property__title']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['property', 'reported_by', 'reason', 'status', 'created_at']
    list_filter = ['reason', 'status', 'created_at']
    search_fields = ['property__title', 'reported_by__username', 'description']
