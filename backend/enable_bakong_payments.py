#!/usr/bin/env python
"""
Script to enable Bakong payment for existing properties
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from properties.models import Property

def enable_bakong_for_properties():
    """Enable Bakong payment for all existing properties"""
    properties = Property.objects.all()
    updated_count = 0
    
    print(f"Found {properties.count()} properties")
    
    for property in properties:
        # Enable Bakong payment if not already enabled
        if not property.use_bakong_payment:
            property.use_bakong_payment = True
            
            # Set default Bakong configuration if not already set
            if not property.bakong_bank_account:
                property.bakong_bank_account = "sok_lin@bkrt"  # Default from env.example
            
            if not property.bakong_merchant_name:
                property.bakong_merchant_name = f"{property.title} - Housing Analyzer"
            
            if not property.bakong_phone_number:
                property.bakong_phone_number = "855977569023"  # Default from env.example
            
            property.save()
            updated_count += 1
            print(f"✓ Enabled Bakong for property: {property.title}")
        else:
            print(f"- Bakong already enabled for property: {property.title}")
    
    print(f"\nSummary: Updated {updated_count} properties")

if __name__ == "__main__":
    enable_bakong_for_properties()
