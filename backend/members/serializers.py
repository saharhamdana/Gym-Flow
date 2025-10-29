# Fichier: members/serializers.py
from rest_framework import serializers
from .models import MemberProfile, PerformanceMetric
from subscriptions.serializers import MemberSubscriptionSerializer # Réutilisation du serializer

class PerformanceMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetric
        fields = [
            'id', 'date', 'weight_kg', 'height_cm', 
            'body_fat_percentage', 'notes'
        ]
        read_only_fields = ['member'] # Le membre sera défini dans la vue

class MemberProfileSerializer(serializers.ModelSerializer):
    # Champs du modèle User liés via OneToOneField
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    phone_number = serializers.CharField(source='user.phone', read_only=True)
    
    # Champs pour le suivi de performance (lecture seule pour la liste/détail)
    latest_metrics = PerformanceMetricSerializer(
        source='performance_metrics', 
        many=True, 
        read_only=True
    )
    
    # Abonnements actifs du membre
    active_subscriptions = serializers.SerializerMethodField()

    class Meta:
        model = MemberProfile
        fields = [
            'user', 'email', 'full_name', 'phone_number', 
            'join_date', 'current_status', 'goals', 
            'latest_metrics', 'active_subscriptions', 'last_activity'
        ]
        read_only_fields = ['user', 'join_date']

    def get_active_subscriptions(self, obj):
        # Récupérer les abonnements actifs depuis le module subscriptions
        active_subs = obj.user.membersubscription_set.filter(is_active=True).order_by('-start_date')
        # Utilisez le serializer du module subscriptions pour un affichage propre
        return MemberSubscriptionSerializer(active_subs, many=True).data