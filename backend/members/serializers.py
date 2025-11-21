# Fichier: backend/members/serializers.py

from rest_framework import serializers
from .models import Member, MemberMeasurement
from authentication.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger('members.serializers')


class MemberMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberMeasurement
        fields = '__all__'
        read_only_fields = ['date']


class MemberListSerializer(serializers.ModelSerializer):
    """Serializer léger pour les listes"""
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Member
        fields = ['id', 'member_id', 'full_name', 'email', 'phone', 'status', 'age', 'photo']
        read_only_fields = ['tenant_id']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))


class MemberDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour les vues individuelles"""
    measurements = MemberMeasurementSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Member
        fields = [
            'id', 'member_id', 'first_name', 'last_name', 'email', 'phone',
            'date_of_birth', 'gender', 'address', 'join_date', 'status',
            'emergency_contact_name', 'emergency_contact_phone', 'height',
            'weight', 'medical_conditions', 'photo', 'measurements', 'user',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['tenant_id', 'member_id', 'join_date', 'created_at', 'updated_at']


class MemberCreateUpdateSerializer(serializers.ModelSerializer):
    """
    ✅ Serializer pour la création et la mise à jour
    Le password n'est requis QUE lors de la création
    """
    password = serializers.CharField(
        write_only=True, 
        required=False,  # ✅ Pas obligatoire pour l'UPDATE
        style={'input_type': 'password'}
    )

    class Meta:
        model = Member
        fields = [
            'id', 'first_name', 'last_name', 'email', 'password', 'phone',
            'date_of_birth', 'gender', 'address', 'emergency_contact_name',
            'emergency_contact_phone', 'status', 'height', 'weight',
            'medical_conditions', 'photo'
        ]
        read_only_fields = ['tenant_id', 'id']

    def validate_password(self, value):
        """Valider le password seulement s'il est fourni"""
        if value:
            try:
                validate_password(value)
            except ValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate_email(self, value):
        """Vérifier l'unicité de l'email"""
        instance = self.instance
        if instance and Member.objects.exclude(pk=instance.pk).filter(email=value).exists():
            raise serializers.ValidationError("Un membre avec cet email existe déjà.")
        elif not instance and Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un membre avec cet email existe déjà.")
        return value

    def validate(self, attrs):
        """
        ✅ Validation globale : password OBLIGATOIRE lors de la CRÉATION
        """
        # Si c'est une création (pas d'instance), password obligatoire
        if not self.instance and not attrs.get('password'):
            raise serializers.ValidationError({
                'password': 'Le mot de passe est obligatoire lors de la création'
            })
        
        return attrs

    def create(self, validated_data):
        """
        ✅ Création d'un membre avec son compte utilisateur
        """
        logger.debug(f"🔍 MemberCreateUpdateSerializer.create() appelé")
        logger.debug(f"📦 validated_data = {validated_data}")
        
        # Extraire le password
        password = validated_data.pop('password')
        
        # Extraire les infos de base
        email = validated_data.get('email')
        first_name = validated_data.get('first_name')
        last_name = validated_data.get('last_name')
        
        # ✅ Récupérer le tenant_id (passé par le ViewSet via perform_create)
        tenant_id = validated_data.get('tenant_id')
        
        if not tenant_id:
            logger.error("❌ tenant_id manquant dans validated_data")
            raise serializers.ValidationError({
                'tenant_id': 'Le centre (tenant_id) est requis pour créer un membre'
            })
        
        logger.debug(f"✅ Création User avec tenant_id={tenant_id}")
        
        try:
            # ✅ Créer l'utilisateur
            user = User.objects.create_user(
                username=email.split('@')[0],  # Username depuis email
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='MEMBER',
                tenant_id=tenant_id
            )
            logger.debug(f"✅ User créé: {user.id} - {user.email}")
            
        except Exception as e:
            logger.error(f"❌ Erreur création User: {e}")
            raise serializers.ValidationError({
                'user': f'Erreur lors de la création du compte utilisateur: {str(e)}'
            })
        
        try:
            # ✅ Créer le membre avec le user
            # validated_data contient DÉJÀ tenant_id, donc on ne le passe pas explicitement
            member = Member.objects.create(
                user=user,
                **validated_data  # Contient déjà tenant_id + tous les autres champs
            )
            logger.debug(f"✅ Member créé: {member.id} - {member.member_id}")
            
            return member
            
        except Exception as e:
            logger.error(f"❌ Erreur création Member: {e}")
            # Si la création du membre échoue, supprimer l'utilisateur
            user.delete()
            raise serializers.ValidationError({
                'member': f'Erreur lors de la création du profil membre: {str(e)}'
            })

    def update(self, instance, validated_data):
        """
        ✅ Mise à jour d'un membre
        Le password est optionnel lors de l'update
        """
        logger.debug(f"🔍 MemberCreateUpdateSerializer.update() appelé")
        
        # Si un password est fourni, mettre à jour l'utilisateur
        password = validated_data.pop('password', None)
        if password and instance.user:
            instance.user.set_password(password)
            instance.user.save()
        
        # Mettre à jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance