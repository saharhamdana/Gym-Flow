# backend/site_utils/views.py
import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from django.utils.decorators import method_decorator

# Apply csrf_exempt to allow POST requests from the frontend without a CSRF token (typical for API forms)
@method_decorator(csrf_exempt, name='dispatch')
class ContactFormSubmissionView(View):
    def post(self, request, *args, **kwargs):
        try:
            # 1. Parse incoming JSON data from the React frontend
            data = json.loads(request.body)
            full_name = data.get('fullName')
            email = data.get('email')
            message = data.get('message')

            # Basic Validation
            if not all([full_name, email, message]):
                return JsonResponse({'message': 'All fields are required.'}, status=400)

            # 2. Prepare and Send the Email
            subject = f'New Contact Form Submission from: {full_name}'

            # Format the message body
            email_body = (
                f"You have received a new message from the website.\n\n"
                f"Name: {full_name}\n"
                f"Email: {email}\n"
                f"Message:\n---\n{message}\n---"
            )

            send_mail(
                subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,  # Sender email
                [settings.RECIPIENT_EMAIL],   # Recipient email list
                fail_silently=False,
            )

            # 3. Send success response back to the frontend
            return JsonResponse({'message': 'Message sent successfully!'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format in request.'}, status=400)
        except Exception as e:
            # Log the error for debugging
            print(f"Email sending failed: {e}")
            return JsonResponse({'message': 'An error occurred while sending the message. Check server logs.'}, status=500)