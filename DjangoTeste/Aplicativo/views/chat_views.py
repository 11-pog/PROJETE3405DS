from rest_framework.views import APIView
from django.http import HttpResponse
from Aplicativo.models.user_models import Usuario


class PrivateChat(APIView):
    def get(self, request, user1_id, user2_id):
        try:
            user1 = Usuario.objects.get(id=user1_id)
            user2 = Usuario.objects.get(id=user2_id)
        except Usuario.DoesNotExist:
            return HttpResponse("Usuário não encontrado", status=404)
            
        host = request.get_host().split(':')[0]
        html = f'''
<!DOCTYPE html>
<html>
<head><title>Chat Privado: {user1.username} & {user2.username}</title></head>
<body>
    <h3>Chat Privado entre {user1.username} e {user2.username}</h3>
    <div id="messages" style="border:1px solid #ccc; height:400px; overflow-y:auto; padding:10px; margin:10px 0;"></div>
    
    <div style="display:flex; gap:10px;">
        <input type="text" id="messageInput" placeholder="Digite sua mensagem" style="flex:1;">
        <select id="senderSelect">
            <option value="{user1.username}">{user1.username}</option>
            <option value="{user2.username}">{user2.username}</option>
        </select>
        <button onclick="sendMessage()">Enviar</button>
    </div>
    
    <script>
        const socket = new WebSocket('ws://{host}:8000/ws/private/{user1_id}/{user2_id}/');
        const messages = document.getElementById('messages');
        
        socket.onopen = () => console.log('Chat privado conectado!');
        
        socket.onmessage = function(e) {{
            const data = JSON.parse(e.data);
            const messageElement = document.createElement('div');
            const isMe = data.sender === document.getElementById('senderSelect').value;
            
            messageElement.style.textAlign = isMe ? 'right' : 'left';
            messageElement.style.margin = '5px 0';
            messageElement.style.padding = '8px';
            messageElement.style.backgroundColor = isMe ? '#e3f2fd' : '#f5f5f5';
            messageElement.style.borderRadius = '10px';
            
            messageElement.innerHTML = `<strong>${{data.sender}}:</strong> ${{data.message}}`;
            messages.appendChild(messageElement);
            messages.scrollTop = messages.scrollHeight;
        }};
        
        function sendMessage() {{
            const messageInput = document.getElementById('messageInput');
            const senderSelect = document.getElementById('senderSelect');
            
            if (messageInput.value.trim()) {{
                socket.send(JSON.stringify({{
                    'message': messageInput.value,
                    'sender': senderSelect.value
                }}));
                messageInput.value = '';
            }}
        }}
        
        document.getElementById('messageInput').addEventListener('keypress', function(e) {{
            if (e.key === 'Enter') sendMessage();
        }});
    </script>
</body>
</html>'''
        return HttpResponse(html)      