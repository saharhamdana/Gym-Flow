# Fichier: backend/bookings/serializers.py

from rest_framework import serializers
from .models import Room, CourseType, Course, Booking
from members.serializers import MemberListSerializer

class RoomSerializer(serializers.ModelSerializer):
    courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = '__all__'
        # ✅ CORRECTION : tenant_id en lecture seule
        read_only_fields = ['tenant_id']
    
    def get_courses_count(self, obj):
        return obj.courses.filter(status='SCHEDULED').count()


class CourseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseType
        fields = '__all__'
        # ✅ CORRECTION : tenant_id en lecture seule
        read_only_fields = ['tenant_id']


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer léger pour les listes"""
    course_type_name = serializers.CharField(source='course_type.name', read_only=True)
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    bookings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'course_type', 'course_type_name', 
            'coach', 'coach_name', 'room', 'room_name',
            'date', 'start_time', 'end_time', 'max_participants',
            'available_spots', 'is_full', 'bookings_count', 'status'
        ]
        read_only_fields = ['tenant_id']
    
    def get_bookings_count(self, obj):
        return obj.bookings.filter(status='CONFIRMED').count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé avec réservations"""
    course_type_details = CourseTypeSerializer(source='course_type', read_only=True)
    room_details = RoomSerializer(source='room', read_only=True)
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['tenant_id']


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        # ✅ CORRECTION : tenant_id en lecture seule
        read_only_fields = ['tenant_id']
    
    def validate(self, data):
        # Vérifier que end_time > start_time
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("L'heure de fin doit être après l'heure de début.")
        
        # Vérifier que max_participants <= room.capacity
        if data['max_participants'] > data['room'].capacity:
            raise serializers.ValidationError(
                f"Le nombre de participants ne peut pas dépasser la capacité de la salle ({data['room'].capacity})."
            )
        
        return data


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer léger pour les listes"""
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_date = serializers.DateField(source='course.date', read_only=True)
    course_start_time = serializers.TimeField(source='course.start_time', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'member', 'member_name', 'course', 'course_title',
            'course_date', 'course_start_time', 'status', 'checked_in',
            'booking_date'
        ]
        read_only_fields = ['tenant_id']


class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé"""
    member_details = MemberListSerializer(source='member', read_only=True)
    course_details = CourseListSerializer(source='course', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['tenant_id']


class BookingCreateSerializer(serializers.ModelSerializer):
    """
    ✅ CORRECTION: Gérer automatiquement le member depuis l'utilisateur
    """
    class Meta:
        model = Booking
        fields = ['course', 'notes']  # ✅ Retirer 'member' des champs
        read_only_fields = ['tenant_id']
    
    def create(self, validated_data):
        """
        ✅ CORRECTION: Récupérer automatiquement le membre depuis request.user
        """
        request = self.context.get('request')
        
        # Récupérer le membre depuis l'utilisateur connecté
        try:
            member = request.user.member_profile
        except AttributeError:
            raise serializers.ValidationError({
                'member': 'Profil membre introuvable pour cet utilisateur'
            })
        
        # Ajouter le membre aux données validées
        validated_data['member'] = member
        
        # Le tenant_id sera hérité du membre automatiquement dans le modèle
        booking = Booking.objects.create(**validated_data)
        
        return booking
    
    def validate(self, data):
        """
        ✅ Validation avec le membre récupéré du contexte
        """
        request = self.context.get('request')
        
        try:
            member = request.user.member_profile
        except AttributeError:
            raise serializers.ValidationError({
                'member': 'Profil membre introuvable'
            })
        
        course = data['course']
        
        # Vérifier si le cours est complet
        if course.is_full:
            raise serializers.ValidationError("Ce cours est complet.")
        
        # Vérifier si le membre a déjà réservé ce cours
        if Booking.objects.filter(
            course=course, 
            member=member
        ).exclude(status='CANCELLED').exists():
            raise serializers.ValidationError(
                "Vous avez déjà réservé ce cours."
            )
        
        # Vérifier si le cours est passé
        if course.is_past:
            raise serializers.ValidationError(
                "Impossible de réserver un cours passé."
            )
        
        # Vérifier si le cours est annulé
        if course.status == 'CANCELLED':
            raise serializers.ValidationError("Ce cours a été annulé.")
        
        return data
