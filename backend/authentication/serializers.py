from rest_framework import serializers
from django.contrib.auth import get_user_model
from authentication.models import GymCenter
import re # Ajout de la dépendance pour le nouveau serializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'phone', 'date_of_birth', 'address', 
            'profile_picture', 'profile_picture_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'profile_picture_url']
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
        return None

        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 
            'date_of_birth', 'address', 'profile_picture'
        ]
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class GymCenterSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    full_url = serializers.CharField(read_only=True)
    is_subdomain_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = GymCenter
        fields = [
            'id', 'name', 'description', 'subdomain', 'email', 'phone', 
            'address', 'owner', 'owner_name', 'logo', 
            'tenant_id', 'is_active', 'full_url', 'is_subdomain_available',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'tenant_id', 'created_at', 'updated_at', 'full_url']
    
    def validate_subdomain(self, value):
        """Validation personnalisée du sous-domaine"""
        # Convertir en minuscules
        value = value.lower().strip()
        
        # Vérifier la longueur
        if len(value) < 3:
            raise serializers.ValidationError(
                "Le sous-domaine doit contenir au moins 3 caractères."
            )
        
        if len(value) > 63:
            raise serializers.ValidationError(
                "Le sous-domaine ne peut pas dépasser 63 caractères."
            )
        
        # Vérifier les sous-domaines réservés
        reserved_subdomains = [
            'www', 'api', 'admin', 'app', 'mail', 'ftp', 
            'smtp', 'pop', 'imap', 'test', 'dev', 'staging',
            'beta', 'demo', 'support', 'help', 'blog'
        ]
        
        if value in reserved_subdomains:
            raise serializers.ValidationError(
                f"Le sous-domaine '{value}' est réservé. Veuillez en choisir un autre."
            )
        
        # Vérifier l'unicité (sauf pour l'instance actuelle en mode édition)
        instance_id = self.instance.id if self.instance else None
        if GymCenter.objects.filter(subdomain=value).exclude(id=instance_id).exists():
            raise serializers.ValidationError(
                f"Le sous-domaine '{value}' est déjà utilisé. Veuillez en choisir un autre."
            )
        
        return value
    
    def create(self, validated_data):
        # Définir automatiquement l'owner à partir du contexte
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class CheckSubdomainSerializer(serializers.Serializer):
    """Serializer pour vérifier la disponibilité d'un sous-domaine"""
    subdomain = serializers.CharField(max_length=63)
    
    def validate_subdomain(self, value):
        value = value.lower().strip()
        
        # Vérifier le format
        if not re.match(r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$', value):
            raise serializers.ValidationError(
                "Le sous-domaine doit contenir uniquement des lettres minuscules, "
                "chiffres et tirets, et ne peut pas commencer ou finir par un tiret."
            )
        
        return value