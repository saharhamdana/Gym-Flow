# members/serializers.py
from rest_framework import serializers
from .models import Member, MemberMeasurement

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
    latest_measurement = serializers.SerializerMethodField()
    
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