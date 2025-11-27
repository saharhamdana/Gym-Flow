# backend/members/portal_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

from .models import Member, MemberMeasurement
from .serializers import MemberDetailSerializer, MemberMeasurementSerializer
from subscriptions.models import Subscription, SubscriptionPlan
from subscriptions.serializers import SubscriptionDetailSerializer, SubscriptionPlanSerializer
from bookings.models import Booking, Course
from bookings.serializers import BookingDetailSerializer, CourseListSerializer
from coaching.models import TrainingProgram
from coaching.serializers import TrainingProgramSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_subscriptions(request):
    """📋 Liste des abonnements du membre connecté"""
    try:
        user = request.user
        
        # ✅ Vérifier le rôle
        if user.role != 'MEMBER':
            return Response({
                'error': 'Accès refusé',
                'message': 'Cette fonctionnalité est réservée aux membres'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # ✅ Récupérer le profil Member
        try:
            member = user.member_profile
            print(f"✅ User ID: {user.id} → Member ID: {member.id}")
        except Member.DoesNotExist:
            return Response({
                'error': 'Profil membre introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # ✅ CORRECTION : Filtrer par member (pas juste tenant_id)
        subscriptions = Subscription.objects.filter(
            member=member,  # ⭐ FILTRE CRUCIAL
            tenant_id=request.tenant_id
        ).select_related('plan').order_by('-created_at')
        
        print(f"✅ Abonnements trouvés pour {member.member_id}: {subscriptions.count()}")
        
        # Sérialiser
        serializer = SubscriptionDetailSerializer(subscriptions, many=True)
        
        return Response(serializer.data)
        
    except Exception as e:
        print(f"❌ Erreur my_subscriptions: {str(e)}")
        return Response({
            'error': 'Erreur serveur',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_dashboard(request):
    """
    📊 Dashboard membre avec toutes les infos
    
    ✅ CORRECTION: Utilise user.member_profile
    """
    try:
        user = request.user
        
        # ✅ Vérifier le rôle
        if user.role != 'MEMBER':
            return Response({
                'error': 'Accès refusé'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # ✅ Récupérer le Member via la relation
        try:
            member = user.member_profile
        except Member.DoesNotExist:
            return Response({
                'error': 'Profil membre introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        
        # ✅ Abonnement actif via member
        active_subscription = Subscription.objects.filter(
            member=member,  # ✅ Pas member_id=user.id !
            status='ACTIVE',
            end_date__gte=today
        ).select_related('plan').first()
        
        # ✅ Abonnements en attente via member
        pending_subscriptions = Subscription.objects.filter(
            member=member,
            status='PENDING'
        ).select_related('plan')
        
        # Statistiques
        total_subscriptions = Subscription.objects.filter(member=member).count()
        
        return Response({
            'member': {
                'id': member.id,
                'member_id': member.member_id,
                'full_name': member.full_name,
                'email': member.email,
                'status': member.status,
            },
            'active_subscription': {
                'id': active_subscription.id,
                'plan_name': active_subscription.plan.name,
                'end_date': active_subscription.end_date,
                'days_remaining': active_subscription.days_remaining,
            } if active_subscription else None,
            'pending_subscriptions': SubscriptionListSerializer(pending_subscriptions, many=True).data,
            'statistics': {
                'total_subscriptions': total_subscriptions,
            }
        })
        
    except Exception as e:
        print(f"❌ Erreur member_dashboard: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Erreur serveur',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_courses(request):
    """
    📅 Cours disponibles pour réservation
    Filtres: date, type, coach
    """
    user = request.user
    member = user.member_profile
    
    # Filtres
    date_from = request.GET.get('date_from', timezone.now().date())
    date_to = request.GET.get('date_to', timezone.now().date() + timedelta(days=14))
    course_type = request.GET.get('course_type')
    coach = request.GET.get('coach')
    
    # Cours disponibles (non complets, non passés, non annulés)
    courses = Course.objects.filter(
        tenant_id=request.tenant_id,
        date__gte=date_from,
        date__lte=date_to,
        status='SCHEDULED'
    ).select_related('course_type', 'coach', 'room')
    
    # Filtres optionnels
    if course_type:
        courses = courses.filter(course_type_id=course_type)
    if coach:
        courses = courses.filter(coach_id=coach)
    
    # Annoter avec places disponibles
    courses_data = []
    for course in courses:
        # Vérifier si membre a déjà réservé
        already_booked = Booking.objects.filter(
            course=course,
            member=member,
            status__in=['CONFIRMED', 'PENDING']
        ).exists()
        
        courses_data.append({
            **CourseListSerializer(course).data,
            'already_booked': already_booked,
            'can_book': not course.is_full and not already_booked
        })
    
    return Response(courses_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_course(request):
    """
    📝 Réserver un cours (self-service)
    """
    user = request.user
    member = user.member_profile
    course_id = request.data.get('course_id')
    
    # 1️⃣ VÉRIFICATIONS
    
    # Vérifier abonnement actif
    if not member.has_active_subscription:
        return Response({
            'error': 'Abonnement requis',
            'message': 'Vous devez avoir un abonnement actif pour réserver un cours'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        course = Course.objects.select_related('course_type', 'room', 'coach').get(id=course_id)
    except Course.DoesNotExist:
        return Response({
            'error': 'Cours introuvable'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Vérifier que le cours n'est pas complet
    if course.is_full:
        return Response({
            'error': 'Cours complet',
            'message': f'Ce cours affiche complet ({course.max_participants} places)'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérifier que le cours n'est pas passé
    if course.is_past:
        return Response({
            'error': 'Cours passé',
            'message': 'Impossible de réserver un cours déjà terminé'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérifier que le cours n'est pas annulé
    if course.status == 'CANCELLED':
        return Response({
            'error': 'Cours annulé',
            'message': 'Ce cours a été annulé'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérifier pas de réservation existante
    existing_booking = Booking.objects.filter(
        course=course,
        member=member,
        status__in=['CONFIRMED', 'PENDING']
    ).first()
    
    if existing_booking:
        return Response({
            'error': 'Déjà réservé',
            'message': 'Vous avez déjà réservé ce cours'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 2️⃣ CRÉER LA RÉSERVATION
    booking = Booking.objects.create(
        course=course,
        member=member,
        status='CONFIRMED',
        tenant_id=request.tenant_id
    )
    
    return Response({
        'message': 'Réservation confirmée',
        'booking': BookingDetailSerializer(booking).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """
    ❌ Annuler une réservation
    Règle: Annulation possible jusqu'à 2h avant le cours
    """
    user = request.user
    member = user.member_profile
    
    try:
        booking = Booking.objects.select_related('course').get(
            id=booking_id,
            member=member
        )
    except Booking.DoesNotExist:
        return Response({
            'error': 'Réservation introuvable'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Vérifier que la réservation n'est pas déjà annulée
    if booking.status == 'CANCELLED':
        return Response({
            'error': 'Déjà annulée',
            'message': 'Cette réservation est déjà annulée'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérifier délai d'annulation (2h avant)
    now = timezone.now()
    course_datetime = timezone.make_aware(
        timezone.datetime.combine(booking.course.date, booking.course.start_time)
    )
    
    time_until_course = course_datetime - now
    
    if time_until_course < timedelta(hours=2):
        return Response({
            'error': 'Délai dépassé',
            'message': 'Annulation impossible moins de 2h avant le cours'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Annuler
    booking.cancel()
    
    return Response({
        'message': 'Réservation annulée avec succès'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bookings(request):
    """
    📋 Historique complet des réservations du membre
    """
    user = request.user
    member = user.member_profile
    
    # Filtres
    status_filter = request.GET.get('status')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    bookings = Booking.objects.filter(
        member=member
    ).select_related('course__course_type', 'course__coach', 'course__room')
    
    if status_filter:
        bookings = bookings.filter(status=status_filter)
    if date_from:
        bookings = bookings.filter(course__date__gte=date_from)
    if date_to:
        bookings = bookings.filter(course__date__lte=date_to)
    
    bookings = bookings.order_by('-course__date', '-course__start_time')
    
    return Response(BookingDetailSerializer(bookings, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_programs(request):
    """
    🏋️ Mes programmes d'entraînement
    """
    user = request.user
    member = user.member_profile
    
    programs = TrainingProgram.objects.filter(
        member=member
    ).select_related('coach').prefetch_related('workout_sessions__exercises')
    
    return Response(TrainingProgramSerializer(programs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_progress(request):
    """
    📈 Mon suivi de progression
    """
    user = request.user
    member = user.member_profile
    
    measurements = MemberMeasurement.objects.filter(
        member=member
    ).order_by('-date')[:12]  # 12 dernières mesures
    
    # Calcul des changements
    if measurements.count() >= 2:
        latest = measurements.first()
        oldest = measurements.last()
        
        weight_change = float(latest.weight - oldest.weight) if latest.weight and oldest.weight else 0
        bf_change = float(latest.body_fat_percentage - oldest.body_fat_percentage) if latest.body_fat_percentage and oldest.body_fat_percentage else 0
    else:
        weight_change = 0
        bf_change = 0
    
    return Response({
        'measurements': MemberMeasurementSerializer(measurements, many=True).data,
        'summary': {
            'weight_change': weight_change,
            'body_fat_change': bf_change,
            'total_measurements': measurements.count()
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_plans_list(request):
    """
    💳 Plans d'abonnement disponibles (pour renouvellement)
    """
    plans = SubscriptionPlan.objects.filter(
        tenant_id=request.tenant_id,
        is_active=True
    ).order_by('duration_days')
    
    return Response(SubscriptionPlanSerializer(plans, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_subscription_history(request):
    """
    📜 Historique de mes abonnements
    """
    user = request.user
    member = user.member_profile
    
    subscriptions = Subscription.objects.filter(
        member=member
    ).select_related('plan').order_by('-created_at')
    
    return Response(SubscriptionDetailSerializer(subscriptions, many=True).data)