"""
Public test views for Bakong debugging
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .test_bakong_library import test_bakong_library

@require_http_methods(["GET"])
def public_test_bakong(request):
    """Public test endpoint for Bakong library"""
    try:
        result = test_bakong_library()
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse(
            {'error': f'Test failed: {str(e)}'},
            status=500
        )
