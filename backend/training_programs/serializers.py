from rest_framework import serializers
from .models import TrainingProgram, Exercise

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'

class TrainingProgramSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingProgram
        fields = '__all__'
