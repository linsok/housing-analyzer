from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging
import pytz

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email notifications"""
    
    @staticmethod
    def send_booking_completion_notification(booking):
        """
        Send email notification to renter when booking is marked as completed
        
        Args:
            booking: Booking instance that was completed
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        logger.info(f"Starting to send booking completion notification for booking {booking.id}")
        try:
            if not booking.renter or not booking.renter.email:
                logger.error(f"Cannot send email: No renter or renter email for booking {booking.id}")
                return False
                
            renter_email = booking.renter.email
            owner_name = booking.property.owner.full_name or booking.property.owner.username
            property_title = booking.property.title
            property_address = booking.property.address
            completion_date = booking.updated_at  # Use updated_at since completed_at doesn't exist
            
            logger.debug(f"Preparing email for booking {booking.id} to {renter_email}")
            logger.debug(f"Property: {property_title}, Owner: {owner_name}, Completion Date: {completion_date}")
            
            # Email context
            context = {
                'renter_name': booking.renter.full_name or booking.renter.username,
                'owner_name': owner_name,
                'property_title': property_title,
                'property_address': property_address,
                'completion_date': completion_date,
                'booking_id': booking.id,
                'start_date': booking.start_date,
                'total_amount': booking.total_amount,
                'deposit_amount': booking.deposit_amount,
                'owner_phone': booking.property.owner.phone,
            }
            
            # Render email template
            subject = f"Booking Completed - {property_title}"
            
            # HTML email body (skip template if not found)
            try:
                html_message = render_to_string('emails/booking_completion.html', context)
            except:
                html_message = None  # Fallback to plain text if template not found
            
            # Plain text email body (fallback)
            text_message = f"""
Dear {context['renter_name']},

We are pleased to inform you that your booking has been successfully completed!

Booking Details:
- Property: {property_title}
- Address: {property_address}
- Booking ID: {booking.id}
- Start Date: {booking.start_date}
- Completion Date: {completion_date.strftime('%B %d, %Y')}

Payment Summary:
- Deposit Amount: ${booking.deposit_amount}
- Total Amount: ${booking.total_amount}

Property Owner Contact:
- Name: {owner_name}
- Phone: {booking.property.owner.phone if booking.property.owner.phone else 'Not provided'}

The property owner, {owner_name}, has marked your booking as completed. This means your rental arrangement has been successfully finalized.

If you have any questions or need assistance, please feel free to contact the property owner directly using the contact information above.

Thank you for choosing Housing Analyzer for your rental needs!

Best regards,
Housing Analyzer Team
group05support@housinganalyzer.com
+855 97 756 9023
            """.strip()
            
            # Check email settings
            if not hasattr(settings, 'EMAIL_HOST') or not settings.EMAIL_HOST:
                logger.error("Email settings not configured. Cannot send email.")
                return False
                
            # Log email details (without sensitive data)
            logger.info(f"Sending email to: {renter_email}")
            logger.debug(f"Email subject: {subject}")
            
            # Log email settings for debugging
            logger.info(f"Email settings - HOST: {getattr(settings, 'EMAIL_HOST', 'NOT SET')}")
            logger.info(f"Email settings - PORT: {getattr(settings, 'EMAIL_PORT', 'NOT SET')}")
            logger.info(f"Email settings - USER: {'SET' if getattr(settings, 'EMAIL_HOST_USER', '') else 'NOT SET'}")
            logger.info(f"DEFAULT_FROM_EMAIL: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'NOT SET')}")
            logger.info(f"EMAIL_USE_TLS: {getattr(settings, 'EMAIL_USE_TLS', 'NOT SET')}")
            
            try:
                # Send email with settings from configuration
                send_mail(
                    subject=subject,
                    message=text_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[renter_email],
                    html_message=html_message,
                    fail_silently=False,
                    auth_user=settings.EMAIL_HOST_USER,
                    auth_password=settings.EMAIL_HOST_PASSWORD
                )
                logger.info(f"Booking completion email sent successfully to {renter_email} for booking {booking.id}")
                return True
            except Exception as send_error:
                logger.error(f"Failed to send email to {renter_email} for booking {booking.id}: {str(send_error)}", exc_info=True)
                return False
            return True
            
        except Exception as e:
            logger.error(f"Failed to send booking completion email for booking {booking.id}: {str(e)}")
            return False
    
    @staticmethod
    def send_checkout_notification(booking):
        """
        Send email notification to renter when they check out from a rental property
        
        Args:
            booking: Booking instance that was checked out
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        logger.info(f"Starting to send checkout notification for booking {booking.id}")
        try:
            if not booking.renter or not booking.renter.email:
                logger.error(f"Cannot send email: No renter or renter email for booking {booking.id}")
                return False
                
            renter_email = booking.renter.email
            owner_name = booking.property.owner.full_name or booking.property.owner.username
            property_title = booking.property.title
            property_address = booking.property.address
            checkout_date = booking.completed_at
            start_date = booking.start_date
            
            logger.debug(f"Preparing checkout email for booking {booking.id} to {renter_email}")
            logger.debug(f"Property: {property_title}, Owner: {owner_name}, Checkout Date: {checkout_date}")
            
            # Email context
            context = {
                'renter_name': booking.renter.full_name or booking.renter.username,
                'owner_name': owner_name,
                'property_title': property_title,
                'property_address': property_address,
                'checkout_date': checkout_date,
                'start_date': start_date,
                'booking_id': booking.id,
                'monthly_rent': booking.monthly_rent,
                'owner_phone': booking.property.owner.phone,
            }
            
            # Render email template
            subject = f"Check Out Confirmation - {property_title}"
            
            # HTML email body (skip template if not found)
            try:
                html_message = render_to_string('emails/checkout_confirmation.html', context)
            except:
                html_message = None  # Fallback to plain text if template not found
            
            # Plain text email body (fallback)
            text_message = f"""
Dear {context['renter_name']},

Thank you for staying at {property_title}! We hope you had a wonderful experience.

Check Out Details:
- Property: {property_title}
- Address: {property_address}
- Booking ID: {booking.id}
- Move In Date: {start_date.strftime('%B %d, %Y') if start_date else 'N/A'}
- Check Out Date: {checkout_date.strftime('%B %d, %Y at %I:%M %p') if checkout_date else 'N/A'}

Property Owner Contact:
- Name: {owner_name}
- Phone: {booking.property.owner.phone if booking.property.owner.phone else 'Not provided'}

Your rental period has been successfully completed. The property owner, {owner_name}, has processed your check out.

We hope you enjoyed your stay and appreciate your business! If you're looking for a new place to rent, feel free to browse our platform again.

If you have any questions about your check out or need assistance with future bookings, please don't hesitate to contact us.

Thank you for choosing Housing Analyzer for your rental needs!

Best regards,
Housing Analyzer Team
group05support@housinganalyzer.com
+855 97 756 9023
            """.strip()
            
            # Check email settings
            if not hasattr(settings, 'EMAIL_HOST') or not settings.EMAIL_HOST:
                logger.error("Email settings not configured. Cannot send email.")
                return False
                
            # Log email details (without sensitive data)
            logger.info(f"Sending checkout email to: {renter_email}")
            logger.debug(f"Email subject: {subject}")
            
            try:
                # Send email with settings from configuration
                send_mail(
                    subject=subject,
                    message=text_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[renter_email],
                    html_message=html_message,
                    fail_silently=False,
                    auth_user=settings.EMAIL_HOST_USER,
                    auth_password=settings.EMAIL_HOST_PASSWORD
                )
                logger.info(f"Checkout notification email sent successfully to {renter_email} for booking {booking.id}")
                return True
            except Exception as send_error:
                logger.error(f"Failed to send checkout email to {renter_email} for booking {booking.id}: {str(send_error)}", exc_info=True)
                return False
            
        except Exception as e:
            logger.error(f"Failed to send checkout email for booking {booking.id}: {str(e)}")
            return False

    @staticmethod
    def send_visit_completion_notification(booking):
        """
        Send email notification to renter when property visit is marked as completed
        
        Args:
            booking: Booking instance (visit type) that was completed
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        logger.info(f"Starting to send visit completion notification for booking {booking.id}")
        try:
            if not booking.renter or not booking.renter.email:
                logger.error(f"Cannot send email: No renter or renter email for booking {booking.id}")
                return False
                
            renter_email = booking.renter.email
            owner_name = booking.property.owner.full_name or booking.property.owner.username
            property_title = booking.property.title
            property_address = booking.property.address
            visit_time = booking.visit_time
            
            logger.debug(f"Preparing visit completion email for booking {booking.id} to {renter_email}")
            logger.debug(f"Property: {property_title}, Owner: {owner_name}, Visit Time: {visit_time}")
            
            # Email context
            context = {
                'renter_name': booking.renter.full_name or booking.renter.username,
                'owner_name': owner_name,
                'property_title': property_title,
                'property_address': property_address,
                'visit_time': visit_time,
                'booking_id': booking.id,
                'owner_phone': booking.property.owner.phone,
            }
            
            # Render email template
            subject = f"Property Visit Completed - {property_title}"
            
            # HTML email body (skip template if not found)
            try:
                html_message = render_to_string('emails/visit_completion.html', context)
            except:
                html_message = None  # Fallback to plain text if template not found
            
            # Plain text email body (fallback)
            text_message = f"""
Dear {context['renter_name']},

We hope you enjoyed your property visit!

Visit Details:
- Property: {property_title}
- Address: {property_address}
- Booking ID: {booking.id}
- Visit Time: {visit_time.strftime('%B %d, %Y at %I:%M %p')}

Property Owner Contact:
- Name: {owner_name}
- Phone: {booking.property.owner.phone if booking.property.owner.phone else 'Not provided'}

The property owner, {owner_name}, has marked your visit as completed. We hope you found the property suitable for your needs.

If you're interested in renting this property or have any questions about the visit, please feel free to contact the property owner directly using the contact information above.

Thank you for choosing Housing Analyzer for your property search!

Best regards,
Housing Analyzer Team
"""
            
            # Send email
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[renter_email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Visit completion notification sent successfully to {renter_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send visit completion email for booking {booking.id}: {str(e)}")
            return False
    
    @staticmethod
    def send_booking_confirmation_notification(booking):
        """
        Send email notification to renter when booking is confirmed
        
        Args:
            booking: Booking instance that was confirmed
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            renter_email = booking.renter.email
            owner_name = booking.property.owner.full_name or booking.property.owner.username
            property_title = booking.property.title
            property_address = booking.property.address
            
            # Email context
            context = {
                'renter_name': booking.renter.full_name or booking.renter.username,
                'owner_name': owner_name,
                'property_title': property_title,
                'property_address': property_address,
                'booking_id': booking.id,
                'start_date': booking.start_date,
                'total_amount': booking.total_amount,
                'deposit_amount': booking.deposit_amount,
                'owner_phone': booking.property.owner.phone,
            }
            
            # Render email template
            subject = f"Booking Confirmed - {property_title}"
            
            # HTML email body (skip template if not found)
            try:
                html_message = render_to_string('emails/booking_confirmation.html', context)
            except:
                html_message = None  # Fallback to plain text if template not found
            
            # Plain text email body (fallback)
            text_message = f"""
Dear {context['renter_name']},

Great news! Your booking has been confirmed by the property owner.

Booking Details:
- Property: {property_title}
- Address: {property_address}
- Booking ID: {booking.id}
- Start Date: {booking.start_date}

Payment Summary:
- Deposit Amount: ${booking.deposit_amount}
- Total Amount: ${booking.total_amount}

Property Owner Contact:
- Name: {owner_name}
- Phone: {booking.property.owner.phone if booking.property.owner.phone else 'Not provided'}

The property owner, {owner_name}, has confirmed your booking. Please prepare for your move-in on the scheduled date.

If you have any questions or need assistance, please feel free to contact the property owner directly using the contact information above.

Thank you for choosing Housing Analyzer for your rental needs!

Best regards,
Housing Analyzer Team
group05support@housinganalyzer.com
+855 97 756 9023
            """.strip()
            
            # Send email with settings from configuration
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[renter_email],
                html_message=html_message,
                fail_silently=False,
                auth_user=settings.EMAIL_HOST_USER,
                auth_password=settings.EMAIL_HOST_PASSWORD
            )
            
            logger.info(f"Booking confirmation email sent to {renter_email} for booking {booking.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send booking confirmation email for booking {booking.id}: {str(e)}")
            return False
