from django.urls import path
from . import recommendation_views

urlpatterns = [
    # Recommendation endpoints
    path('recommendations/', recommendation_views.RecommendationView.as_view(), name='property-recommendations'),
    path('similar/<int:property_id>/', recommendation_views.SimilarPropertiesView.as_view(), name='similar-properties'),
    path('popular/', recommendation_views.PopularPropertiesView.as_view(), name='popular-properties'),
]
