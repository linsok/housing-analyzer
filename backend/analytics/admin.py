from django.contrib import admin
from .models import RentTrend, PopularSearch


@admin.register(RentTrend)
class RentTrendAdmin(admin.ModelAdmin):
    list_display = ['city', 'area', 'property_type', 'average_rent', 'property_count', 'month', 'year']
    list_filter = ['city', 'property_type', 'year', 'month']


@admin.register(PopularSearch)
class PopularSearchAdmin(admin.ModelAdmin):
    list_display = ['search_term', 'city', 'property_type', 'search_count', 'last_searched']
    list_filter = ['city', 'property_type']
    ordering = ['-search_count']
