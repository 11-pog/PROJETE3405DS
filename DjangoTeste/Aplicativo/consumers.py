import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

# Consumer para gerenciar chat privado entre 2 usuários em tempo real
class PrivateChatConsumer(AsyncWebsocketConsumer):
    # Executado quando um usuário conecta ao WebSocket
    async def connect(self):
        print(f"[WEBSOCKET] Tentativa de conexão: {self.scope['path']}")
        # Pega os usernames dos 2 usuários da URL (ex: ws/private/joao/maria/)
        user1 = self.scope['url_route']['kwargs']['user1']
        user2 = self.scope['url_route']['kwargs']['user2']
        print(f"[WEBSOCKET] Usuários: {user1} e {user2}")
        
        # Identifica qual usuário está conectando (quem abriu o chat)
        # Assume que user1 é sempre o usuário atual
        self.current_user = user1
        
        # Cria sala única para os 2 usuários (ordem alfabética para garantir mesmo nome)
        # Ex: joao e maria sempre ficam na sala "joao_maria"
        users = sorted([user1, user2])
        self.room_name = f"{users[0]}_{users[1]}"
        self.room_group_name = f'private_chat_{self.room_name}'
        
        # Adiciona este WebSocket ao grupo da sala (permite broadcast de mensagens)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # Aceita a conexão WebSocket
        await self.accept()
        
        # Marcar apenas o usuário atual como online no banco de dados
        print(f"[ONLINE] Marcando {self.current_user} como online")
        await self.set_user_online(self.current_user, True)

    # Executado quando usuário desconecta do WebSocket
    async def disconnect(self, close_code):
        # Remove este WebSocket do grupo da sala
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Marcar apenas o usuário atual como offline no banco de dados
        print(f"[OFFLINE] Marcando {self.current_user} como offline")
        await self.set_user_online(self.current_user, False)

    # Executado quando recebe mensagem do frontend via WebSocket
    async def receive(self, text_data):
        # Converte JSON recebido em dicionário Python
        data = json.loads(text_data)
        
        # Se for resposta a pedido de empréstimo (aceitar/recusar)
        if data.get('type') == 'loan_response':
            # Envia para todos na sala (broadcast)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'loan_response',
                    'loan_id': data.get('loan_id'),
                    'action': data.get('action'),  # 'accepted' ou 'declined'
                    'sender': data.get('sender')
                }
            )
        # Se for início de countdown após aceitar empréstimo
        elif data.get('type') == 'start_countdown':
            # Envia para todos na sala (broadcast)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_countdown',
                    'loan_id': data.get('loan_id'),
                    'sender': data.get('sender')
                }
            )
        # Se for mensagem de chat normal
        else:
            message = data.get('message', "")
            sender = data.get('sender', "unknown")
            
            # Envia mensagem para todos na sala (broadcast)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'private_message',
                    'message': message,
                    'sender': sender
                }
            )

    # Handler chamado quando group_send envia 'private_message'
    async def private_message(self, event):
        # Monta dados da mensagem
        message_data = {
            'type': 'private_message',
            'message': event['message'],
            'sender': event['sender']
        }
        
        # Adicionar loan_id se existir (mensagem com pedido de empréstimo)
        if 'loan_id' in event:
            message_data['loan_id'] = event['loan_id']
        
        # Envia mensagem de volta para o frontend via WebSocket
        await self.send(text_data=json.dumps(message_data))
    
    # Handler chamado quando group_send envia 'loan_response'
    async def loan_response(self, event):
        # Envia resposta do empréstimo para o frontend via WebSocket
        await self.send(text_data=json.dumps({
            'type': 'loan_response',
            'loan_id': event['loan_id'],
            'action': event['action'],
            'sender': event['sender']
        }))
    
    # Handler chamado quando group_send envia 'start_countdown'
    async def start_countdown(self, event):
        # Envia sinal para iniciar countdown no frontend via WebSocket
        await self.send(text_data=json.dumps({
            'type': 'start_countdown',
            'loan_id': event['loan_id'],
            'sender': event['sender']
        }))
    
    # Função para atualizar status online do usuário no banco de dados
    # @database_sync_to_async permite usar código síncrono (Django ORM) em função async
    @database_sync_to_async
    def set_user_online(self, username, is_online):
        from Aplicativo.models.user_models import Usuario
        try:
            # Busca usuário no banco
            user = Usuario.objects.get(username=username)
            # Atualiza status online
            user.is_online = is_online
            # Se ficou offline, salva horário da última vez visto
            if not is_online:
                user.last_seen = timezone.now()
            user.save()
            print(f"[DB] Usuário {username} atualizado: is_online={is_online}")
        except Usuario.DoesNotExist:
            print(f"[DB] Usuário {username} não encontrado")

# Consumer para manter status online enquanto app está aberto
class OnlineStatusConsumer(AsyncWebsocketConsumer):
    # Executado quando usuário conecta ao WebSocket
    async def connect(self):
        # Pega username da URL (ex: ws/online/joao/)
        self.username = self.scope['url_route']['kwargs']['username']
        # Aceita a conexão WebSocket
        await self.accept()
        # Marca usuário como online no banco de dados
        await self.set_user_online(True)

    # Executado quando usuário desconecta (fecha o app)
    async def disconnect(self, close_code):
        # Marca usuário como offline no banco de dados
        await self.set_user_online(False)

    # Função para atualizar status online do usuário no banco de dados
    # @database_sync_to_async permite usar código síncrono (Django ORM) em função async
    @database_sync_to_async
    def set_user_online(self, is_online):
        from Aplicativo.models.user_models import Usuario
        try:
            # Busca usuário no banco
            user = Usuario.objects.get(username=self.username)
            # Atualiza status online
            user.is_online = is_online
            # Se ficou offline, salva horário da última vez visto
            if not is_online:
                user.last_seen = timezone.now()
            user.save()
        except Usuario.DoesNotExist:
            pass