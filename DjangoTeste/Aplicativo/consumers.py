import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user1 = self.scope['url_route']['kwargs']['user1']
        user2 = self.scope['url_route']['kwargs']['user2']
        
        # Cria sala única para os 2 usuários (ordem alfabética)
        users = sorted([user1, user2])
        self.room_name = f"{users[0]}_{users[1]}"
        self.room_group_name = f'private_chat_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
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
        await self.send(text_data=json.dumps({
            'type': 'private_message',
            'message': event['message'],
            'sender': event['sender']
        }))

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