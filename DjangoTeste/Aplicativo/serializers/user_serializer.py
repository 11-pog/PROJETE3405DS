# Aplicativo/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

from Aplicativo.models.user_models import Usuario

class UserSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['username', 'email', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

class UploadUserImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['profile_picture']