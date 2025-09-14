from rest_framework_simplejwt.views import TokenObtainPairView
from Aplicativo.serializers import LoginEmailTokenSerializer


class LoginUsuario(TokenObtainPairView):
    serializer_class = LoginEmailTokenSerializer