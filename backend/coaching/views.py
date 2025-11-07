from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
from members.models import Member
from django.utils import timezone
from collections import defaultdict
import io
from .models import (
    ExerciseCategory, Exercise, TrainingProgram,
    WorkoutSession, WorkoutExercise, ProgressTracking,
    WorkoutLog
)
from .serializers import (
    ExerciseCategorySerializer, ExerciseSerializer,
    TrainingProgramSerializer, TrainingProgramCreateSerializer,
    WorkoutSessionSerializer, WorkoutSessionCreateSerializer,
    ProgressTrackingSerializer, WorkoutLogSerializer, WorkoutLogCreateSerializer
)


class ExerciseCategoryViewSet(viewsets.ModelViewSet):
    """CRUD pour les catégories d'exercices"""
    queryset = ExerciseCategory.objects.all()
    serializer_class = ExerciseCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class ExerciseViewSet(viewsets.ModelViewSet):
    """CRUD pour les exercices"""
    queryset = Exercise.objects.select_related('category', 'created_by')
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty']
    search_fields = ['name', 'description', 'equipment_needed']
    ordering_fields = ['name', 'created_at', 'difficulty']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TrainingProgramViewSet(viewsets.ModelViewSet):
    """CRUD pour les programmes d'entraînement"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['member', 'coach', 'status']
    search_fields = ['title', 'description', 'goal']
    ordering_fields = ['start_date', 'created_at', 'title']
    
    def get_queryset(self):
        queryset = TrainingProgram.objects.select_related(
            'member',
            'coach'
        ).prefetch_related('workout_sessions__exercises__exercise')
        
        # Filtrer selon le rôle
        user = self.request.user
        if user.role == 'member':
            # Filtrer par email du membre
            queryset = queryset.filter(member__email=user.email)
        elif user.role == 'coach':
            # Les coachs voient les programmes qu'ils ont créés
            queryset = queryset.filter(coach=user)
        # Les admins et réceptionnistes voient tout
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            # Utiliser le nouveau serializer pour la création complète
            return TrainingProgramFullCreateSerializer  # ← Changez ici
        return TrainingProgramSerializer
    
    def perform_create(self, serializer):
        # Ajouter le coach automatiquement si pas fourni
        if 'coach' not in serializer.validated_data:
            serializer.save(coach=self.request.user)
        else:
            serializer.save()
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Dupliquer un programme existant"""
        original_program = self.get_object()
        
        # Créer une copie du programme
        new_program = TrainingProgram.objects.create(
            title=f"{original_program.title} (Copie)",
            description=original_program.description,
            member=original_program.member,
            coach=request.user,
            status='draft',
            start_date=original_program.start_date,
            end_date=original_program.end_date,
            duration_weeks=original_program.duration_weeks,
            goal=original_program.goal,
            target_weight=original_program.target_weight,
            target_body_fat=original_program.target_body_fat,
            notes=original_program.notes
        )
        
        # Copier les sessions d'entraînement
        for session in original_program.workout_sessions.all():
            new_session = WorkoutSession.objects.create(
                program=new_program,
                title=session.title,
                day_of_week=session.day_of_week,
                week_number=session.week_number,
                duration_minutes=session.duration_minutes,
                notes=session.notes,
                order=session.order
            )
            
            # Copier les exercices de la session
            for exercise in session.exercises.all():
                WorkoutExercise.objects.create(
                    workout_session=new_session,
                    exercise=exercise.exercise,
                    sets=exercise.sets,
                    reps=exercise.reps,
                    rest_seconds=exercise.rest_seconds,
                    weight=exercise.weight,
                    notes=exercise.notes,
                    order=exercise.order
                )
        
        serializer = self.get_serializer(new_program)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """Exporter un programme en PDF"""
        program = self.get_object()
    
        # Récupérer toutes les sessions avec leurs exercices
        # CORRECTION : utiliser 'workout_sessions' au lieu de 'sessions'
        sessions = program.workout_sessions.prefetch_related(
            'exercises__exercise__category'
        ).order_by('week_number', 'day_of_week', 'order')
    
        # Organiser les sessions par semaine
        sessions_by_week = defaultdict(list)
        for session in sessions:
            sessions_by_week[session.week_number].append(session)
    
        # Calculer les statistiques
        total_sessions = sessions.count()
        total_exercises = sum(session.exercises.count() for session in sessions)
    
        context = {
            'program': program,
            'sessions_by_week': dict(sessions_by_week),
            'stats': {
                'total_sessions': total_sessions,
                'total_exercises': total_exercises,
            },
            'current_date': timezone.now(),
        }
    
        # Générer le HTML
        html_string = render_to_string('coaching/program_pdf.html', context)
    
        # Convertir en PDF avec WeasyPrint
        html = HTML(string=html_string)
        pdf = html.write_pdf()
    
        # Retourner la réponse PDF
        response = HttpResponse(pdf, content_type='application/pdf')
        filename = f'programme_{program.id}_{program.title.replace(" ", "_")}.pdf'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
        return response


class WorkoutSessionViewSet(viewsets.ModelViewSet):
    """CRUD pour les sessions d'entraînement"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program', 'day_of_week', 'week_number']
    ordering_fields = ['week_number', 'day_of_week', 'order']
    
    def get_queryset(self):
        queryset = WorkoutSession.objects.select_related(
            'program__member',
            'program__coach'
        ).prefetch_related('exercises__exercise')
        
        # Filtrer selon le rôle
        user = self.request.user
        if user.role == 'member':
            queryset = queryset.filter(program__member__email=user.email)
        elif user.role == 'coach':
            queryset = queryset.filter(program__coach=user)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WorkoutSessionCreateSerializer
        return WorkoutSessionSerializer


class ProgressTrackingViewSet(viewsets.ModelViewSet):
    """CRUD pour le suivi de progression"""
    permission_classes = [IsAuthenticated]
    serializer_class = ProgressTrackingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['member', 'program']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        queryset = ProgressTracking.objects.select_related(
            'member',
            'program'
        )
        
        # Filtrer selon le rôle
        user = self.request.user
        if user.role == 'member':
            queryset = queryset.filter(member__email=user.email)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques de progression pour un membre"""
        member_id = request.query_params.get('member')
        
        if not member_id:
            return Response(
                {'error': 'member parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trackings = self.get_queryset().filter(member_id=member_id).order_by('date')
        
        if not trackings.exists():
            return Response({'message': 'No tracking data found'})
        
        # Calculer les statistiques
        first_tracking = trackings.first()
        last_tracking = trackings.last()
        
        stats = {
            'total_entries': trackings.count(),
            'first_date': first_tracking.date,
            'last_date': last_tracking.date,
            'weight': {
                'initial': first_tracking.weight,
                'current': last_tracking.weight,
                'change': float(last_tracking.weight - first_tracking.weight) if first_tracking.weight and last_tracking.weight else None
            },
            'body_fat': {
                'initial': first_tracking.body_fat_percentage,
                'current': last_tracking.body_fat_percentage,
                'change': float(last_tracking.body_fat_percentage - first_tracking.body_fat_percentage) if first_tracking.body_fat_percentage and last_tracking.body_fat_percentage else None
            },
            'history': ProgressTrackingSerializer(trackings, many=True).data
        }
        
        return Response(stats)


class WorkoutLogViewSet(viewsets.ModelViewSet):
    """CRUD pour les journaux d'entraînement"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['member', 'workout_session', 'feeling']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        queryset = WorkoutLog.objects.select_related(
            'member',
            'workout_session__program'
        ).prefetch_related('exercises__exercise')
        
        # Filtrer selon le rôle
        user = self.request.user
        if user.role == 'member':
            queryset = queryset.filter(member__email=user.email)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WorkoutLogCreateSerializer
        return WorkoutLogSerializer
    
class MemberSelectionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour sélectionner un membre dans un formulaire"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone']  # ← CORRECTION: 'phone' au lieu de 'phone_number'
    
    def get_queryset(self):
        # Retourner uniquement les membres actifs
        return Member.objects.filter(status='ACTIVE').order_by('first_name', 'last_name') 
    def get_serializer_class(self):
        from rest_framework import serializers
        
        class MemberSimpleSerializer(serializers.ModelSerializer):
            full_name = serializers.CharField(read_only=True)
            
            class Meta:
                model = Member
                fields = ['id', 'member_id', 'full_name', 'email', 'phone']  
        
        return MemberSimpleSerializer