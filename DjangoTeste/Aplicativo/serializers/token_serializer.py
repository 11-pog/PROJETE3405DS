# Aplicativo/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class LoginEmailTokenSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD
    
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        
        user = authenticate(username=email, password=password)
        if user is None or not user.check_password(password):
            raise AuthenticationFailed("Email ou senha inválidos")
        
        attrs[self.username_field] = user.email
        data = super().validate(attrs)
        
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
        
        return data