from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class SendChatMessage(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        recipient = request.data.get('recipient')
        message = request.data.get('message')
        loan_id = request.data.get('loan_id')
        
        try:
            # Enviar via WebSocket
            channel_layer = get_channel_layer()
            if channel_layer:
                # Criar nome da sala (ordem alfabética dos usuários)
                users = sorted([request.user.username, recipient])
                room_name = f"{users[0]}_{users[1]}"
                room_group_name = f'private_chat_{room_name}'
                
                message_data = {
                    'type': 'private_message',
                    'message': message,
                    'sender': request.user.username,
                    'loan_id': loan_id
                }
                
                async_to_sync(channel_layer.group_send)(room_group_name, message_data)
                
                return Response({'message': 'Mensagem enviada'}, status=200)
            else:
                return Response({'error': 'WebSocket não disponível'}, status=500)
                
        except Exception as e:
            return Response({'error': str(e)}, status=400)