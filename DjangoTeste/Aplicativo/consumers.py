import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user1 = self.scope['url_route']['kwargs']['user1']
        user2 = self.scope['url_route']['kwargs']['user2']
        
        # Identifica qual usuário está conectando (quem abriu o chat)
        # Assume que user1 é sempre o usuário atual
        self.current_user = user1
        
        # Cria sala única para os 2 usuários (ordem alfabética)
        users = sorted([user1, user2])
        self.room_name = f"{users[0]}_{users[1]}"
        self.room_group_name = f'private_chat_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Marcar apenas o usuário atual como online
        print(f"[ONLINE] Marcando {self.current_user} como online")
        await self.set_user_online(self.current_user, True)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Marcar apenas o usuário atual como offline
        print(f"[OFFLINE] Marcando {self.current_user} como offline")
        await self.set_user_online(self.current_user, False)

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if data.get('type') == 'loan_response':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'loan_response',
                    'loan_id': data.get('loan_id'),
                    'action': data.get('action'),
                    'sender': data.get('sender')
                }
            )
        elif data.get('type') == 'start_countdown':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_countdown',
                    'loan_id': data.get('loan_id'),
                    'sender': data.get('sender')
                }
            )
        else:
            message = data.get('message', "")
            sender = data.get('sender', "unknown")
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'private_message',
                    'message': message,
                    'sender': sender
                }
            )

    async def private_message(self, event):
        message_data = {
            'type': 'private_message',
            'message': event['message'],
            'sender': event['sender']
        }
        
        # Adicionar loan_id se existir
        if 'loan_id' in event:
            message_data['loan_id'] = event['loan_id']
            
        await self.send(text_data=json.dumps(message_data))
    
    async def loan_response(self, event):
        await self.send(text_data=json.dumps({
            'type': 'loan_response',
            'loan_id': event['loan_id'],
            'action': event['action'],
            'sender': event['sender']
        }))
    
    async def start_countdown(self, event):
        await self.send(text_data=json.dumps({
            'type': 'start_countdown',
            'loan_id': event['loan_id'],
            'sender': event['sender']
        }))
    
    @database_sync_to_async
    def set_user_online(self, username, is_online):
        from Aplicativo.models.user_models import Usuario
        try:
            user = Usuario.objects.get(username=username)
            user.is_online = is_online
            if not is_online:
                user.last_seen = timezone.now()
            user.save()
            print(f"[DB] Usuário {username} atualizado: is_online={is_online}")
        except Usuario.DoesNotExist:
            print(f"[DB] Usuário {username} não encontrado")

class PublicationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(f"WebSocket conectado: {self.channel_name}")
        await self.channel_layer.group_add("publications", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        print(f"WebSocket desconectado: {self.channel_name}")
        await self.channel_layer.group_discard("publications", self.channel_name)

    async def receive(self, text_data):
        print(f"Mensagem recebida: {text_data}")
        data = json.loads(text_data)
        message = data['message']
        
        await self.channel_layer.group_send(
            "publications",
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        print(f"Enviando mensagem: {message}")
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def new_publication(self, event):
        publication = event['publication']
        await self.send(text_data=json.dumps({
            'type': 'new_publication',
            'publication': publication
        }))

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = self.scope['url_route']['kwargs']['username']
        await self.accept()
        await self.set_user_online(True)

    async def disconnect(self, close_code):
        await self.set_user_online(False)

    @database_sync_to_async
    def set_user_online(self, is_online):
        from Aplicativo.models.user_models import Usuario
        try:
            user = Usuario.objects.get(username=self.username)
            user.is_online = is_online
            if not is_online:
                user.last_seen = timezone.now()
            user.save()
        except Usuario.DoesNotExist:
            pass