# backend/bookings/receptionist_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta

from .models import Booking, Course
from members.models import Member
from authentication.permissions import IsReceptionistOrAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def search_member_for_checkin(request):
    """
    🔍 Recherche de membre avec leurs réservations du jour
    """
    query = request.GET.get('q', '')
    
    if len(query) < 2:
        return Response({'results': []})
    
    tenant_id = getattr(request, 'tenant_id', None)
    today = timezone.now().date()
    
    # Rechercher les membres
    members = Member.objects.filter(
        tenant_id=tenant_id
    ).filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(member_id__icontains=query) |
        Q(email__icontains=query) |
        Q(phone__icontains=query)
    )[:10]
    
    results = []
    for member in members:
        # Récupérer les réservations du jour
        today_bookings = Booking.objects.filter(
            member=member,
            course__date=today,
            tenant_id=tenant_id
        ).select_related('course__course_type', 'course__coach', 'course__room')
        
        # Vérifier l'abonnement
        has_active_sub = member.has_active_subscription
        
        # Vérifier si déjà check-in aujourd'hui
        is_checked_in = Booking.objects.filter(
            member=member,
            course__date=today,
            checked_in=True
        ).exists()
        
        # Formater les réservations
        bookings_data = []
        for booking in today_bookings:
            bookings_data.append({
                'id': booking.id,
                'course_id': booking.course.id,
                'course_title': booking.course.title,
                'course_type': booking.course.course_type.name,
                'start_time': booking.course.start_time.strftime('%H:%M'),
                'end_time': booking.course.end_time.strftime('%H:%M'),
                'instructor': booking.course.coach.get_full_name(),
                'room': booking.course.room.name,
                'checked_in': booking.checked_in,
                'check_in_time': booking.check_in_time.strftime('%H:%M') if booking.check_in_time else None,
                'status': booking.status
            })
        
        results.append({
            'id': member.id,
            'member_id': member.member_id,
            'full_name': member.full_name,
            'first_name': member.first_name,
            'last_name': member.last_name,
            'email': member.email,
            'phone': member.phone,
            'photo': member.photo.url if member.photo else None,
            'has_active_subscription': has_active_sub,
            'subscription_expires_soon': False,  # À implémenter selon votre logique
            'is_checked_in': is_checked_in,
            'today_bookings': bookings_data
        })
    
    return Response({'results': results})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def quick_checkin(request):
    """
    ✅ Check-in rapide pour un cours spécifique
    """
    member_id = request.data.get('member_id')
    course_id = request.data.get('course_id')
    
    if not member_id or not course_id:
        return Response(
            {'error': 'member_id et course_id sont requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    tenant_id = getattr(request, 'tenant_id', None)
    
    try:
        member = Member.objects.get(member_id=member_id, tenant_id=tenant_id)
        course = Course.objects.get(id=course_id, tenant_id=tenant_id)
        
        # Vérifier l'abonnement
        if not member.has_active_subscription:
            return Response(
                {'error': 'Membre sans abonnement actif'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer la réservation
        booking = Booking.objects.filter(
            member=member,
            course=course
        ).first()
        
        if not booking:
            return Response(
                {'error': 'Aucune réservation trouvée pour ce cours'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier si déjà check-in
        if booking.checked_in:
            return Response(
                {
                    'error': 'Check-in déjà effectué',
                    'check_in_time': booking.check_in_time.strftime('%H:%M')
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Effectuer le check-in
        booking.check_in()
        
        return Response({
            'success': True,
            'message': f'Check-in réussi pour {member.full_name}',
            'member': {
                'name': member.full_name,
                'member_id': member.member_id
            },
            'course': {
                'title': course.title,
                'start_time': course.start_time.strftime('%H:%M')
            },
            'check_in_time': booking.check_in_time.strftime('%H:%M')
        })
        
    except Member.DoesNotExist:
        return Response(
            {'error': 'Membre non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Course.DoesNotExist:
        return Response(
            {'error': 'Cours non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def manual_checkin(request):
    """
    📝 Check-in manuel (sans réservation préalable)
    Créer une réservation à la volée si nécessaire
    """
    member_id = request.data.get('member_id')
    course_id = request.data.get('course_id')  # Optionnel
    
    if not member_id:
        return Response(
            {'error': 'member_id est requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    tenant_id = getattr(request, 'tenant_id', None)
    
    try:
        member = Member.objects.get(member_id=member_id, tenant_id=tenant_id)
        
        # Vérifier l'abonnement
        if not member.has_active_subscription:
            return Response(
                {'error': 'Membre sans abonnement actif'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Si un cours est spécifié
        if course_id:
            course = Course.objects.get(id=course_id, tenant_id=tenant_id)
            
            # Vérifier ou créer la réservation
            booking, created = Booking.objects.get_or_create(
                member=member,
                course=course,
                defaults={
                    'status': 'CONFIRMED',
                    'tenant_id': tenant_id
                }
            )
            
            if not booking.checked_in:
                booking.check_in()
            
            message = f'Check-in {"créé et " if created else ""}effectué pour {member.full_name}'
        else:
            # Check-in libre (sans cours spécifique)
            message = f'Accès enregistré pour {member.full_name}'
        
        return Response({
            'success': True,
            'message': message,
            'member': {
                'name': member.full_name,
                'member_id': member.member_id
            }
        })
        
    except Member.DoesNotExist:
        return Response(
            {'error': 'Membre non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Course.DoesNotExist:
        return Response(
            {'error': 'Cours non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def checkin_stats(request):
    """
    📊 Statistiques de check-in en temps réel
    """
    tenant_id = getattr(request, 'tenant_id', None)
    today = timezone.now().date()
    now = timezone.now()
    
    # Check-ins d'aujourd'hui
    today_checkins = Booking.objects.filter(
        tenant_id=tenant_id,
        course__date=today,
        checked_in=True
    ).count()
    
    # Présents actuellement (check-in dans les 3 dernières heures)
    three_hours_ago = now - timedelta(hours=3)
    currently_present = Booking.objects.filter(
        tenant_id=tenant_id,
        checked_in=True,
        check_in_time__gte=three_hours_ago,
        course__date=today
    ).count()
    
    # Cours en cours (entre start_time et end_time)
    ongoing_courses = Course.objects.filter(
        tenant_id=tenant_id,
        date=today,
        start_time__lte=now.time(),
        end_time__gte=now.time(),
        status='SCHEDULED'
    ).count()
    
    return Response({
        'todayCheckins': today_checkins,
        'currentlyPresent': currently_present,
        'ongoingCourses': ongoing_courses
    })