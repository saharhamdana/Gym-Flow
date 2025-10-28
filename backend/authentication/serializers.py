from rest_framework import serializers
from django.contrib.auth import get_user_model
from authentication.models import GymCenter

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class GymCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = GymCenter
        fields = '__all__'
        read_only_fields = ['owner']  # owner sera assigné automatiquement

    def create(self, validated_data):
        # Assigner l'utilisateur connecté comme owner
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)