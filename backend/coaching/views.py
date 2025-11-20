from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.template.loader import render_to_string
try:
    from weasyprint import HTML
except Exception:
    HTML = None

from members.models import Member
from django.utils import timezone
from collections import defaultdict
from rest_framework.decorators import api_view, permission_classes
from datetime import date, timedelta
from django.db.models import Count, Avg
from bookings.models import Course  
import io
from .models import (
    ExerciseCategory, Exercise, TrainingProgram,
    WorkoutSession, WorkoutExercise, ProgressTracking,
    WorkoutLog
)
from .serializers import (
    ExerciseCategorySerializer, ExerciseSerializer,
    TrainingProgramSerializer, TrainingProgramCreateSerializer,
    TrainingProgramFullCreateSerializer,
    WorkoutSessionSerializer, WorkoutSessionCreateSerializer,
    ProgressTrackingSerializer, WorkoutLogSerializer, WorkoutLogCreateSerializer, WorkoutExerciseSerializer
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
        elif user.role == 'COACH':
            # Les coachs voient les programmes qu'ils ont créés
            queryset = queryset.filter(coach=user)
        # Les admins et réceptionnistes voient tout
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TrainingProgramFullCreateSerializer
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
    
        sessions = program.workout_sessions.prefetch_related(
            'exercises__exercise__category'
        ).order_by('week_number', 'day_of_week', 'order')
    
        sessions_by_week = defaultdict(list)
        for session in sessions:
            sessions_by_week[session.week_number].append(session)
    
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
    
        html_string = render_to_string('coaching/program_pdf.html', context)
        html = HTML(string=html_string)
        pdf = html.write_pdf()
    
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
        
        user = self.request.user
        if user.role == 'member':
            queryset = queryset.filter(program__member__email=user.email)
        elif user.role == 'COACH':
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
    search_fields = ['first_name', 'last_name', 'email', 'phone']

    def get_queryset(self):
        try:
            user = self.request.user
            
            # 1️⃣ Récupérer le tenant_id depuis différentes sources
            tenant_id = None
            
            # Essayer depuis les headers
            tenant_id = self.request.headers.get("Tenant-ID") or self.request.headers.get("X-Tenant-Subdomain")
            
            # Essayer depuis l'utilisateur
            if not tenant_id:
                tenant_id = getattr(user, 'tenant_field', None) or getattr(user, 'tenant_id', None)
            
            # Essayer depuis le middleware
            if not tenant_id:
                tenant_id = getattr(self.request, 'tenant_id', None)

            print(f"[DEBUG] 🏢 Tenant ID reçu: {tenant_id}")
            print(f"[DEBUG] 👤 User: {user.email}, Role: {user.role}")
            print(f"[DEBUG] 📋 Headers: Tenant-ID={self.request.headers.get('Tenant-ID')}, X-Tenant-Subdomain={self.request.headers.get('X-Tenant-Subdomain')}")

            # 2️⃣ Si pas de tenant_id, retourner tous les membres actifs (fallback)
            if not tenant_id:
                print("[WARNING] ⚠️ Aucun Tenant fourni — retour de TOUS les membres actifs")
                queryset = Member.objects.filter(status="ACTIVE").order_by("first_name", "last_name")
            else:
                # 3️⃣ Filtrer les membres du tenant
                queryset = Member.objects.filter(
                    status="ACTIVE",
                    tenant_id=tenant_id,
                ).order_by("first_name", "last_name")

            print(f"[DEBUG] ✅ Membres actifs trouvés: {queryset.count()}")
            
            # 4️⃣ Debug: afficher les 3 premiers membres
            for member in queryset[:3]:
                print(f"   - {member.full_name} (ID: {member.id}, Email: {member.email})")

            return queryset
            
        except Exception as e:
            print(f"[ERROR] ❌ Erreur dans get_queryset: {e}")
            import traceback
            traceback.print_exc()
            return Member.objects.none()

    def get_serializer_class(self):
        from rest_framework import serializers

        class MemberSimpleSerializer(serializers.ModelSerializer):
            full_name = serializers.CharField(read_only=True)
            phone_number = serializers.CharField(source="phone", read_only=True)

            class Meta:
                model = Member
                fields = ["id", "member_id", "full_name", "email", "phone_number"]

        return MemberSimpleSerializer
    
    def list(self, request, *args, **kwargs):
        """Override list pour ajouter des logs détaillés"""
        try:
            print(f"[DEBUG] 🚀 MemberSelectionViewSet.list() called")
            return super().list(request, *args, **kwargs)
        except Exception as e:
            print(f"[ERROR] ❌ Erreur dans list(): {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WorkoutExerciseViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les exercices liés aux sessions d'entraînement
    """
    queryset = WorkoutExercise.objects.all()
    serializer_class = WorkoutExerciseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = WorkoutExercise.objects.select_related(
            'workout_session',
            'exercise'
        ).all()
        
        # Filtrer par session si spécifié
        workout_session_id = self.request.query_params.get('workout_session', None)
        if workout_session_id:
            queryset = queryset.filter(workout_session_id=workout_session_id)
        
        return queryset
    
# ============================================================
# VUES POUR LE COACH DASHBOARD
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coach_dashboard_stats(request):
    """
    Statistiques pour le dashboard du coach
    """
    user = request.user
    
    if user.role != 'COACH':
        return Response({'error': 'Access denied. Coach role required.'}, status=403)
    
    today = date.today()
    
    # 1. Compter les cours aujourd'hui
    courses_today = Course.objects.filter(
        coach=user,
        date=today
    ).count()
    
    # 2. Compter les membres uniques assignés au coach via les programmes
    total_members = TrainingProgram.objects.filter(
        coach=user,
        status='active'
    ).values('member').distinct().count()
    
    # 3. Compter les cours complétés (passés)
    completed_courses = Course.objects.filter(
        coach=user,
        date__lt=today
    ).count()
    
    # 4. Note de satisfaction
    satisfaction = 4.8
    
    return Response({
        'sessions_today': courses_today,
        'total_members': total_members,
        'completed_sessions': completed_courses,
        'satisfaction': satisfaction
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coach_upcoming_sessions(request):
    """
    Liste des cours à venir pour le coach
    """
    user = request.user
    
    # Debug: afficher le rôle de l'utilisateur
    print(f"User: {user.email}, Role: {user.role}")
    
    if user.role != 'COACH':
        return Response({'error': 'Access denied. Coach role required.'}, status=403)
    
    try:
        today = date.today()
        
        upcoming_courses = Course.objects.filter(
            coach=user,
            date__gte=today
        ).select_related('course_type', 'room').order_by('date', 'start_time')[:10]
        
        print(f"Found {upcoming_courses.count()} courses")  # Debug
        
        sessions_data = []
        for course in upcoming_courses:
            try:
                # Compter les réservations confirmées
                participants_count = course.bookings.filter(status='CONFIRMED').count()
                
                session_dict = {
                    'id': course.id,
                    'title': course.course_type.name if course.course_type else 'Cours',
                    'date': course.date.isoformat(),  # Format ISO pour JSON
                    'start_time': course.start_time.strftime('%H:%M'),
                    'end_time': course.end_time.strftime('%H:%M') if course.end_time else 'N/A',
                    'room': course.room.name if course.room else 'Non assignée',
                    'participants_count': participants_count,
                    'max_capacity': course.max_participants or 0
                }
                
                sessions_data.append(session_dict)
                
            except Exception as e:
                print(f"Error processing course {course.id}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue
        
        return Response(sessions_data)
        
    except Exception as e:
        print(f"Error in coach_upcoming_sessions: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Retourner une liste vide au lieu d'une erreur 500
        return Response([])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coach_my_members(request):
    """
    Liste des membres du coach avec leur progression
    """
    user = request.user
    
    # Debug: afficher les informations utilisateur
    print(f"[DEBUG] User: {user.email}, Role: {user.role}")
    
    if user.role != 'COACH':
        return Response({'error': 'Access denied. Coach role required.'}, status=403)
    
    try:
        # Récupérer les programmes actifs du coach avec optimisation des requêtes
        programs = TrainingProgram.objects.filter(
            coach=user,
            status='active'
        ).select_related('member').order_by('-created_at')
        
        print(f"[DEBUG] Found {programs.count()} active programs for coach {user.email}")
        
        members_data = []
        seen_members = set()  # Pour éviter les doublons si un membre a plusieurs programmes
        
        for program in programs:
            try:
                member = program.member
                
                # Vérifier que le membre existe
                if not member:
                    print(f"[WARNING] Program {program.id} has no member")
                    continue
                
                # Éviter les doublons (un membre peut avoir plusieurs programmes actifs)
                if member.id in seen_members:
                    continue
                seen_members.add(member.id)
                
                # Calculer la progression basée sur les dates
                total_days = (program.end_date - program.start_date).days
                elapsed_days = (date.today() - program.start_date).days
                
                if total_days > 0:
                    progress = min(100, max(0, int((elapsed_days / total_days) * 100)))
                else:
                    progress = 0
                
                # Utiliser la propriété full_name du modèle Member
                member_dict = {
                    'id': program.id,
                    'member_id': member.id,
                    'member_name': member.full_name,  # Propriété définie dans le modèle
                    'member_email': member.email,
                    'member_phone': member.phone,
                    'title': program.title,
                    'progress': progress,
                    'start_date': program.start_date.isoformat(),
                    'end_date': program.end_date.isoformat(),
                    'goal': program.goal[:100] if program.goal else '',  # Limiter la longueur
                    'status': program.status,
                    'duration_weeks': program.duration_weeks
                }
                
                members_data.append(member_dict)
                print(f"[DEBUG] Added member: {member.full_name} (ID: {member.id})")
                
            except Exception as prog_error:
                print(f"[ERROR] Error processing program {program.id}: {str(prog_error)}")
                import traceback
                traceback.print_exc()
                continue
        
        print(f"[DEBUG] Returning {len(members_data)} members")
        return Response(members_data)
    
    except Exception as e:
        import traceback
        print(f"[ERROR] Error in coach_my_members: {str(e)}")
        print(traceback.format_exc())
        
        # Retourner une liste vide au lieu d'une erreur 500 pour éviter de casser le frontend
        return Response([])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_programs(request):
    """
    Liste des programmes assignés au membre connecté
    """
    user = request.user
    
    # Vérifier que l'utilisateur est un membre
    if user.role != 'MEMBER':
        return Response(
            {'error': 'Accès réservé aux membres'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Récupérer le profil membre
        member = user.member_profile
        
        # Récupérer tous les programmes du membre
        programs = TrainingProgram.objects.filter(
            member=member
        ).select_related(
            'coach'
        ).prefetch_related(
            'workout_sessions__exercises__exercise'
        ).order_by('-created_at')
        
        # Sérialiser les données
        serializer = TrainingProgramSerializer(programs, many=True)
        
        return Response(serializer.data)
        
    except Exception as e:
        print(f"[ERROR] Erreur member_programs: {e}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': 'Erreur lors de la récupération des programmes'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_program_detail(request, program_id):
    """
    Détails d'un programme spécifique pour le membre connecté
    """
    user = request.user
    
    if user.role != 'MEMBER':
        return Response(
            {'error': 'Accès réservé aux membres'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        member = user.member_profile
        
        # Récupérer le programme - s'assurer qu'il appartient bien au membre
        program = TrainingProgram.objects.select_related(
            'coach'
        ).prefetch_related(
            'workout_sessions__exercises__exercise__category'
        ).get(id=program_id, member=member)
        
        serializer = TrainingProgramSerializer(program)
        
        return Response(serializer.data)
        
    except TrainingProgram.DoesNotExist:
        return Response(
            {'error': 'Programme non trouvé ou accès non autorisé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"[ERROR] Erreur member_program_detail: {e}")
        return Response(
            {'error': 'Erreur lors de la récupération du programme'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )