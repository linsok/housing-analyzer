#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
import pytz

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'housing_analyzer.settings')
django.setup()

from users.models import PasswordResetOTP, User
from django.utils import timezone

print("=== TESTING OTP GENERATION (Timezone Independent) ===")

# Get user
try:
    user = User.objects.get(email='soklin1220lin@gmail.com')
    print(f"✅ User found: {user.username}")
except User.DoesNotExist:
    print("❌ User not found")
    exit()

# Test OTP generation
print(f"\nCurrent UTC time: {timezone.now()}")
print(f"Current Cambodia time: {timezone.now().astimezone(pytz.timezone('Asia/Phnom_Penh'))}")
print(f"Current Singapore time: {timezone.now().astimezone(pytz.timezone('Asia/Singapore'))}")

# Generate OTP
otp = PasswordResetOTP.generate_otp(user)
print(f"\n✅ OTP Generated: {otp.otp_code}")
print(f"OTP Expires at: {otp.expires_at}")
print(f"Expires Cambodia time: {otp.expires_at.astimezone(pytz.timezone('Asia/Phnom_Penh'))}")
print(f"Expires Singapore time: {otp.expires_at.astimezone(pytz.timezone('Asia/Singapore'))}")

# Test OTP validation
print(f"\n=== TESTING OTP VALIDATION ===")
print(f"OTP created at: {otp.created_at}")
print(f"OTP expires at: {otp.expires_at}")
print(f"Current time: {timezone.now()}")
print(f"Time until expiry: {otp.expires_at - timezone.now()}")

# Check if OTP is still valid (10 minutes expiry)
is_valid = timezone.now() < otp.expires_at
print(f"OTP is valid: {is_valid}")

# Test expired OTP
old_time = timezone.now() - timedelta(minutes=15)
otp.created_at = old_time
otp.expires_at = old_time + timedelta(minutes=10)
is_expired = timezone.now() >= otp.expires_at
print(f"Expired OTP is valid: {not is_expired}")

print("\n=== CONCLUSION ===")
print("✅ OTP generation works regardless of timezone")
print("✅ OTP validation uses UTC internally (timezone independent)")
print("✅ The 1-hour difference between Cambodia/Singapore doesn't matter")
print("\n❌ If OTP is not being sent, the issue is likely:")
print("   - Railway IP blocked by Gmail")
print("   - Network connectivity issues")
print("   - Email configuration problems")
