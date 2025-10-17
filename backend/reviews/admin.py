from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['property', 'reviewer', 'overall_rating', 'is_verified', 'created_at']
    list_filter = ['overall_rating', 'is_verified', 'created_at']
    search_fields = ['property__title', 'reviewer__username', 'comment']
