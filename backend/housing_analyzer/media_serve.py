"""
Media file serving for production
"""
import os
from django.conf import settings
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_GET
from django.core.exceptions import SuspiciousOperation


@require_GET
def media_serve(request, path):
    """
    Serve media files in production.
    This is a simple replacement for Django's static serving in DEBUG mode.
    """
    media_root = settings.MEDIA_ROOT
    
    # Security: ensure the path is safe
    full_path = os.path.join(media_root, path)
    
    # Ensure the path is within media_root
    if not os.path.abspath(full_path).startswith(os.path.abspath(media_root)):
        raise SuspiciousOperation("Attempted access to file outside media root")
    
    # Check if file exists
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise Http404(f"Media file not found: {path}")
    
    # Determine content type
    content_type = 'application/octet-stream'
    if path.lower().endswith(('.jpg', '.jpeg')):
        content_type = 'image/jpeg'
    elif path.lower().endswith('.png'):
        content_type = 'image/png'
    elif path.lower().endswith('.gif'):
        content_type = 'image/gif'
    elif path.lower().endswith('.webp'):
        content_type = 'image/webp'
    
    # Serve the file
    try:
        with open(full_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(path)}"'
            return response
    except IOError:
        raise Http404(f"Error reading media file: {path}")
