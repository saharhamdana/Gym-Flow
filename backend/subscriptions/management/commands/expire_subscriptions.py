# Fichier: backend/subscriptions/management/commands/expire_subscriptions.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from subscriptions.models import Subscription

class Command(BaseCommand):
    help = 'Expire les abonnements dont la date de fin est dépassée'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        
        expired_subscriptions = Subscription.objects.filter(
            status='ACTIVE',
            end_date__lt=today
        )
        
        count = 0
        for subscription in expired_subscriptions:
            subscription.mark_as_expired()
            count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'{count} abonnement(s) expiré(s)')
        )