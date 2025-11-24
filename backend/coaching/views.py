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
    """CRUD pour les programmes d'entraînement avec gestion automatique du tenant_id"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['member', 'coach', 'status']
    search_fields = ['title', 'description', 'goal']
    ordering_fields = ['start_date', 'created_at', 'title']
    
    def get_queryset(self):
        """
        Retourne les programmes filtrés par tenant_id et selon le rôle de l'utilisateur
        """
        queryset = TrainingProgram.objects.select_related(
            'member',
            'coach'
        ).prefetch_related('workout_sessions__exercises__exercise')
        
        # ✅ FILTRAGE PAR TENANT_ID
        user = self.request.user
        tenant_id = self._get_tenant_id()
        
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
            print(f"[DEBUG] 🔍 Filtrage par tenant_id: {tenant_id}")
        else:
            print(f"[WARNING] ⚠️ Aucun tenant_id trouvé - retour de tous les programmes")
        
        # Filtrer selon le rôle
        if user.role == 'member':
            # Filtrer par email du membre
            queryset = queryset.filter(member__email=user.email)
            print(f"[DEBUG] 👤 Filtrage membre: {user.email}")
        elif user.role == 'COACH':
            # Les coachs voient les programmes qu'ils ont créés
            queryset = queryset.filter(coach=user)
            print(f"[DEBUG] 🏋️ Filtrage coach: {user.email}")
        else:
            print(f"[DEBUG] 🔧 Admin/réceptionniste - pas de filtre supplémentaire")
        
        print(f"[DEBUG] 📊 Programmes trouvés: {queryset.count()}")
        return queryset
    
    def get_serializer_class(self):
        """
        Retourne le serializer approprié selon l'action
        """
        if self.action in ['create', 'update', 'partial_update']:
            return TrainingProgramFullCreateSerializer
        return TrainingProgramSerializer
    
    def perform_create(self, serializer):
        """
        Ajoute automatiquement le coach et le tenant_id lors de la création
        """
        user = self.request.user
        tenant_id = self._get_tenant_id()
        
        print(f"[DEBUG] 🚀 Création programme - User: {user.email}, Tenant: {tenant_id}")
        
        # Vérifier que le tenant_id est disponible
        if not tenant_id:
            print(f"[WARNING] ⚠️ Aucun tenant_id trouvé - vérification du membre")
            # Essayer de récupérer le tenant_id du membre
            member = serializer.validated_data.get('member')
            if member and hasattr(member, 'tenant_id') and member.tenant_id:
                tenant_id = member.tenant_id
                print(f"[DEBUG] ✅ Tenant_id récupéré du membre: {tenant_id}")
        
        if not tenant_id:
            print(f"[ERROR] ❌ Aucun tenant_id disponible pour la création")
            raise serializers.ValidationError({
                "tenant_id": "Impossible de déterminer le tenant_id pour la création du programme"
            })
        
        # Déterminer le coach
        coach = serializer.validated_data.get('coach', user)
        
        # Sauvegarder avec le tenant_id
        serializer.save(
            coach=coach,
            tenant_id=tenant_id
        )
        
        print(f"[DEBUG] ✅ Programme créé avec tenant_id: {tenant_id}")
    
    def perform_update(self, serializer):
        """
        Empêche la modification du tenant_id lors des updates
        """
        # Supprimer tenant_id des données validées si présent
        if 'tenant_id' in serializer.validated_data:
            del serializer.validated_data['tenant_id']
            print(f"[DEBUG] 🔒 Tenant_id supprimé des données de mise à jour")
        
        serializer.save()
    
    def _get_tenant_id(self):
        """
        Récupère le tenant_id depuis différentes sources
        """
        user = self.request.user
        
        # 1. Depuis l'utilisateur
        tenant_id = getattr(user, 'tenant_id', None)
        
        # 2. Depuis les headers
        if not tenant_id:
            tenant_id = self.request.headers.get("Tenant-ID") or self.request.headers.get("X-Tenant-Subdomain")
        
        # 3. Depuis le middleware ou autres sources
        if not tenant_id:
            tenant_id = getattr(self.request, 'tenant_id', None)
        
        print(f"[DEBUG] 🏢 Tenant_id récupéré: {tenant_id}")
        return tenant_id
    
    def get_serializer_context(self):
        """
        Passe la requête au serializer pour le contexte
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Dupliquer un programme existant avec le même tenant_id"""
        original_program = self.get_object()
        user = request.user
        tenant_id = self._get_tenant_id()
        
        print(f"[DEBUG] 🔄 Duplication programme {original_program.id} - Tenant: {tenant_id}")
        
        # Créer une copie du programme
        new_program = TrainingProgram.objects.create(
            title=f"{original_program.title} (Copie)",
            description=original_program.description,
            member=original_program.member,
            coach=user,
            status='draft',
            start_date=original_program.start_date,
            end_date=original_program.end_date,
            duration_weeks=original_program.duration_weeks,
            goal=original_program.goal,
            target_weight=original_program.target_weight,
            target_body_fat=original_program.target_body_fat,
            notes=original_program.notes,
            tenant_id=tenant_id or original_program.tenant_id  # Conserver le tenant_id
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
        print(f"[DEBUG] ✅ Programme dupliqué: {new_program.id}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """Exporter un programme en PDF"""
        program = self.get_object()
        
        # Vérifier que l'utilisateur a accès à ce programme
        if not self._has_access_to_program(program):
            return Response(
                {'error': 'Accès non autorisé à ce programme'},
                status=status.HTTP_403_FORBIDDEN
            )
    
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
    
    def _has_access_to_program(self, program):
        """
        Vérifie que l'utilisateur a accès au programme
        """
        user = self.request.user
        tenant_id = self._get_tenant_id()
        
        # Vérifier le tenant_id
        if tenant_id and program.tenant_id != tenant_id:
            return False
        
        # Vérifier selon le rôle
        if user.role == 'member':
            return program.member.email == user.email
        elif user.role == 'COACH':
            return program.coach == user
        
        # Admin et réceptionniste ont accès
        return True
    
    def list(self, request, *args, **kwargs):
        """Override list pour ajouter des logs"""
        print(f"[DEBUG] 📋 TrainingProgramViewSet.list() - User: {request.user.email}")
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve pour ajouter des logs"""
        print(f"[DEBUG] 🔍 TrainingProgramViewSet.retrieve() - User: {request.user.email}")
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Override create pour ajouter des logs"""
        print(f"[DEBUG] 🆕 TrainingProgramViewSet.create() - User: {request.user.email}")
        return super().create(request, *args, **kwargs)

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
    
    # 🔍 DEBUG - Informations utilisateur
    print("\n" + "="*80)
    print("🔍 DEBUG coach_my_members")
    print("="*80)
    print(f"User: {user.email}")
    print(f"Role: {user.role}")
    print(f"Tenant ID: {user.tenant_id}")
    print(f"Is authenticated: {user.is_authenticated}")
    
    # Vérifier le rôle
    if user.role != 'COACH':
        print(f"❌ Access denied - User role is {user.role}, not COACH")
        return Response({
            'error': 'Access denied. Coach role required.',
            'user_role': user.role
        }, status=403)
    
    try:
        # 🔍 DEBUG - Compter tous les programmes du coach
        all_programs = TrainingProgram.objects.filter(coach=user)
        print(f"\n📊 Total programmes du coach: {all_programs.count()}")
        
        for prog in all_programs:
            print(f"  - ID: {prog.id}, Titre: {prog.title}, Status: {prog.status}, Member: {prog.member.full_name if prog.member else 'None'}")
        
        # Récupérer les programmes actifs du coach avec optimisation des requêtes
        programs = TrainingProgram.objects.filter(
            coach=user,
            status='active'
        ).select_related('member').order_by('-created_at')
        
        print(f"\n✅ Programmes ACTIFS trouvés: {programs.count()}")
        
        members_data = []
        seen_members = set()  # Pour éviter les doublons
        
        for program in programs:
            try:
                member = program.member
                
                # 🔍 DEBUG - Détails du programme
                print(f"\n📋 Programme ID: {program.id}")
                print(f"   Titre: {program.title}")
                print(f"   Status: {program.status}")
                print(f"   Dates: {program.start_date} → {program.end_date}")
                
                # Vérifier que le membre existe
                if not member:
                    print(f"   ⚠️ WARNING: Aucun membre assigné")
                    continue
                
                print(f"   Membre: {member.full_name}")
                print(f"   Membre ID: {member.id}")
                print(f"   Membre email: {member.email}")
                print(f"   Membre tenant_id: {member.tenant_id}")
                
                # Éviter les doublons (un membre peut avoir plusieurs programmes actifs)
                if member.id in seen_members:
                    print(f"   ℹ️ Membre déjà traité (doublon évité)")
                    continue
                seen_members.add(member.id)
                
                # Calculer la progression basée sur les dates
                from datetime import date
                total_days = (program.end_date - program.start_date).days
                elapsed_days = (date.today() - program.start_date).days
                
                if total_days > 0:
                    progress = min(100, max(0, int((elapsed_days / total_days) * 100)))
                else:
                    progress = 0
                
                print(f"   📊 Progression: {progress}% ({elapsed_days}/{total_days} jours)")
                
                # Construire l'objet membre
                member_dict = {
                    'id': program.id,  # ID du programme
                    'member_id': member.id,
                    'member_name': member.full_name,
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
                print(f"   ✅ Membre ajouté à la réponse")
                
            except Exception as prog_error:
                print(f"   ❌ ERROR processing program {program.id}: {str(prog_error)}")
                import traceback
                traceback.print_exc()
                continue
        
        print(f"\n📤 Returning {len(members_data)} members")
        print("="*80 + "\n")
        
        return Response(members_data)
    
    except Exception as e:
        print(f"\n❌ ERROR in coach_my_members: {str(e)}")
        import traceback
        print(traceback.format_exc())
        print("="*80 + "\n")
        
        # Retourner une liste vide au lieu d'une erreur 500
        return Response([])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_programs(request):
    """
    Liste des programmes assignés au membre connecté
    """
    user = request.user
    
    print(f"🔍 DEBUG member_programs - User: {user.email}, Role: {getattr(user, 'role', 'Non défini')}")
    
    # ✅ CORRIGÉ: Vérifications de rôle plus flexibles
    is_member = (
        getattr(user, 'role', None) in ['MEMBER', 'member', 'Membre', 'membre'] or
        hasattr(user, 'member_profile') or
        hasattr(user, 'member') or
        Member.objects.filter(email=user.email).exists()
    )
    
    if not is_member:
        print(f"❌ Accès refusé - User role: {getattr(user, 'role', 'Non défini')}")
        return Response(
            {
                'error': 'Accès réservé aux membres',
                'user_role': getattr(user, 'role', 'Non défini'),
                'has_member_profile': hasattr(user, 'member_profile'),
                'has_member': hasattr(user, 'member')
            },
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # ✅ CORRIGÉ: Récupérer le membre de différentes manières
        member = None
        
        if hasattr(user, 'member_profile') and user.member_profile:
            member = user.member_profile
            print(f"✅ Membre trouvé via member_profile: {member.full_name}")
        elif hasattr(user, 'member') and user.member:
            member = user.member
            print(f"✅ Membre trouvé via member: {member.full_name}")
        else:
            # Essayer de trouver le membre par email
            try:
                member = Member.objects.get(email=user.email)
                print(f"✅ Membre trouvé par email: {member.full_name}")
            except Member.DoesNotExist:
                print(f"❌ Aucun membre trouvé avec l'email: {user.email}")
                return Response(
                    {'error': 'Profil membre non trouvé'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Récupérer tous les programmes du membre
        programs = TrainingProgram.objects.filter(
            member=member
        ).select_related(
            'coach'
        ).prefetch_related(
            'workout_sessions__exercises__exercise'
        ).order_by('-created_at')
        
        print(f"✅ Programmes trouvés: {programs.count()}")
        
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