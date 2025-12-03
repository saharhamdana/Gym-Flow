# backend/authentication/superadmin_views.py

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import GymCenter
from .serializers import GymCenterSerializer, UserSerializer
from django.db.models import Count, Q

User = get_user_model()


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission personnalisée pour vérifier si l'utilisateur est un Super Admin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class SuperAdminGymCenterViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour que le Super Admin puisse gérer TOUTES les salles de sport.
    
    Endpoints:
    - GET /api/superadmin/gyms/ : Liste toutes les salles
    - POST /api/superadmin/gyms/ : Créer une nouvelle salle
    - GET /api/superadmin/gyms/{id}/ : Détails d'une salle
    - PUT/PATCH /api/superadmin/gyms/{id}/ : Modifier une salle
    - DELETE /api/superadmin/gyms/{id}/ : Supprimer une salle
    - GET /api/superadmin/gyms/statistics/ : Statistiques globales
    """
    queryset = GymCenter.objects.all()
    serializer_class = GymCenterSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_queryset(self):
        """Retourne TOUTES les salles pour le super admin"""
        return GymCenter.objects.all().select_related('owner').annotate(
            total_members=Count('tenant_id', filter=Q(tenant_id__isnull=False))
        )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Retourne des statistiques globales sur toutes les salles.
        GET /api/superadmin/gyms/statistics/
        """
        total_gyms = GymCenter.objects.count()
        active_gyms = GymCenter.objects.filter(is_active=True).count()
        inactive_gyms = total_gyms - active_gyms
        
        # Statistiques sur les membres par salle
        gyms_with_stats = GymCenter.objects.annotate(
            member_count=Count('tenant_id', distinct=True)
        ).values('id', 'name', 'subdomain', 'member_count', 'is_active')
        
        return Response({
            'total_gyms': total_gyms,
            'active_gyms': active_gyms,
            'inactive_gyms': inactive_gyms,
            'gyms_details': list(gyms_with_stats)
        })
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """
        Active ou désactive une salle.
        POST /api/superadmin/gyms/{id}/toggle_status/
        """
        gym = self.get_object()
        gym.is_active = not gym.is_active
        gym.save()
        
        return Response({
            'message': f'Salle {"activée" if gym.is_active else "désactivée"} avec succès',
            'is_active': gym.is_active
        })


class SuperAdminStaffViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour que le Super Admin puisse gérer le staff de TOUTES les salles.
    
    Endpoints:
    - GET /api/superadmin/staff/ : Liste tout le personnel
    - GET /api/superadmin/staff/?gym_id=1 : Filtre par salle
    - GET /api/superadmin/staff/?role=ADMIN : Filtre par rôle
    - POST /api/superadmin/staff/ : Créer un membre du personnel
    - PUT/PATCH /api/superadmin/staff/{id}/ : Modifier un membre
    - DELETE /api/superadmin/staff/{id}/ : Supprimer un membre
    """
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_queryset(self):
        """
        Retourne tout le personnel de toutes les salles.
        Supporte le filtrage par gym_id et role.
        """
        queryset = User.objects.exclude(role='MEMBER')
        
        # Filtrer par salle si spécifié
        gym_id = self.request.query_params.get('gym_id', None)
        if gym_id:
            try:
                gym = GymCenter.objects.get(id=gym_id)
                queryset = queryset.filter(tenant_id=gym.tenant_id)
            except GymCenter.DoesNotExist:
                pass
        
        # Filtrer par rôle si spécifié
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        return queryset.select_related().order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def by_gym(self, request):
        """
        Retourne le personnel groupé par salle.
        GET /api/superadmin/staff/by_gym/
        """
        gyms = GymCenter.objects.all()
        result = []
        
        for gym in gyms:
            staff = User.objects.filter(
                tenant_id=gym.tenant_id
            ).exclude(role='MEMBER')
            
            result.append({
                'gym_id': gym.id,
                'gym_name': gym.name,
                'subdomain': gym.subdomain,
                'staff_count': staff.count(),
                'staff': UserSerializer(staff, many=True).data
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Statistiques sur le personnel.
        GET /api/superadmin/staff/statistics/
        """
        total_staff = User.objects.exclude(role='MEMBER').count()
        
        stats_by_role = {
            'ADMIN': User.objects.filter(role='ADMIN').count(),
            'COACH': User.objects.filter(role='COACH').count(),
            'RECEPTIONIST': User.objects.filter(role='RECEPTIONIST').count(),
        }
        
        return Response({
            'total_staff': total_staff,
            'by_role': stats_by_role
        })


class SuperAdminServicesViewSet(viewsets.ViewSet):
    """
    ViewSet pour gérer les services/configurations globales.
    
    Endpoints:
    - GET /api/superadmin/services/ : Liste les services disponibles
    - POST /api/superadmin/services/configure/ : Configure un service pour une salle
    """
    permission_classes = [IsSuperAdmin]
    
    def list(self, request):
        """
        Liste tous les services disponibles dans le système.
        """
        services = {
            'subscription_plans': 'Gestion des plans d\'abonnement',
            'courses': 'Gestion des cours collectifs',
            'bookings': 'Système de réservation',
            'training_programs': 'Programmes d\'entraînement',
            'billing': 'Facturation',
        }
        
        return Response({
            'available_services': services,
            'message': 'Liste des services configurables pour chaque salle'
        })
    
    @action(detail=False, methods=['post'])
    def configure(self, request):
        """
        Configure des services pour une salle spécifique.
        POST /api/superadmin/services/configure/
        Body: {
            "gym_id": 1,
            "services": ["courses", "bookings"]
        }
        """
        gym_id = request.data.get('gym_id')
        services = request.data.get('services', [])
        
        try:
            gym = GymCenter.objects.get(id=gym_id)
            
            # Ici vous pouvez ajouter une logique pour activer/désactiver des services
            # Par exemple, en ajoutant un champ JSON dans GymCenter
            
            return Response({
                'message': f'Services configurés pour {gym.name}',
                'gym': gym.name,
                'services': services
            })
        except GymCenter.DoesNotExist:
            return Response(
                {'error': 'Salle non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )