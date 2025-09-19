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





class PrivateChat(APIView):
    def get(self, request, user1, user2):
        host = request.get_host().split(':')[0]
        html = f'''
<!DOCTYPE html>
<html>
<head><title>Chat Privado: {user1} & {user2}</title></head>
<body>
    <h3>Chat Privado entre {user1} e {user2}</h3>
    <div id="messages" style="border:1px solid #ccc; height:400px; overflow-y:auto; padding:10px; margin:10px 0;"></div>
    
    <div style="display:flex; gap:10px;">
        <input type="text" id="messageInput" placeholder="Digite sua mensagem" style="flex:1;">
        <select id="senderSelect">
            <option value="{user1}">{user1}</option>
            <option value="{user2}">{user2}</option>
        </select>
        <button onclick="sendMessage()">Enviar</button>
    </div>
    
    <script>
        const socket = new WebSocket('ws://{host}:8000/ws/private/{user1}/{user2}/');
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