"""
Health check endpoint to verify deployment
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.conf import settings
import os

@require_http_methods(["GET"])
def health_check(request):
    """Simple health check to verify deployment"""
    try:
        return JsonResponse({
            'status': 'healthy',
            'message': 'Housing Analyzer API is working',
            'version': '1.0.0',
            'environment': 'production' if not settings.DEBUG else 'development',
            'railway_domain': os.getenv('RAILWAY_PUBLIC_DOMAIN', 'not-set'),
            'timestamp': '2025-01-16T12:45:00Z'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'message': 'Health check failed'
        }, status=500)
