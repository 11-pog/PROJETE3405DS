from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from Aplicativo.models.user_models import Usuario
from rest_framework.permissions import IsAuthenticated
from Aplicativo.serializers.user_serializer import UploadUserImageSerializer, UserSerializer, UpdateUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class ListUsers(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        users = Usuario.objects.exclude(id=request.user.id).values('id', 'username', 'email')
        return Response(list(users))


class UserView(APIView):
    """
        get(request):
            Retorna os dados do usuário autenticado.
            - Método GET não possui corpo.
            - Utiliza o UserSerializer para serializar os dados do usuário.
        
        post(request):
            Registra um usuario
            - Literalmente o cadastrar usuario
            - O unico que não precisa de autenticação
        
        patch(request):
            Atualiza parcialmente os dados do usuário autenticado.
            - Método PATCH permite modificar apenas campos específicos.
            - Utiliza o UpdateUserSerializer com partial=True.
            - Retorna mensagem de sucesso e novos tokens de acesso e refresh.
        
        put(request):
            Atualiza completamente os dados do usuário autenticado.
            - Método PUT exige todos os campos obrigatórios.
            - Utiliza o UpdateUserSerializer com partial=False.
            - Retorna mensagem de sucesso e novos tokens de acesso e refresh.
        
        delete????(request):
            Imagina
    """
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == "POST":
            # Se for POST, não é necessario autenticação (registrar usuario)
            return []
        return super().get_permissions()
    
    # GET -> pega informação (get request não tem corpo)
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    # POST -> cria um objeto, eis o nome, post
    # Vulgo CadastrarUsuario
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
        }, status=201)
    
    # Eu uni a logica de edição de usuario aqui pra GetUser
    # PATCH -> parcialmente atualiza algum objeto
    def patch(self, request):
        serializer = UpdateUserSerializer(
            request.user,
            data=request.data,
            partial = True
        )
        
        if serializer.is_valid():
            serializer.save()
            refresh = RefreshToken.for_user(request.user)
            return Response({
                "mensagem": "Dados atualizados com sucesso!",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=200)
    
    # PUT -> completamente atualiza o usuario
    def put(self, request):
        serializer = UpdateUserSerializer(
            request.user,
            data=request.data,
            partial = False
        )
        
        if serializer.is_valid():
            serializer.save()
            refresh = RefreshToken.for_user(request.user)
            return Response({
                "mensagem": "Dados atualizados com sucesso!",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=200)


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
    
class SearchUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Busca TODOS os usuários da tabela Aplicativo_usuario exceto o atual
            todos_usuarios = Usuario.objects.exclude(id=request.user.id)
            
            users_data = []
            for usuario in todos_usuarios:
                user_info = {
                    'id': usuario.id,
                    'username': usuario.username,
                    'email': usuario.email,
                    'is_active': usuario.is_active,
                    'date_joined': usuario.date_joined.strftime('%Y-%m-%d') if usuario.date_joined else None
                }
                users_data.append(user_info)
                
            return Response({
                'success': True,
                'total_usuarios': len(users_data),
                'usuarios_disponiveis': users_data,
                'message': f'Encontrados {len(users_data)} usuários para chat privado'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Erro ao buscar usuários do banco'
            }, status=500)