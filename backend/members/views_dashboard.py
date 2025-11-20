# Fichier : backend/members/views_dashboard.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from members.models import Member
from subscriptions.models import Subscription 
from bookings.models import Course, Booking
from django.db.models import Sum
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Récupère les statistiques clés pour le tableau de bord.
    ✅ ISOLÉ PAR TENANT - chaque centre voit uniquement ses données
    """
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    try:
        user = request.user
        
        # ✅ Récupérer le tenant_id du centre actuel
        gym_center = getattr(request, 'gym_center', None)
        tenant_id = gym_center.tenant_id if gym_center else user.tenant_id
        
        if not tenant_id:
            return Response({
                'error': 'Aucun centre associé',
                'detail': 'Impossible de déterminer le centre pour les statistiques'
            }, status=400)
        
        # 🔒 LOGIQUE EN FONCTION DU RÔLE
        if user.role == 'ADMIN' or user.role == 'RECEPTIONIST':
            # ✅ ADMIN/RÉCEPTIONNISTE : Voir toutes les statistiques du centre
            total_members = Member.objects.filter(tenant_id=tenant_id).count()
            
            active_subscriptions = Subscription.objects.filter(
                tenant_id=tenant_id,
                end_date__gte=now.date(),
                status='ACTIVE'
            ).count()
            
            upcoming_courses = Course.objects.filter(
                tenant_id=tenant_id,
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7),
                status='SCHEDULED'
            ).count()
            
            monthly_revenue = Subscription.objects.filter(
                tenant_id=tenant_id,
                start_date__gte=start_of_month,
                status='ACTIVE'
            ).aggregate(total=Sum('plan__price'))['total'] or 0
            
            recent_members = list(Member.objects.filter(
                tenant_id=tenant_id
            ).order_by('-created_at')[:5].values(
                'id', 'first_name', 'last_name', 'created_at'
            ))
            
            upcoming_courses_details = list(Course.objects.filter(
                tenant_id=tenant_id,
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7),
                status='SCHEDULED'
            ).values('id', 'title', 'date', 'start_time', 'max_participants')[:5])
            
        elif user.role == 'COACH':
            # ✅ COACH : Voir uniquement ses cours du centre
            total_members = 0
            active_subscriptions = 0
            
            upcoming_courses = Course.objects.filter(
                tenant_id=tenant_id,
                coach=user,
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7),
                status='SCHEDULED'
            ).count()
            
            monthly_revenue = 0
            recent_members = []
            
            upcoming_courses_details = list(Course.objects.filter(
                tenant_id=tenant_id,
                coach=user,
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7),
                status='SCHEDULED'
            ).values('id', 'title', 'date', 'start_time', 'max_participants')[:5])
            
        elif user.role == 'MEMBER':
            # ✅ MEMBRE : Voir uniquement ses propres données
            try:
                member = user.member_profile
                
                # Vérifier que le membre appartient au bon centre
                if member.tenant_id != tenant_id:
                    return Response({
                        'error': 'Accès refusé',
                        'detail': 'Vous n\'appartenez pas à ce centre'
                    }, status=403)
                
                total_members = 1  # Lui-même
                active_subscriptions = Subscription.objects.filter(
                    tenant_id=tenant_id,
                    member=member,
                    end_date__gte=now.date(),
                    status='ACTIVE'
                ).count()
                
                # Ses réservations à venir
                upcoming_courses = Booking.objects.filter(
                    tenant_id=tenant_id,
                    member=member,
                    course__date__gte=now.date(),
                    status='CONFIRMED'
                ).count()
                
                monthly_revenue = 0
                recent_members = []
                
                upcoming_courses_details = list(
                    Booking.objects.filter(
                        tenant_id=tenant_id,
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
            # Autre rôle : statistiques limitées
            total_members = Member.objects.filter(tenant_id=tenant_id).count()
            active_subscriptions = Subscription.objects.filter(
                tenant_id=tenant_id,
                end_date__gte=now.date(),
                status='ACTIVE'
            ).count()
            upcoming_courses = Course.objects.filter(
                tenant_id=tenant_id,
                date__gte=now.date(),
                date__lte=now.date() + timedelta(days=7),
                status='SCHEDULED'
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
            'upcomingCoursesDetails': upcoming_courses_details,
            'tenantId': tenant_id,  # ✅ Retourner le tenant_id pour debug
            'centerName': gym_center.name if gym_center else 'N/A'
        })
        
    except Exception as e:
        print(f"❌ Erreur dashboard_stats : {e}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=500
        )