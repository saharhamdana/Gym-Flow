# members/serializers.py
from rest_framework import serializers
from .models import Member, MemberMeasurement
from authentication.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

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

class MemberCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la création et la mise à jour"""
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Member
        fields = [
            'id', 'first_name', 'last_name', 'email', 'password', 'phone',
            'date_of_birth', 'gender', 'address', 'emergency_contact_name',
            'emergency_contact_phone', 'status', 'height', 'weight',
            'medical_conditions', 'photo'
        ]

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email')
        first_name = validated_data.get('first_name')
        last_name = validated_data.get('last_name')

          # ✅ Récupérer le tenant_id depuis la requête
        request = self.context.get('request')
        gym_center = getattr(request, 'gym_center', None)
        tenant_id = gym_center.tenant_id if gym_center else ''

        # Créer l'utilisateur
        user = User.objects.create_user(
            username=email.split('@')[0],  # Utiliser la partie avant @ comme nom d'utilisateur
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='MEMBER',
            tenant_field=tenant_id  # ✅ Associer le tenant_id à l'utilisateur
        )

         # Créer le membre avec le tenant_id
        member = Member.objects.create(
            **validated_data, 
            user=user,
            tenant_id=tenant_id  # ✅ Assigner le tenant_id
        )



    #     # Créer le membre et l'associer à l'utilisateur
    #     member = Member.objects.create(**validated_data, user=user)
    #     return member
    # latest_measurement = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ['member_id', 'join_date', 'created_at', 'updated_at']
    
    def get_latest_measurement(self, obj):
        measurement = obj.measurements.first()
        if measurement:
            return MemberMeasurementSerializer(measurement).data
        return None

class MemberCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        exclude = ['member_id', 'created_at', 'updated_at']
    
    def validate_email(self, value):
        instance = self.instance
        if instance and Member.objects.exclude(pk=instance.pk).filter(email=value).exists():
            raise serializers.ValidationError("Un membre avec cet email existe déjà.")
        elif not instance and Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un membre avec cet email existe déjà.")
        return value