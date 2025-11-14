# Fichier : backend/members/views_dashboard.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated  # ✅ Changé de IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from members.models import Member
from subscriptions.models import Subscription 
from bookings.models import Course, Booking
from django.db.models import Sum
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ✅ Accessible à tous les utilisateurs authentifiés
def dashboard_stats(request):
    """
    Récupère les statistiques clés pour le tableau de bord.
    
    ⚠️ IMPORTANT : 
    - Les admins voient toutes les statistiques
    - Les membres voient uniquement leurs propres données
    - Les coachs voient leurs cours et leurs membres
    """
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    try:
        user = request.user
        
        # 🔒 LOGIQUE EN FONCTION DU RÔLE
        if user.role == 'ADMIN':
            # ✅ ADMIN : Voir toutes les statistiques
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
            total_members = 0  # Ou le nombre de membres qu'il coache
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
            try:
                member = user.member_profile
                total_members = 1  # Lui-même
                active_subscriptions = Subscription.objects.filter(
                    member=member,
                    end_date__gte=now.date(),
                    status='ACTIVE'
                ).count()
                
                # Ses réservations à venir
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
                # Membre sans profil membre
                total_members = 0
                active_subscriptions = 0
                upcoming_courses = 0
                monthly_revenue = 0
                recent_members = []
                upcoming_courses_details = []
        
        else:
            # RÉCEPTIONNISTE ou autre rôle : statistiques limitées
            total_members = Member.objects.count()
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
        
        return Response({
            'totalMembers': total_members,
            'activeSubscriptions': active_subscriptions,
            'upcomingCourses': upcoming_courses,
            'monthlyRevenue': monthly_revenue,
            'recentMembers': recent_members,
            'upcomingCoursesDetails': upcoming_courses_details
        })
        
    except Exception as e:
        print(f"❌ Erreur dashboard_stats : {e}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=500
        )