"""
Django settings for housing_analyzer project.
"""

from pathlib import Path
from datetime import timedelta
from decouple import config
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production-abc123def456')

# SECURITY WARNING: keep debug false in production
DEBUG = config('DEBUG', default=False, cast=bool)

# Automatically add Railway domain to allowed hosts
railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', '')
if railway_domain:
    ALLOWED_HOSTS = config('ALLOWED_HOSTS', default=f'localhost,127.0.0.1,{railway_domain}').split(',')
else:
    ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    
    # Local apps
    'users',
    'properties',
    'bookings',
    'analytics',
    'payments',
    'reviews',
    'custom_admin.apps.CustomAdminConfig',  # Custom admin theme
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'housing_analyzer.cors_middleware.CustomCORSMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.ContentSecurityPolicyMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'housing_analyzer.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'housing_analyzer.wsgi.application'

# Database Configuration
# Check if running on Railway (production)
import os

# Use PyMySQL as MySQL backend
import pymysql
pymysql.install_as_MySQLdb()

if os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('RAILWAY_PUBLIC_DOMAIN'):
    # Railway MySQL Database Configuration
    database_url = os.getenv('DATABASE_URL') or os.getenv('MYSQL_URL')
    if database_url:
        DATABASES = {
            'default': dj_database_url.parse(database_url)
        }
    else:
        # Fallback configuration using Railway environment variables
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.mysql',
                'NAME': os.getenv('MYSQL_DATABASE', 'railway'),
                'USER': os.getenv('MYSQL_USER', 'root'),
                'PASSWORD': os.getenv('MYSQL_PASSWORD', ''),
                'HOST': os.getenv('MYSQLHOST', 'mysql.railway.internal'),
                'PORT': os.getenv('MYSQLPORT', '3306'),
                'OPTIONS': {
                    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
                }
            }
        }
else:
    # Local MySQL Database Configuration (for development)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'housing_analyzer',  # Database name
            'USER': 'root',             # MySQL username
            'PASSWORD': 'Soklin0976193630',  # MySQL password
            'HOST': 'localhost',        # Database host
            'PORT': '3306',             # MySQL port (default is 3306)
            'OPTIONS': {
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES', time_zone='+07:00'",
                'charset': 'utf8mb4',
            },
            'TIME_ZONE': 'Asia/Phnom_Penh',
            'USE_TZ': True,
            'TEST': {
                'CHARSET': 'utf8mb4',
                'COLLATION': 'utf8mb4_unicode_ci',
            }
        }
    }

# Option 2: SQLite (Simple, for development only)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# Option 3: MySQL (requires MySQL server and mysqlclient package)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': config('DB_NAME', default='housing_analyzer'),
#         'USER': config('DB_USER', default='root'),
#         'PASSWORD': config('DB_PASSWORD', default=''),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='3306'),
#         'OPTIONS': {
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#         }
#     }
# }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Phnom_Penh'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'custom_admin/static'),
]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Production media settings
if not DEBUG:
    # Use full domain for media URLs in production
    railway_domain = os.getenv('RAILWAY_PUBLIC_DOMAIN', '')
    if railway_domain:
        MEDIA_URL = f'https://{railway_domain}/media/'
    else:
        MEDIA_URL = '/media/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://housing-analyzer.vercel.app",
    "https://housing-analyzer-git-main-soklins-projects-7e089e19.vercel.app",
    "https://housing-analyzer-mfj5pg7fz-soklins-projects-7e089e19.vercel.app",
    "https://*.vercel.app",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

# Allow all origins for development (remove in production)
CORS_ALLOW_ALL_ORIGINS = True

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = False  # Disabled to prevent redirect loop on Railway
    SESSION_COOKIE_SECURE = False  # Disabled for Railway
    CSRF_COOKIE_SECURE = False  # Disabled for Railway
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# URL settings
APPEND_SLASH = False  # Disable automatic slash appending

# CSRF settings
CSRF_COOKIE_SECURE = False  # Disabled for Railway
CSRF_COOKIE_HTTPONLY = False
CSRF_TRUSTED_ORIGINS = ["https://web-production-6f713.up.railway.app"]
CSRF_ALLOW_ALL_ORIGINS = True  # Allow all origins for development

# Email settings (configure for production)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@housinganalyzer.com')

# Payment settings
STRIPE_PUBLIC_KEY = config('STRIPE_PUBLIC_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')

# Google Maps API
GOOGLE_MAPS_API_KEY = config('GOOGLE_MAPS_API_KEY', default='')

# Bakong KHQR Payment Configuration
BAKONG_API_TOKEN = config('BAKONG_API_TOKEN', default='')
BAKONG_BANK_ACCOUNT = config('BAKONG_BANK_ACCOUNT', default='')
BAKONG_MERCHANT_NAME = config('BAKONG_MERCHANT_NAME', default='Housing Analyzer')
BAKONG_MERCHANT_CITY = config('BAKONG_MERCHANT_CITY', default='Phnom Penh')
BAKONG_PHONE_NUMBER = config('BAKONG_PHONE_NUMBER', default='')



# Add this at the end of settings.py
print("\n=== Email Configuration ===")
print(f"EMAIL_BACKEND: {EMAIL_BACKEND}")
print(f"EMAIL_HOST: {EMAIL_HOST}")
print(f"EMAIL_PORT: {EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {EMAIL_USE_TLS}")
print(f"EMAIL_HOST_USER: {'set' if EMAIL_HOST_USER else 'NOT SET'}")
print(f"DEFAULT_FROM_EMAIL: {DEFAULT_FROM_EMAIL}")
print("=========================\n")