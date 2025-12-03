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
from subscriptions.models import Subscription
from authentication.permissions import IsReceptionistOrAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def search_member_for_checkin(request):
    """🔍 Recherche de membre avec leurs réservations du jour"""
    query = request.GET.get('q', '')
    
    if len(query) < 2:
        return Response({'results': []})
    
    tenant_id = getattr(request, 'tenant_id', None)
    today = timezone.now().date()
    
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
        today_bookings = Booking.objects.filter(
            member=member,
            course__date=today,
            tenant_id=tenant_id
        ).select_related('course__course_type', 'course__coach', 'course__room')
        
        has_active_sub = member.has_active_subscription
        is_checked_in = Booking.objects.filter(
            member=member,
            course__date=today,
            checked_in=True
        ).exists()
        
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
            'subscription_expires_soon': False,
            'is_checked_in': is_checked_in,
            'today_bookings': bookings_data
        })
    
    return Response({'results': results})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def quick_checkin(request):
    """✅ Check-in rapide pour un cours spécifique"""
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
        
        if not member.has_active_subscription:
            return Response(
                {'error': 'Membre sans abonnement actif'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking = Booking.objects.filter(
            member=member,
            course=course
        ).first()
        
        if not booking:
            return Response(
                {'error': 'Aucune réservation trouvée pour ce cours'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.checked_in:
            return Response(
                {
                    'error': 'Check-in déjà effectué',
                    'check_in_time': booking.check_in_time.strftime('%H:%M')
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
    """📝 Check-in manuel (sans réservation préalable)"""
    member_id = request.data.get('member_id')
    course_id = request.data.get('course_id')
    
    if not member_id:
        return Response(
            {'error': 'member_id est requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    tenant_id = getattr(request, 'tenant_id', None)
    
    try:
        member = Member.objects.get(member_id=member_id, tenant_id=tenant_id)
        
        if not member.has_active_subscription:
            return Response(
                {'error': 'Membre sans abonnement actif'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if course_id:
            course = Course.objects.get(id=course_id, tenant_id=tenant_id)
            
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
    """📊 Statistiques de check-in en temps réel"""
    tenant_id = getattr(request, 'tenant_id', None)
    today = timezone.now().date()
    now = timezone.now()
    
    today_checkins = Booking.objects.filter(
        tenant_id=tenant_id,
        course__date=today,
        checked_in=True
    ).count()
    
    three_hours_ago = now - timedelta(hours=3)
    currently_present = Booking.objects.filter(
        tenant_id=tenant_id,
        checked_in=True,
        check_in_time__gte=three_hours_ago,
        course__date=today
    ).count()
    
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


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsReceptionistOrAdmin])
def create_booking(request):
    """📝 Créer une réservation (réceptionniste)"""
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
        
        # Vérifier abonnement
        if not member.has_active_subscription:
            return Response(
                {'error': 'Le membre doit avoir un abonnement actif'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si déjà réservé
        if Booking.objects.filter(member=member, course=course).exists():
            return Response(
                {'error': 'Ce membre a déjà réservé ce cours'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier disponibilité
        if course.is_full:
            return Response(
                {'error': 'Le cours est complet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la réservation
        booking = Booking.objects.create(
            member=member,
            course=course,
            status='CONFIRMED',
            tenant_id=tenant_id
        )
        
        return Response({
            'success': True,
            'message': f'Réservation créée pour {member.full_name}',
            'booking': {
                'id': booking.id,
                'member_name': member.full_name,
                'course_title': course.title,
                'date': course.date,
                'start_time': course.start_time
            }
        }, status=status.HTTP_201_CREATED)
        
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
def get_receptionist_bookings(request):
    """📋 Liste des réservations (vue réceptionniste)"""
    tenant_id = getattr(request, 'tenant_id', None)
    
    # Filtres
    status_filter = request.GET.get('status')
    date_filter = request.GET.get('date')
    
    bookings = Booking.objects.filter(
        tenant_id=tenant_id
    ).select_related('member', 'course__course_type', 'course__coach', 'course__room')
    
    if status_filter:
        bookings = bookings.filter(status=status_filter)
    
    if date_filter:
        bookings = bookings.filter(course__date=date_filter)
    else:
        # Par défaut : réservations d'aujourd'hui et futures
        today = timezone.now().date()
        bookings = bookings.filter(course__date__gte=today)
    
    bookings = bookings.order_by('-course__date', '-course__start_time')
    
    results = []
    for booking in bookings:
        results.append({
            'id': booking.id,
            'member_id': booking.member.member_id,
            'member_name': booking.member.full_name,
            'member_photo': booking.member.photo.url if booking.member.photo else None,
            'course_id': booking.course.id,
            'course_title': booking.course.title,
            'course_date': booking.course.date,
            'course_start_time': booking.course.start_time,
            'course_end_time': booking.course.end_time,
            'status': booking.status,
            'checked_in': booking.checked_in,
            'check_in_time': booking.check_in_time,
            'booking_date': booking.booking_date
        })
    
    return Response({'results': results})