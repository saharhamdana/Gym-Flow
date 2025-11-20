# bookings/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Room, CourseType, Course, Booking
from .serializers import (
    RoomSerializer, CourseTypeSerializer,
    CourseListSerializer, CourseDetailSerializer, CourseCreateUpdateSerializer,
    BookingListSerializer, BookingDetailSerializer, BookingCreateSerializer
)
from authentication.mixins import CompleteTenantMixin


class RoomViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['is_active']
    tenant_field = 'tenant_id'


class CourseTypeViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    queryset = CourseType.objects.all()
    serializer_class = CourseTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    filterset_fields = ['is_active']
    tenant_field = 'tenant_id'


class CourseViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'course_type', 'coach', 'room', 'date']
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'start_time']
    tenant_field = 'tenant_id'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Cours à venir (7 prochains jours) du centre"""
        today = timezone.now().date()
        next_week = today + timedelta(days=7)
        
        courses = self.get_queryset().filter(
            date__gte=today,
            date__lte=next_week,
            status='SCHEDULED'
        ).order_by('date', 'start_time')
        
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Cours d'aujourd'hui du centre"""
        today = timezone.now().date()
        courses = self.get_queryset().filter(date=today).order_by('start_time')
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def bookings(self, request, pk=None):
        """Liste des réservations pour ce cours"""
        course = self.get_object()
        bookings = course.bookings.all()
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler un cours"""
        course = self.get_object()
        course.status = 'CANCELLED'
        course.save()
        
        # Annuler toutes les réservations
        course.bookings.filter(status='CONFIRMED').update(status='CANCELLED')
        
        return Response({'message': 'Cours annulé avec succès'})
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques des cours du centre"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        scheduled = queryset.filter(status='SCHEDULED').count()
        completed = queryset.filter(status='COMPLETED').count()
        cancelled = queryset.filter(status='CANCELLED').count()
        
        return Response({
            'total': total,
            'scheduled': scheduled,
            'completed': completed,
            'cancelled': cancelled,
        })


class BookingViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'member', 'course', 'checked_in']
    search_fields = ['member__first_name', 'member__last_name', 'course__title']
    ordering_fields = ['booking_date']
    tenant_field = 'tenant_id'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        return BookingDetailSerializer
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler une réservation"""
        booking = self.get_object()
        
        if booking.status == 'CANCELLED':
            return Response(
                {'error': 'Cette réservation est déjà annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.cancel()
        return Response({'message': 'Réservation annulée avec succès'})
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Marquer comme présent"""
        booking = self.get_object()
        
        if booking.checked_in:
            return Response(
                {'error': 'Déjà enregistré comme présent'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.check_in()
        return Response({'message': 'Check-in effectué avec succès'})
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Réservations de l'utilisateur connecté"""
        try:
            member = request.user.member_profile
            bookings = self.get_queryset().filter(member=member)
            serializer = BookingListSerializer(bookings, many=True)
            return Response(serializer.data)
        except:
            return Response([], status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques des réservations du centre"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        confirmed = queryset.filter(status='CONFIRMED').count()
        cancelled = queryset.filter(status='CANCELLED').count()
        completed = queryset.filter(status='COMPLETED').count()
        no_show = queryset.filter(status='NO_SHOW').count()
        
        return Response({
            'total': total,
            'confirmed': confirmed,
            'cancelled': cancelled,
            'completed': completed,
            'no_show': no_show,
            'attendance_rate': (completed / total * 100) if total > 0 else 0
        })