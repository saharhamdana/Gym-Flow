# Fichier : backend/members/views_dashboard.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Q, Avg
from datetime import timedelta, datetime
import logging

from .models import Member

logger = logging.getLogger('members.views_dashboard')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    📊 Statistiques complètes pour le dashboard
    Filtré automatiquement par tenant_id
    """
    now = timezone.now()
    today = now.date()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_of_week = today - timedelta(days=today.weekday())
    
    try:
        user = request.user
        tenant_id = getattr(request, 'tenant_id', None)
        gym_center = getattr(request, 'gym_center', None)
        
        logger.debug(f"🔍 Dashboard pour user: {user.email}, tenant_id: {tenant_id}")
        
        # 📦 Import local pour éviter la circularité
        from subscriptions.models import Subscription, SubscriptionPlan
        from bookings.models import Course, Booking
        
        # 🏢 INFORMATIONS DU CENTRE
        center_info = {
            'name': gym_center.name if gym_center else 'Gym Flow',
            'subdomain': gym_center.subdomain if gym_center else None,
            'logo': gym_center.logo.url if gym_center and gym_center.logo else None,
        }
        
        # 🔒 FILTRAGE PAR RÔLE
        if user.role == 'ADMIN' or user.role == 'RECEPTIONIST':
            # ✅ ADMIN/RÉCEPTIONNISTE : Toutes les stats du centre
            members_qs = Member.objects.filter(tenant_id=tenant_id) if tenant_id else Member.objects.all()
            subscriptions_qs = Subscription.objects.filter(tenant_id=tenant_id) if tenant_id else Subscription.objects.all()
            courses_qs = Course.objects.filter(tenant_id=tenant_id) if tenant_id else Course.objects.all()
            bookings_qs = Booking.objects.filter(tenant_id=tenant_id) if tenant_id else Booking.objects.all()
            
            # 📊 STATISTIQUES PRINCIPALES
            total_members = members_qs.count()
            active_members = members_qs.filter(status='ACTIVE').count()
            inactive_members = members_qs.filter(status='INACTIVE').count()
            
            # 📈 ABONNEMENTS
            active_subscriptions = subscriptions_qs.filter(
                status='ACTIVE',
                end_date__gte=today
            ).count()
            
            expiring_soon = subscriptions_qs.filter(
                status='ACTIVE',
                end_date__gte=today,
                end_date__lte=today + timedelta(days=7)
            ).count()
            
            # 💰 REVENUS
            monthly_revenue = subscriptions_qs.filter(
                start_date__gte=start_of_month,
                status='ACTIVE'
            ).aggregate(total=Sum('amount_paid'))['total'] or 0
            
            # Revenus du mois dernier pour comparaison
            last_month_start = (start_of_month - timedelta(days=1)).replace(day=1)
            last_month_revenue = subscriptions_qs.filter(
                start_date__gte=last_month_start,
                start_date__lt=start_of_month,
                status='ACTIVE'
            ).aggregate(total=Sum('amount_paid'))['total'] or 0
            
            revenue_change = ((monthly_revenue - last_month_revenue) / last_month_revenue * 100) if last_month_revenue > 0 else 0
            
            # 📅 COURS
            upcoming_courses = courses_qs.filter(
                date__gte=today,
                date__lte=today + timedelta(days=7),
                status='SCHEDULED'
            ).count()
            
            today_courses = courses_qs.filter(
                date=today
            ).count()
            
            # 📊 RÉSERVATIONS
            total_bookings = bookings_qs.filter(
                course__date__gte=start_of_month
            ).count()
            
            confirmed_bookings = bookings_qs.filter(
                course__date__gte=start_of_month,
                status='CONFIRMED'
            ).count()
            
            attendance_rate = (confirmed_bookings / total_bookings * 100) if total_bookings > 0 else 0
            
            # 👥 NOUVEAUX MEMBRES (7 derniers jours)
            new_members_count = members_qs.filter(
                created_at__gte=now - timedelta(days=7)
            ).count()
            
            # 📈 ÉVOLUTION DES MEMBRES (30 derniers jours)
            members_evolution = []
            for i in range(30, -1, -1):
                date = today - timedelta(days=i)
                count = members_qs.filter(
                    created_at__date__lte=date,
                    status='ACTIVE'
                ).count()
                members_evolution.append({
                    'date': date.isoformat(),
                    'count': count
                })
            
            # 💳 PLANS D'ABONNEMENT LES PLUS POPULAIRES
            popular_plans = subscriptions_qs.filter(
                status='ACTIVE'
            ).values(
                'plan__name', 'plan__price'
            ).annotate(
                count=Count('id')
            ).order_by('-count')[:5]
            
            # 📅 PROCHAINS COURS (5 prochains)
            upcoming_courses_details = list(
                courses_qs.filter(
                    date__gte=today,
                    status='SCHEDULED'
                ).select_related('course_type', 'coach', 'room').order_by('date', 'start_time')[:5].values(
                    'id', 'title', 'date', 'start_time', 'end_time',
                    'course_type__name', 'coach__first_name', 'coach__last_name',
                    'room__name', 'max_participants'
                )
            )
            
            # 👤 NOUVEAUX MEMBRES (5 derniers)
            recent_members = list(
                members_qs.order_by('-created_at')[:5].values(
                    'id', 'member_id', 'first_name', 'last_name', 
                    'email', 'photo', 'created_at', 'status'
                )
            )
            
            # 📊 STATISTIQUES PAR STATUT DE MEMBRE
            member_status_stats = {
                'active': active_members,
                'inactive': inactive_members,
                'suspended': members_qs.filter(status='SUSPENDED').count(),
                'expired': members_qs.filter(status='EXPIRED').count(),
            }
            
            # 🎯 TAUX D'OCCUPATION DES COURS
            total_course_capacity = courses_qs.filter(
                date__gte=start_of_month,
                status='SCHEDULED'
            ).aggregate(total=Sum('max_participants'))['total'] or 0
            
            total_course_bookings = bookings_qs.filter(
                course__date__gte=start_of_month,
                status='CONFIRMED'
            ).count()
            
            course_occupancy_rate = (total_course_bookings / total_course_capacity * 100) if total_course_capacity > 0 else 0
            
            return Response({
                'center': center_info,
                'overview': {
                    'totalMembers': total_members,
                    'activeMembers': active_members,
                    'newMembersThisWeek': new_members_count,
                    'activeSubscriptions': active_subscriptions,
                    'expiringSubscriptions': expiring_soon,
                    'upcomingCourses': upcoming_courses,
                    'todayCourses': today_courses,
                    'monthlyRevenue': float(monthly_revenue),
                    'revenueChange': round(revenue_change, 1),
                    'attendanceRate': round(attendance_rate, 1),
                    'courseOccupancyRate': round(course_occupancy_rate, 1),
                },
                'memberStats': member_status_stats,
                'membersEvolution': members_evolution,
                'popularPlans': list(popular_plans),
                'upcomingCoursesDetails': upcoming_courses_details,
                'recentMembers': recent_members,
            })
            
        elif user.role == 'COACH':
            # ✅ COACH : Uniquement ses cours
            coach_courses = Course.objects.filter(
                coach=user,
                tenant_id=tenant_id
            ) if tenant_id else Course.objects.filter(coach=user)
            
            upcoming_courses = coach_courses.filter(
                date__gte=today,
                date__lte=today + timedelta(days=7),
                status='SCHEDULED'
            ).count()
            
            today_courses = coach_courses.filter(date=today).count()
            
            upcoming_courses_details = list(
                coach_courses.filter(
                    date__gte=today,
                    status='SCHEDULED'
                ).select_related('course_type', 'room').order_by('date', 'start_time')[:5].values(
                    'id', 'title', 'date', 'start_time', 'end_time',
                    'course_type__name', 'room__name', 'max_participants'
                )
            )
            
            return Response({
                'center': center_info,
                'overview': {
                    'totalMembers': 0,
                    'activeMembers': 0,
                    'newMembersThisWeek': 0,
                    'activeSubscriptions': 0,
                    'expiringSubscriptions': 0,
                    'upcomingCourses': upcoming_courses,
                    'todayCourses': today_courses,
                    'monthlyRevenue': 0,
                    'revenueChange': 0,
                    'attendanceRate': 0,
                    'courseOccupancyRate': 0,
                },
                'upcomingCoursesDetails': upcoming_courses_details,
            })
            
        elif user.role == 'MEMBER':
            # ✅ MEMBRE : Uniquement ses données
            try:
                member = user.member_profile
                
                my_subscriptions = Subscription.objects.filter(
                    member=member,
                    tenant_id=tenant_id
                ) if tenant_id else Subscription.objects.filter(member=member)
                
                active_subscription = my_subscriptions.filter(
                    status='ACTIVE',
                    end_date__gte=today
                ).first()
                
                my_bookings = Booking.objects.filter(
                    member=member,
                    tenant_id=tenant_id
                ) if tenant_id else Booking.objects.filter(member=member)
                
                upcoming_bookings = my_bookings.filter(
                    course__date__gte=today,
                    status='CONFIRMED'
                ).count()
                
                upcoming_courses_details = list(
                    my_bookings.filter(
                        course__date__gte=today,
                        status='CONFIRMED'
                    ).select_related('course').order_by('course__date', 'course__start_time')[:5].values(
                        'course__id', 'course__title', 'course__date', 
                        'course__start_time', 'course__end_time',
                        'course__course_type__name', 'course__room__name'
                    )
                )
                
                return Response({
                    'center': center_info,
                    'overview': {
                        'totalMembers': 1,
                        'activeMembers': 1 if member.status == 'ACTIVE' else 0,
                        'activeSubscriptions': 1 if active_subscription else 0,
                        'upcomingCourses': upcoming_bookings,
                        'monthlyRevenue': 0,
                    },
                    'activeSubscription': {
                        'plan': active_subscription.plan.name if active_subscription else None,
                        'endDate': active_subscription.end_date.isoformat() if active_subscription else None,
                        'daysRemaining': active_subscription.days_remaining if active_subscription else 0,
                    } if active_subscription else None,
                    'upcomingCoursesDetails': upcoming_courses_details,
                })
                
            except Member.DoesNotExist:
                return Response({
                    'center': center_info,
                    'overview': {
                        'totalMembers': 0,
                        'activeMembers': 0,
                        'activeSubscriptions': 0,
                        'upcomingCourses': 0,
                        'monthlyRevenue': 0,
                    },
                })
        
        else:
            return Response({
                'center': center_info,
                'overview': {
                    'totalMembers': 0,
                    'activeMembers': 0,
                    'activeSubscriptions': 0,
                    'upcomingCourses': 0,
                    'monthlyRevenue': 0,
                },
            })
        
    except Exception as e:
        logger.error(f"❌ Erreur dashboard_stats : {e}")
        import traceback
        traceback.print_exc()
        
        return Response(
            {
                'error': 'Erreur serveur',
                'detail': str(e),
                'center': {'name': 'Gym Flow', 'subdomain': None, 'logo': None},
                'overview': {
                    'totalMembers': 0,
                    'activeMembers': 0,
                    'activeSubscriptions': 0,
                    'upcomingCourses': 0,
                    'monthlyRevenue': 0,
                },
            },
            status=200
        )