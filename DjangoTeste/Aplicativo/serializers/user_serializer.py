# Aplicativo/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

from Aplicativo.models.user_models import Usuario

class UserSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    preferred_genres = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'image_url',
            'points',
            'preferred_genres'
            ]
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
    def get_preferred_genres(self, obj):
        return obj.preferred_genres or ''


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'username',
            'password',
            'email',
            'city',
            'preferred_genres'
        ]
    
    def update(self, instance, validated_data):
        # Special handling for password
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UploadUserImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['profile_picture']