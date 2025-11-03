# Fichier à modifier : backend/members/views_dashboard.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from members.models import Member
# 🛑 LIGNE CORRIGÉE : Importe 'Subscription' au lieu de 'MemberSubscription'
from subscriptions.models import Subscription 
from bookings.models import Course, Booking
from django.db.models import Sum
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """
    Récupère les statistiques clés pour le tableau de bord (Dashboard.jsx).
    """
    now = timezone.now()
    # Réinitialise la date au premier jour du mois courant à minuit
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    try:
        # 1. Total members
        total_members = Member.objects.count()
        
        # 2. Active subscriptions
        # 🛑 Utilise Subscription au lieu de MemberSubscription
        active_subscriptions = Subscription.objects.filter( 
            end_date__gte=now.date(),
            status='ACTIVE'
        ).count()
        
        # 3. Upcoming courses (next 7 days)
        upcoming_courses = Course.objects.filter(
            date__gte=now.date(),
            date__lte=now.date() + timedelta(days=7)
        ).count()
        
        # 4. Monthly revenue (from active subscriptions this month)
        # 🛑 Utilise Subscription au lieu de MemberSubscription
        # 🛑 Utilise 'plan__price' (le nom du champ dans le modèle Subscription est 'plan')
        monthly_revenue = Subscription.objects.filter( 
            start_date__gte=start_of_month,
            status='ACTIVE'
        ).aggregate(
            total=Sum('plan__price') 
        )['total'] or 0 # Le champ dans Subscription est 'plan', donc l'accès se fait par 'plan__price'
        
        # ... (le reste est inchangé)
        recent_members = list(Member.objects.order_by('-created_at')[:5].values(
            'id', 'first_name', 'last_name', 'created_at'
        ))
        
        upcoming_courses_details = list(Course.objects.filter(
            date__gte=now.date(),
            date__lte=now.date() + timedelta(days=7)
        ).values(
            'id', 'title', 'date', 'start_time', 
            'max_participants'
        )[:5])
        
        
        return Response({
            'totalMembers': total_members,
            'activeSubscriptions': active_subscriptions,
            'upcomingCourses': upcoming_courses,
            'monthlyRevenue': monthly_revenue,
            'recentMembers': recent_members,
            'upcomingCoursesDetails': upcoming_courses_details
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=500
        )