from rest_framework_simplejwt.views import TokenObtainPairView
from Aplicativo.serializers.token_serializer import LoginEmailTokenSerializer


class LoginUsuario(TokenObtainPairView):
    serializer_class = LoginEmailTokenSerializer