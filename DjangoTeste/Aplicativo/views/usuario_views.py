from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from Aplicativo.models.user_models import Usuario
from rest_framework.permissions import IsAuthenticated
from Aplicativo.serializers.user_serializer import UploadUserImageSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken


class EditarUsuario(APIView):
    permission_classes = [IsAuthenticated]  # garante que só usuário logado pode editar
    
    def patch(self, request):
        user = request.user
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        cidade = request.data.get('cidade')
        
        if username:
            user.username = username
        if password:
            user.set_password(password)
        if email:
            user.email = email
        if cidade:
            user.cidade = cidade
        
        user.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            "mensagem": "Dados atualizados com sucesso!",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=200)


class CadastrarUsuario(APIView):
    def get(self, request):
        return Response({"message": "Use POST to register a user."})
    
    def post(self, request):
        usuario = request.data.get('usuario')
        senha = request.data.get('senha')
        email = request.data.get('email')
        
        if Usuario.objects.filter(email=email).exists():
            return Response({'error': 'Usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = Usuario.objects.create_user(username=usuario, password=senha, email=email)
        refresh = RefreshToken.for_user(user)
        return Response({
            "mensagem": "Cadastro feito com sucesso",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=200)


class GetUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class UploadUserImage(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def patch(self, request):
        user = request.user
        
        # Check if a new image is being uploaded
        new_image = request.FILES.get('profile_picture')
        if new_image:
            # Delete old image if exists and not the default
            if user.profile_picture and user.profile_picture.url.startswith("defaults/"):
                user.profile_picture.delete(save=False)

        serializer = UploadUserImageSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"image_url": request.build_absolute_uri(user.profile_picture.url)})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
