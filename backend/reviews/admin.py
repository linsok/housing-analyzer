from django.contrib import admin
from django.utils.html import format_html
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['property', 'reviewer', 'rating_stars', 'is_verified', 'created_at']
    list_filter = ['overall_rating', 'is_verified', 'created_at']
    search_fields = ['property__title', 'reviewer__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    
    def rating_stars(self, obj):
        """Display rating with stars"""
        if obj.overall_rating:
            stars = '★' * obj.overall_rating
            empty_stars = '☆' * (5 - obj.overall_rating)
            return format_html(
                '<span style="color: #f39c12; font-size: 16px;">{}{}</span> ({}/5)',
                stars, empty_stars, obj.overall_rating
            )
        return 'No rating'
    rating_stars.short_description = 'Rating'
    rating_stars.allow_tags = True
