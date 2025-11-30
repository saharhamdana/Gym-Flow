# backend/bookings/receptionist_bookings_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from .models import Booking, Course
from .serializers import BookingListSerializer, CourseListSerializer
from authentication.permissions import IsReceptionistOrAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def receptionist_bookings_list(request):
    """
    📋 Liste des réservations pour le réceptionniste
    """
    tenant_id = getattr(request, 'tenant_id', None)
    
    # Filtres
    status_filter = request.GET.get('status')
    date_filter = request.GET.get('date')
    member_filter = request.GET.get('member')
    
    # Récupérer toutes les réservations du centre
    bookings = Booking.objects.filter(
        tenant_id=tenant_id
    ).select_related(
        'member', 
        'course__course_type', 
        'course__coach', 
        'course__room'
    ).order_by('-course__date', '-course__start_time')
    
    # Appliquer les filtres
    if status_filter:
        bookings = bookings.filter(status=status_filter)
    if date_filter:
        bookings = bookings.filter(course__date=date_filter)
    if member_filter:
        bookings = bookings.filter(member_id=member_filter)
    
    serializer = BookingListSerializer(bookings, many=True)
    
    return Response({
        'results': serializer.data,
        'count': bookings.count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def receptionist_courses_list(request):
    """
    📅 Liste des cours disponibles pour réservation
    ✅ CORRECTION: Ajouter cette vue pour afficher les cours
    """
    tenant_id = getattr(request, 'tenant_id', None)
    
    # Filtres
    date_from = request.GET.get('date_from', timezone.now().date())
    days_ahead = int(request.GET.get('days_ahead', 14))  # 14 jours par défaut
    
    date_to = timezone.now().date() + timedelta(days=days_ahead)
    
    # Récupérer les cours à venir
    courses = Course.objects.filter(
        tenant_id=tenant_id,
        date__gte=date_from,
        date__lte=date_to,
        status='SCHEDULED'
    ).select_related(
        'course_type', 
        'coach', 
        'room'
    ).order_by('date', 'start_time')
    
    # Sérialiser avec infos de disponibilité
    serializer = CourseListSerializer(courses, many=True)
    
    return Response({
        'results': serializer.data,
        'count': courses.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def create_booking(request):
    """
    ✅ Créer une réservation (réceptionniste)
    """
    from members.models import Member
    import logging
    
    logger = logging.getLogger('bookings.receptionist')
    
    member_id = request.data.get('member_id')  # ID membre (MEM20250001)
    course_id = request.data.get('course_id')
    tenant_id = getattr(request, 'tenant_id', None)
    
    logger.info(f"🔍 Création réservation: member_id={member_id}, course_id={course_id}, tenant_id={tenant_id}")
    
    if not member_id or not course_id:
        return Response({
            'error': 'member_id et course_id sont requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Récupérer le membre par member_id (pas ID)
        member = Member.objects.get(member_id=member_id, tenant_id=tenant_id)
        logger.info(f"✅ Membre trouvé: {member.full_name}")
        
        course = Course.objects.get(id=course_id, tenant_id=tenant_id)
        logger.info(f"✅ Cours trouvé: {course.title}")
        
        # Vérifier que le membre a un abonnement actif
        if not member.has_active_subscription:
            logger.warning(f"❌ Membre {member_id} sans abonnement actif")
            return Response({
                'error': 'Le membre n\'a pas d\'abonnement actif'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que le cours n'est pas complet
        if course.is_full:
            logger.warning(f"❌ Cours {course_id} complet")
            return Response({
                'error': 'Le cours est complet'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier pas de réservation existante
        existing = Booking.objects.filter(
            member=member,
            course=course
        ).exclude(status='CANCELLED').first()
        
        if existing:
            logger.warning(f"❌ Réservation existante: {existing.id}")
            return Response({
                'error': 'Le membre a déjà réservé ce cours'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer la réservation
        booking = Booking.objects.create(
            member=member,
            course=course,
            status='CONFIRMED',
            tenant_id=tenant_id
        )
        
        logger.info(f"✅ Réservation créée: {booking.id}")
        
        return Response({
            'success': True,
            'message': 'Réservation créée avec succès',
            'booking': BookingListSerializer(booking).data
        }, status=status.HTTP_201_CREATED)
        
    except Member.DoesNotExist:
        logger.error(f"❌ Membre {member_id} non trouvé")
        return Response({
            'error': f'Membre {member_id} non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    except Course.DoesNotExist:
        logger.error(f"❌ Cours {course_id} non trouvé")
        return Response({
            'error': 'Cours non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"❌ Erreur inattendue: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)