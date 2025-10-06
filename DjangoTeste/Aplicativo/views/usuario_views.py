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
        user.embedding = get_user_vector(user)
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
            request.user.embedding = get_user_vector(request.user)
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


class CreateLoan(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        publication_id = request.data.get('publication_id')
        borrower_username = request.data.get('borrower_username')
        expected_return_date = request.data.get('expected_return_date')
        meeting_location = request.data.get('meeting_location', '')
        
        try:
            publication = Publication.objects.get(id=publication_id)
            borrower = Usuario.objects.get(username=borrower_username)
            
            loan = Loan.objects.create(
                publication=publication,
                lender=request.user,
                borrower=borrower,
                expected_return_date=expected_return_date,
                notes=meeting_location
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
            
            # Sistema de pontos baseado no tipo de publicação
            post_type = loan.publication.post_type
            
            if post_type == 'doacao':
                loan.lender.points += 150  # Dono ganha 150 pontos
                loan.borrower.points += 50  # Quem recebe ganha 50 pontos
            elif post_type == 'emprestimo':
                # Calcular dias de empréstimo
                days = (loan.actual_return_date.date() - loan.loan_date.date()).days
                loan.lender.points += days * 10  # 10 pontos por dia
                loan.borrower.points += 5  # 5 pontos fixos
            elif post_type == 'troca':
                loan.lender.points += 150  # Ambos ganham 150 pontos
                loan.borrower.points += 150
            
            loan.lender.save()
            loan.borrower.save()
            
            return Response({
                'message': f'Empréstimo finalizado! Pontos concedidos ({post_type}).',
                'lender_points': loan.lender.points,
                'borrower_points': loan.borrower.points
            }, status=200)
            
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


class RateLoanCare(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        loan_id = request.data.get('loan_id')
        care_rating = request.data.get('care_rating')
        comments = request.data.get('comments', '')
        
        try:
            loan = Loan.objects.get(id=loan_id, lender=request.user)
            
            rating, created = BookCareRating.objects.get_or_create(
                loan=loan,
                defaults={
                    'care_rating': care_rating,
                    'comments': comments
                }
            )
            
            if not created:
                rating.care_rating = care_rating
                rating.comments = comments
                rating.save()
            
            return Response({'message': 'Avaliação salva com sucesso!'}, status=200)
            
        except Loan.DoesNotExist:
            return Response({'error': 'Empréstimo não encontrado'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class RequestLoan(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        publication_id = request.data.get('publication_id')
        owner_username = request.data.get('owner_username')
        expected_return_date = request.data.get('expected_return_date')
        meeting_location = request.data.get('meeting_location', '')
        meeting_date = request.data.get('meeting_date', '')
        request_type = request.data.get('request_type', 'emprestimo')
        

        
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            publication = Publication.objects.get(id=publication_id)
            owner = Usuario.objects.get(username=owner_username)
            
            # Salvar o tipo de solicitação no campo notes
            loan = Loan.objects.create(
                publication=publication,
                lender=owner,
                borrower=request.user,
                expected_return_date=expected_return_date,
                notes=f"Local: {meeting_location} | Tipo: {request_type}",
                status='pending'
            )
            
            # Adicionar o tipo como atributo temporário
            loan.request_type = request_type
            
            # Enviar mensagem automática no chat
            channel_layer = get_channel_layer()
            if channel_layer:
                users = sorted([request.user.username, owner_username])
                room_group_name = f'private_chat_{users[0]}_{users[1]}'
                # Forçar o tipo baseado no request_type
                if request_type == 'troca':
                    tipo_texto = 'TROCA'
                    emoji_tipo = '🔄'
                else:
                    tipo_texto = 'EMPRÉSTIMO'
                    emoji_tipo = '📚'
                
                message = f"{emoji_tipo} SOLICITAÇÃO DE {tipo_texto}\n\n📖 Livro: {publication.book_title}\n👤 Autor: {publication.book_author or 'Não informado'}\n📍 Local de encontro: {meeting_location or 'Não informado'}\n📅 Data do encontro: {meeting_date or 'Não informado'}\n🔄 Data de devolução: {expected_return_date}\n\nTipo: {request_type.upper()}\n\n💬 Clique nos botões abaixo para responder:"
                
                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'private_message',
                        'message': message,
                        'sender': request.user.username,
                        'loan_id': loan.id
                    }
                )
            
            return Response({
                'message': 'Solicitação enviada com sucesso!',
                'loan_id': loan.id,
                'redirect_to_chat': True,
                'chat_partner': owner_username
            }, status=201)
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)


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


class AcceptLoan(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        loan_id = request.data.get('loan_id')
        
        try:
            loan = Loan.objects.get(id=loan_id, lender=request.user, status='pending')
            loan.status = 'accepted'
            loan.save()
            
            # Sistema de gamificação - pontos por aceitar empréstimo
            post_type = loan.publication.post_type
            lender_points = 0
            borrower_points = 0
            
            if post_type == 'emprestimo':
                lender_points = 50  # Quem empresta ganha 50 pontos
                borrower_points = 25  # Quem pega emprestado ganha 25 pontos
            elif post_type == 'troca':
                lender_points = 75  # Ambos ganham 75 pontos na troca
                borrower_points = 75
            
            # Adicionar pontos aos usuários
            loan.lender.points += lender_points
            loan.borrower.points += borrower_points
            loan.lender.save()
            loan.borrower.save()
            
            # Enviar mensagem automática no chat sobre os pontos
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            if channel_layer:
                users = sorted([loan.lender.username, loan.borrower.username])
                room_group_name = f'private_chat_{users[0]}_{users[1]}'
                
                points_message = f"🎉 EMPRÉSTIMO ACEITO!\n\n🎯 Pontos ganhos:\n• {loan.lender.username}: +{lender_points} pontos\n• {loan.borrower.username}: +{borrower_points} pontos"
                
                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'private_message',
                        'message': points_message,
                        'sender': 'Sistema'
                    }
                )
            
            return Response({
                'message': f'Empréstimo aceito! 🎉',
                'points_earned': {
                    'lender': lender_points,
                    'borrower': borrower_points
                },
                'total_points': {
                    'lender': loan.lender.points,
                    'borrower': loan.borrower.points
                },
                'post_type': post_type
            }, status=200)
            
        except Loan.DoesNotExist:
            return Response({'error': 'Empréstimo não encontrado'}, status=404)


class RejectLoan(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        loan_id = request.data.get('loan_id')
        
        try:
            loan = Loan.objects.get(id=loan_id, lender=request.user, status='pending')
            loan.status = 'rejected'
            loan.save()
            
            return Response({
                'message': 'Empréstimo rejeitado! ❌',
                'status': 'rejected'
            }, status=200)
            
        except Loan.DoesNotExist:
            return Response({'error': 'Empréstimo não encontrado'}, status=404)


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