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
def member_dashboard(request):
    """
    📊 Dashboard complet du membre
    Retourne toutes les infos essentielles en une seule requête
    """
    user = request.user
    
    # Vérifier que l'utilisateur est bien un membre
    if user.role != 'MEMBER':
        return Response(
            {'error': 'Accès réservé aux membres'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        member = user.member_profile
    except Member.DoesNotExist:
        return Response(
            {'error': 'Profil membre non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    today = timezone.now().date()
    
    # 1️⃣ ABONNEMENT ACTUEL
    active_subscription = Subscription.objects.filter(
        member=member,
        status='ACTIVE',
        end_date__gte=today
    ).select_related('plan').first()
    
    # 2️⃣ PROCHAINS COURS RÉSERVÉS (5 prochains)
    upcoming_bookings = Booking.objects.filter(
        member=member,
        course__date__gte=today,
        status='CONFIRMED'
    ).select_related('course__course_type', 'course__coach', 'course__room').order_by('course__date', 'course__start_time')[:5]
    
    # 3️⃣ HISTORIQUE RÉCENT (10 derniers cours)
    past_bookings = Booking.objects.filter(
        member=member,
        course__date__lt=today
    ).select_related('course').order_by('-course__date')[:10]
    
    # 4️⃣ PROGRAMME D'ENTRAÎNEMENT ACTUEL
    current_program = TrainingProgram.objects.filter(
        member=member,
        status='active'
    ).select_related('coach').prefetch_related('workout_sessions').first()
    
    # 5️⃣ DERNIÈRES MESURES PHYSIQUES
    latest_measurement = MemberMeasurement.objects.filter(
        member=member
    ).order_by('-date').first()
    
    # 6️⃣ STATISTIQUES PERSONNELLES
    total_bookings = Booking.objects.filter(member=member).count()
    attended_bookings = Booking.objects.filter(member=member, checked_in=True).count()
    attendance_rate = (attended_bookings / total_bookings * 100) if total_bookings > 0 else 0
    
    # 7️⃣ PROCHAINE EXPIRATION ABONNEMENT
    expiring_soon = None
    if active_subscription:
        days_remaining = (active_subscription.end_date - today).days
        if days_remaining <= 7:
            expiring_soon = {
                'days_remaining': days_remaining,
                'end_date': active_subscription.end_date,
                'plan_name': active_subscription.plan.name
            }
    
    return Response({
        'member': MemberDetailSerializer(member, context={'request': request}).data,
        'subscription': {
            'active': active_subscription is not None,
            'plan': active_subscription.plan.name if active_subscription else None,
            'end_date': active_subscription.end_date if active_subscription else None,
            'days_remaining': active_subscription.days_remaining if active_subscription else 0,
            'status': active_subscription.status if active_subscription else None,
        } if active_subscription else None,
        'upcoming_bookings': BookingDetailSerializer(upcoming_bookings, many=True).data,
        'past_bookings': BookingDetailSerializer(past_bookings, many=True).data,
        'current_program': TrainingProgramSerializer(current_program).data if current_program else None,
        'latest_measurement': MemberMeasurementSerializer(latest_measurement).data if latest_measurement else None,
        'statistics': {
            'total_bookings': total_bookings,
            'attended_bookings': attended_bookings,
            'attendance_rate': round(attendance_rate, 1),
        },
        'alerts': {
            'expiring_soon': expiring_soon
        }
    })


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