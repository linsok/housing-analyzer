"""
MySQL Database Configuration for Housing Analyzer
"""
from pathlib import Path
import os
from .settings import *

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'housing_analyzer',  # New database name
        'USER': 'root',             # Default MySQL user
        'PASSWORD': 'Soklin0976193630',  # Replace with your MySQL root password
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        }
    }
}
