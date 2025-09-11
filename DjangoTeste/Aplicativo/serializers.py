# Aplicativo/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class LoginEmailTokenSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = User.objects.filter(email=email).first()
        
        if user is None or not user.check_password(password):
            raise serializers.ValidationError("Email ou senha inválidos")
        
        attrs[self.username_field] = user.email
        data = super().validate(attrs)

        data["user"] = {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }

        return data