# Generated manually to fix updated_at field default value issue

from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_booking_contact_phone_booking_member_count_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=timezone.now),
        ),
    ]
