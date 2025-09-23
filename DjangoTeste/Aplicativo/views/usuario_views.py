from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from Aplicativo.models.user_models import Usuario
from Aplicativo.models.publication_models import Loan, BookCareRating, Publication
from rest_framework.permissions import IsAuthenticated
from Aplicativo.serializers.user_serializer import UploadUserImageSerializer, UserSerializer, UpdateUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken

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


class CreateLoan(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        publication_id = request.data.get('publication_id')
        borrower_id = request.data.get('borrower_id')
        expected_return_date = request.data.get('expected_return_date')
        
        try:
            publication = Publication.objects.get(id=publication_id)
            borrower = Usuario.objects.get(id=borrower_id)
            
            loan = Loan.objects.create(
                publication=publication,
                lender=request.user,
                borrower=borrower,
                expected_return_date=expected_return_date
            )
            
            return Response({
                'message': 'Empréstimo criado com sucesso!',
                'loan_id': loan.id
            }, status=201)
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class CompleteLoan(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        loan_id = request.data.get('loan_id')
        care_rating = request.data.get('care_rating')
        comments = request.data.get('comments', '')
        
        try:
            loan = Loan.objects.get(id=loan_id, lender=request.user)
            loan.status = 'completed'
            loan.actual_return_date = timezone.now()
            loan.save()
            
            BookCareRating.objects.create(
                loan=loan,
                care_rating=care_rating,
                comments=comments
            )
            
            return Response({'message': 'Empréstimo finalizado e avaliado!'}, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)


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
                'care_rating_average': user.get_care_rating_average(),
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