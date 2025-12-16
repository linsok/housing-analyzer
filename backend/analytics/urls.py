from django.urls import path
from . import views

urlpatterns = [
    path('rent-trends/', views.rent_trends, name='rent-trends'),
    path('city-comparison/', views.city_comparison, name='city-comparison'),
    path('popular-areas/', views.popular_areas, name='popular-areas'),
    path('property-demand/', views.property_demand, name='property-demand'),
    path('owner-analytics/', views.owner_analytics, name='owner-analytics'),
    path('renter-analytics/', views.renter_analytics, name='renter-analytics'),
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('market-trends/', views.market_trends_comprehensive, name='market-trends-comprehensive'),
]
