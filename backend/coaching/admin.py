# backend/coaching/admin.py
from django.contrib import admin
from .models import (
    ExerciseCategory, Exercise, TrainingProgram,
    WorkoutSession, WorkoutExercise, ProgressTracking,
    WorkoutLog, WorkoutLogExercise
)


@admin.register(ExerciseCategory)
class ExerciseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('created_at',)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'difficulty', 'created_by', 'created_at')
    list_filter = ('difficulty', 'category')
    search_fields = ('name', 'category__name', 'created_by__email')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'category', 'difficulty', 'equipment_needed')
        }),
        ('Médias', {
            'fields': ('image', 'video_url')
        }),
        ('Création', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'member', 'coach', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'coach', 'start_date')
    search_fields = ('title', 'member__user__email', 'coach__email')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'description', 'status', 'coach', 'member')
        }),
        ('Détails du programme', {
            'fields': ('start_date', 'end_date', 'duration_weeks', 'goal', 'target_weight', 'target_body_fat', 'notes')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ('program', 'title', 'week_number', 'day_of_week', 'duration_minutes')
    list_filter = ('week_number', 'day_of_week')
    search_fields = ('program__title', 'title')
    ordering = ('program', 'week_number', 'day_of_week', 'order')


@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = ('workout_session', 'exercise', 'sets', 'reps', 'rest_seconds', 'weight')
    list_filter = ('workout_session__program',)
    search_fields = ('exercise__name', 'workout_session__title')


@admin.register(ProgressTracking)
class ProgressTrackingAdmin(admin.ModelAdmin):
    list_display = ('member', 'date', 'weight', 'body_fat_percentage', 'chest', 'waist', 'hips')
    list_filter = ('date',)
    search_fields = ('member__user__email', 'member__user__first_name', 'member__user__last_name')
    ordering = ('-date',)


@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ('member', 'workout_session', 'date', 'duration_minutes', 'feeling')
    list_filter = ('feeling', 'date')
    search_fields = ('member__user__email', 'workout_session__title')
    ordering = ('-date',)


@admin.register(WorkoutLogExercise)
class WorkoutLogExerciseAdmin(admin.ModelAdmin):
    list_display = ('workout_log', 'exercise', 'sets_completed', 'reps_completed', 'weight_used')
    search_fields = ('exercise__name', 'workout_log__member__user__email')
    ordering = ('workout_log',)
