from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from Aplicativo.models.user_models import Usuario
from Aplicativo.models.publication_models import Loan, Publication
from rest_framework.permissions import IsAuthenticated

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
            
            # Marcar publicação como disponível novamente
            loan.publication.is_available = True
            loan.publication.save()
            
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


class AcceptLoan(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        loan_id = request.data.get('loan_id')
        
        try:
            loan = Loan.objects.get(id=loan_id, lender=request.user, status='pending')
            loan.status = 'accepted'
            loan.save()
            
            # Marcar publicação como indisponível
            loan.publication.is_available = False
            loan.publication.save()
            
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