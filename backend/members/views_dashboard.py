# Fichier : backend/members/views_dashboard.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta

# ✅ Import sans risque de circularité
from .models import Member

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Statistiques pour le tableau de bord.
    Accessible à tous les utilisateurs authentifiés.
    """
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    try:
        user = request.user
        
        # 🔒 LOGIQUE EN FONCTION DU RÔLE
        if user.role == 'ADMIN':
            # ✅ ADMIN : Voir toutes les statistiques
            from subscriptions.models import Subscription  # Import local
            from bookings.models import Course
            
            total_members = Member.objects.count()
            active_subscriptions = Subscription.objects.filter(
                end_date__gte=now.date(),
                status='ACTIVE'
            ).count()
            
            upcoming_courses = Course.objects.filter(
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7)
            ).count()
            
            monthly_revenue = Subscription.objects.filter(
                start_date__gte=start_of_month,
                status='ACTIVE'
            ).aggregate(total=Sum('plan__price'))['total'] or 0
            
            recent_members = list(Member.objects.order_by('-created_at')[:5].values(
                'id', 'first_name', 'last_name', 'created_at'
            ))
            
            upcoming_courses_details = list(Course.objects.filter(
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7)
            ).values('id', 'title', 'date', 'start_time', 'max_participants')[:5])
            
        elif user.role == 'COACH':
            # ✅ COACH : Voir uniquement ses cours
            from bookings.models import Course
            
            total_members = 0
            active_subscriptions = 0
            
            upcoming_courses = Course.objects.filter(
                coach=user,
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7)
            ).count()
            
            monthly_revenue = 0
            recent_members = []
            
            upcoming_courses_details = list(Course.objects.filter(
                coach=user,
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7)
            ).values('id', 'title', 'date', 'start_time', 'max_participants')[:5])
            
        elif user.role == 'MEMBER':
            # ✅ MEMBRE : Voir uniquement ses propres données
            from subscriptions.models import Subscription
            from bookings.models import Booking
            
            try:
                member = user.member_profile
                total_members = 1
                
                active_subscriptions = Subscription.objects.filter(
                    member=member,
                    end_date__gte=now.date(),
                    status='ACTIVE'
                ).count()
                
                upcoming_courses = Booking.objects.filter(
                    member=member,
                    course__date__gte=now.date(),
                    status='CONFIRMED'
                ).count()
                
                monthly_revenue = 0
                recent_members = []
                
                upcoming_courses_details = list(
                    Booking.objects.filter(
                        member=member,
                        course__date__gte=now.date(),
                        status='CONFIRMED'
                    ).values(
                        'course__id', 'course__title', 'course__date', 
                        'course__start_time', 'course__max_participants'
                    )[:5]
                )
                
            except Member.DoesNotExist:
                # Membre sans profil
                total_members = 0
                active_subscriptions = 0
                upcoming_courses = 0
                monthly_revenue = 0
                recent_members = []
                upcoming_courses_details = []
        
        elif user.role == 'RECEPTIONIST':
            # ✅ RÉCEPTIONNISTE : Statistiques limitées
            total_members = Member.objects.count()
            
            from subscriptions.models import Subscription
            from bookings.models import Course
            
            active_subscriptions = Subscription.objects.filter(
                end_date__gte=now.date(),
                status='ACTIVE'
            ).count()
            
            upcoming_courses = Course.objects.filter(
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7)
            ).count()
            
            monthly_revenue = 0
            recent_members = []
            upcoming_courses_details = []
        
        else:
            # Rôle inconnu
            total_members = 0
            active_subscriptions = 0
            upcoming_courses = 0
            monthly_revenue = 0
            recent_members = []
            upcoming_courses_details = []
        
        return Response({
            'totalMembers': total_members,
            'activeSubscriptions': active_subscriptions,
            'upcomingCourses': upcoming_courses,
            'monthlyRevenue': float(monthly_revenue) if monthly_revenue else 0,
            'recentMembers': recent_members,
            'upcomingCoursesDetails': upcoming_courses_details
        })
        
    except Exception as e:
        print(f"❌ Erreur dashboard_stats : {e}")
        import traceback
        traceback.print_exc()
        
        return Response(
            {
                'error': 'Erreur serveur',
                'detail': str(e),
                'totalMembers': 0,
                'activeSubscriptions': 0,
                'upcomingCourses': 0,
                'monthlyRevenue': 0,
                'recentMembers': [],
                'upcomingCoursesDetails': []
            },
            status=200  # ✅ Retourner 200 au lieu de 500 pour éviter l'erreur frontend
        )