from rest_framework import serializers
from .models import (
    ExerciseCategory, Exercise, TrainingProgram, 
    WorkoutSession, WorkoutExercise, ProgressTracking,
    WorkoutLog, WorkoutLogExercise
)


class ExerciseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseCategory
        fields = ['id', 'name', 'description', 'created_at']


class ExerciseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'difficulty', 'equipment_needed', 'video_url', 'image',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise_details = ExerciseSerializer(source='exercise', read_only=True)
    
    class Meta:
        model = WorkoutExercise
        fields = [
            'id', 'exercise', 'exercise_details', 'sets', 'reps',
            'rest_seconds', 'weight', 'notes', 'order'
        ]


class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'program', 'title', 'day_of_week', 'day_name',
            'week_number', 'duration_minutes', 'notes', 'order',
            'exercises', 'created_at'
        ]
        read_only_fields = ['created_at']


class WorkoutSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création avec exercices imbriqués"""
    exercises = WorkoutExerciseSerializer(many=True, required=False)
    
    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'program', 'title', 'day_of_week', 'week_number',
            'duration_minutes', 'notes', 'order', 'exercises'
        ]
    
    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        workout_session = WorkoutSession.objects.create(**validated_data)
        
        for exercise_data in exercises_data:
            WorkoutExercise.objects.create(
                workout_session=workout_session,
                **exercise_data
            )
        
        return workout_session
    
    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('exercises', None)
        
        # Mettre à jour la session
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les exercices si fournis
        if exercises_data is not None:
            # Supprimer les anciens exercices
            instance.exercises.all().delete()
            
            # Créer les nouveaux
            for exercise_data in exercises_data:
                WorkoutExercise.objects.create(
                    workout_session=instance,
                    **exercise_data
                )
        
        return instance


class MemberBasicSerializer(serializers.Serializer):
    """Serializer basique pour les informations du membre"""
    id = serializers.IntegerField(source='member.id', read_only=True)
    user_id = serializers.IntegerField(source='member.user.id', read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='member.user.email', read_only=True)
    phone = serializers.CharField(source='member.phone_number', read_only=True)
    
    def get_full_name(self, obj):
        if hasattr(obj, 'member') and obj.member:
            user = obj.member.user
            return user.get_full_name() or user.username
        return None


class CoachBasicSerializer(serializers.Serializer):
    """Serializer basique pour les informations du coach"""
    id = serializers.IntegerField(read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True)
    
    def get_full_name(self, obj):
        if hasattr(obj, 'coach') and obj.coach:
            return obj.coach.get_full_name() or obj.coach.username
        return None


class TrainingProgramSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)
    member_email = serializers.EmailField(source='member.user.email', read_only=True)
    coach_name = serializers.SerializerMethodField()
    coach_email = serializers.EmailField(source='coach.email', read_only=True)
    workout_sessions = WorkoutSessionSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'title', 'description', 
            'member', 'member_name', 'member_email',
            'coach', 'coach_name', 'coach_email',
            'status', 'status_display',
            'start_date', 'end_date', 'duration_weeks',
            'goal', 'target_weight', 'target_body_fat',
            'notes', 'workout_sessions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_coach_name(self, obj):
        if obj.coach:
            return obj.coach.get_full_name() or obj.coach.username
        return None


class TrainingProgramCreateSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour création"""
    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'title', 'description', 'member', 'coach', 'status',
            'start_date', 'end_date', 'duration_weeks',
            'goal', 'target_weight', 'target_body_fat', 'notes'
        ]


class ProgressTrackingSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)
    program_title = serializers.CharField(source='program.title', read_only=True)
    
    class Meta:
        model = ProgressTracking
        fields = [
            'id', 'member', 'member_name', 'program', 'program_title',
            'date', 'weight', 'body_fat_percentage',
            'chest', 'waist', 'hips', 'arms', 'thighs',
            'front_photo', 'side_photo', 'back_photo',
            'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


class WorkoutLogExerciseSerializer(serializers.ModelSerializer):
    exercise_details = ExerciseSerializer(source='exercise', read_only=True)
    
    class Meta:
        model = WorkoutLogExercise
        fields = [
            'id', 'exercise', 'exercise_details',
            'sets_completed', 'reps_completed', 'weight_used', 'notes'
        ]


class WorkoutLogSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)
    exercises = WorkoutLogExerciseSerializer(many=True, read_only=True)
    feeling_display = serializers.CharField(source='get_feeling_display', read_only=True)
    
    class Meta:
        model = WorkoutLog
        fields = [
            'id', 'member', 'member_name', 'workout_session',
            'date', 'duration_minutes', 'notes', 'feeling', 'feeling_display',
            'exercises', 'created_at'
        ]
        read_only_fields = ['created_at']


class WorkoutLogCreateSerializer(serializers.ModelSerializer):
    """Serializer pour création avec exercices imbriqués"""
    exercises = WorkoutLogExerciseSerializer(many=True, required=False)
    
    class Meta:
        model = WorkoutLog
        fields = [
            'id', 'member', 'workout_session', 'date',
            'duration_minutes', 'notes', 'feeling', 'exercises'
        ]
    
    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        workout_log = WorkoutLog.objects.create(**validated_data)
        
        for exercise_data in exercises_data:
            WorkoutLogExercise.objects.create(
                workout_log=workout_log,
                **exercise_data
            )
        
        return workout_log