from django.http import JsonResponse, HttpResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def notify_new_publication(publication_data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'publications',
        {
            'type': 'new_publication',
            'publication': publication_data
        }
    )

def test_view(request):
    return JsonResponse({'status': 'WebSocket server running'})

def websocket_test(request):
    host = request.get_host().split(':')[0]
    html = f'''
<!DOCTYPE html>
<html>
<head><title>Test WebSocket</title></head>
<body>
    <div id="status">Conectando...</div>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="Digite uma mensagem">
    <button onclick="sendMessage()">Enviar</button>
    <script>
        const socket = new WebSocket('ws://{host}:8000/ws/publications/');
        const messages = document.getElementById('messages');
        const status = document.getElementById('status');
        
        socket.onopen = function(e) {{
            status.innerHTML = 'Conectado!';
            status.style.color = 'green';
        }};
        
        socket.onclose = function(e) {{
            status.innerHTML = 'Desconectado!';
            status.style.color = 'red';
        }};
        
        socket.onerror = function(e) {{
            status.innerHTML = 'Erro de conexão!';
            status.style.color = 'red';
        }};
        
        socket.onmessage = function(e) {{
            const data = JSON.parse(e.data);
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `Mensagem: ${{data.message || JSON.stringify(data)}}`;
            messages.appendChild(messageElement);
        }};
        
        function sendMessage() {{
            const input = document.getElementById('messageInput');
            if (socket.readyState === WebSocket.OPEN) {{
                socket.send(JSON.stringify({{'message': input.value}}));
                input.value = '';
            }} else {{
                alert('WebSocket não conectado!');
            }}
        }}
    </script>
</body>
</html>'''
    return HttpResponse(html)

