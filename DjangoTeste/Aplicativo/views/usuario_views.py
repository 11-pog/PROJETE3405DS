from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from datetime import datetime
from Aplicativo.models.user_models import Usuario
from Aplicativo.models.publication_models import Loan, Publication
from rest_framework.permissions import IsAuthenticated
from Aplicativo.serializers.user_serializer import UploadUserImageSerializer, UserSerializer, UpdateUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from Aplicativo.ml.vector.user_vector import get_user_vector

class ListUsers(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        users = Usuario.objects.exclude(id=request.user.id)
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'image_url': request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                'total_person_rating': user.total_person_rating,
                'person_rating_count': user.person_rating_count,
                'total_book_care_rating': user.total_book_care_rating,
                'book_care_rating_count': user.book_care_rating_count,
                'chat_url': f'/private/{min(request.user.id, user.id)}/{max(request.user.id, user.id)}/'
            })
        return Response(users_data)


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
        user.full_vector = get_user_vector(user)
        user.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            "mensagem": "Cadastro feito com sucesso",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=201)
    
    # Eu uni a logica de edição de usuario aqui pra GetUser
    # PATCH -> parcialmente atualiza algum objeto
    def patch(self, request):
        # Salvar preferred_genres diretamente
        if 'preferred_genres' in request.data:
            request.user.preferred_genres = request.data['preferred_genres']
            request.user.full_vector = get_user_vector(request.user)
            request.user.save()
        
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
    # Removido parser_classes para aceitar tanto JSON quanto multipart
    
    def patch(self, request):
        user = request.user
        
        # Suporte para base64 (Expo Go)
        if 'profile_picture_base64' in request.data:
            import base64
            from django.core.files.base import ContentFile
            
            base64_data = request.data.get('profile_picture_base64')
            filename = request.data.get('filename', 'profile.jpg')
            
            # Decodificar base64
            image_data = base64.b64decode(base64_data)
            image_file = ContentFile(image_data, name=filename)
            
            # Deletar imagem antiga
            if user.profile_picture and not user.profile_picture.url.startswith("defaults/"):
                user.profile_picture.delete(save=False)
            
            # Salvar nova imagem
            user.profile_picture = image_file
            user.save()
            
            return Response({"image_url": request.build_absolute_uri(user.profile_picture.url)})
        
        # Método original para multipart
        new_image = request.FILES.get('profile_picture')
        if new_image:
            if user.profile_picture and not user.profile_picture.url.startswith("defaults/"):
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
                    'is_online': usuario.is_online,
                    'image_url': request.build_absolute_uri(usuario.profile_picture.url) if usuario.profile_picture else None,
                    'date_joined': usuario.date_joined.strftime('%Y-%m-%d') if usuario.date_joined else None,
                    'chat_url': f'/private/{min(request.user.id, usuario.id)}/{max(request.user.id, usuario.id)}/'
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


class UserProfile(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = Usuario.objects.get(id=user_id)
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'city': user.city,
                # 'care_rating_average': user.get_care_rating_average(),
                'total_loans': user.get_total_loans_count(),
                'completed_loans': user.get_completed_loans_count(),
                'chat_url': f'/private/{request.user.id}/{user.id}/'
            })
            
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)


class GenerateChatLink(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        other_user_id = request.data.get('user_id')
        
        try:
            other_user = Usuario.objects.get(id=other_user_id)
            current_user_id = request.user.id
            
            # Ordena IDs para manter consistência na URL
            user1_id = min(current_user_id, other_user_id)
            user2_id = max(current_user_id, other_user_id)
            
            chat_url = f'/private/{user1_id}/{user2_id}/'
            
            return Response({
                'chat_url': chat_url,
                'other_user': other_user.username
            })
            
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)


class GetUserBooks(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, username):
        try:
            user = Usuario.objects.get(username=username)
            publications = Publication.objects.filter(post_creator=user)
            
            books_data = []
            for pub in publications:
                books_data.append({
                    'id': pub.id,
                    'book_title': pub.book_title,
                    'book_author': pub.book_author,
                    'book_description': pub.book_description,
                    'post_type': pub.post_type
                })
            
            return Response({
                'results': books_data,
                'count': len(books_data)
            })
            
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)


class GetUserById(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = Usuario.objects.get(id=user_id)
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'image_url': request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                'total_person_rating': user.total_person_rating,
                'person_rating_count': user.person_rating_count,
                'total_book_care_rating': user.total_book_care_rating,
                'book_care_rating_count': user.book_care_rating_count
            })
            
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)


class RateUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        rated_user_id = request.data.get('rated_user_id')
        person_rating = request.data.get('person_rating')
        book_care_rating = request.data.get('book_care_rating')
        
        try:
            rated_user = Usuario.objects.get(id=rated_user_id)
            
            # Atualizar diretamente no modelo Usuario
            rated_user.total_person_rating += person_rating
            rated_user.person_rating_count += 1
            rated_user.total_book_care_rating += book_care_rating
            rated_user.book_care_rating_count += 1
            rated_user.total_user_rating += 1
            rated_user.user_rating_count += 1
            rated_user.save()
            
            return Response({
                'message': 'Avaliação enviada com sucesso!'
            }, status=200)
            
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=404)