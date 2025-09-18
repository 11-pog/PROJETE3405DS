from rest_framework.views import APIView
from rest_framework.generics import ListAPIView#baixar pip install djangorestframework
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import CursorPagination
from Aplicativo.models.publication_models import Publication
from Aplicativo.serializers.publication_serializer import PublicationFeedSerializer, CreatePublicationSerializer


class FeedPagination(CursorPagination):
    page_size = 10

class GetBookList(ListAPIView):
    serializer_class = PublicationFeedSerializer
    pagination_class = FeedPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # No futuro botarei a IA aqui
        return Publication.objects.all().order_by('-created')


class CadastrarLivro(APIView): 
    permission_classes = [IsAuthenticated] # meio que obrigatório isso aqui
    
    # Duas coisas:
    #   GET não é pra criar objetos, ele só serve pro front ler informação, LER, não escrever
    #   Uso de serializer é melhor (olhar em publication_serializer.py)
    def post(self, request):
        serializer = CreatePublicationSerializer(data=request.data)
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