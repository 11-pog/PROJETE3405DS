from rest_framework.views import APIView
from rest_framework.generics import ListAPIView#baixar pip install djangorestframework
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import CursorPagination
from django.http import JsonResponse, HttpResponse
from Aplicativo.models.publication_models import Publication, Interaction
from Aplicativo.serializers.publication_serializer import PublicationFeedSerializer, CreatePublicationSerializer
from Aplicativo.serializers.interaction_serializer import InteractionSerializer


class GeneralPagination(CursorPagination):
    page_size = 10

class GetBookList(ListAPIView):
    serializer_class = PublicationFeedSerializer
    pagination_class = GeneralPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # No futuro botarei a IA aqui
        return Publication.objects.all().order_by('-created')


class GetFavoriteBooks(ListAPIView):
    serializer_class = PublicationFeedSerializer
    pagination_class = GeneralPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        saved_interactions = Interaction.objects.filter(
            user=user,
            is_saved=True
            ).select_related('publication').order_by('-saved_at')
        return saved_interactions


class FavoritePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        serializer = InteractionSerializer(
            
        )

    def delete(self, request, book_id):
        pass


class CadastrarLivro(APIView): 
    permission_classes = [IsAuthenticated] # meio que obrigatório isso aqui
    
    # Duas coisas:
    #   GET não é pra criar objetos, ele só serve pro front ler informação, LER, não escrever
    #   Uso de serializer é melhor (olhar em publication_serializer.py)
    def post(self, request):
        serializer = CreatePublicationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"mensagem": "Livro cadastrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class pesquisadelivro(APIView):
    def get(self, request):
        return Response({"message": "Use POST to search for a book."})
    
    def post(self, request):
        book_title = request.data.get('book_title')
        if not book_title:
            return Response({'error': 'O título do livro é obrigatório'}, status=400)
        
        livros = Publication.objects.filter(book_title__icontains=book_title)
        if not livros.exists():
            return Response({'message': 'Nenhum livro encontrado com esse título'}, status=404)
        
        resultados = []
        for livro in livros:
            resultados.append({
                'book_title': livro.book_title,
                'book_author': livro.book_author,
                'book_publisher': livro.book_publisher,
                'book_publication_date': livro.book_publication_date,
                'book_description': livro.book_description,
                'criado_por': livro.author_name
            })
        
        return Response({'results': resultados}, status=200)


class TestWebSocket(APIView):
    def get(self, request):
        return JsonResponse({'status': 'WebSocket server running'})


class WebSocketTest(APIView):
    def get(self, request):
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