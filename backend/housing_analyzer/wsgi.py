"""
WSGI config for housing_analyzer project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')

application = get_wsgi_application()
