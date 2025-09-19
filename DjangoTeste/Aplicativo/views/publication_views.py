from rest_framework.views import APIView
from rest_framework.generics import ListAPIView#baixar pip install djangorestframework
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import CursorPagination
from Aplicativo.models.publication_models import Publication, Interaction
from Aplicativo.serializers.publication_serializer import PublicationFeedSerializer, CreatePublicationSerializer
from Aplicativo.serializers.interaction_serializer import InteractionSerializer
from django.db.models import F

class GetBookList(ListAPIView):
    class Pagination(CursorPagination):
        page_size = 20
        ordering = "-created_at"
    
    serializer_class = PublicationFeedSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # No futuro botarei a IA aqui
        return Publication.objects.all().order_by('-created_at', 'id')


class GetFavoriteBooks(ListAPIView):
    class Pagination(CursorPagination):
        page_size = 20
        ordering = "-saved_at"
    
    serializer_class = PublicationFeedSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]
    
    
    def get_queryset(self):
        user = self.request.user
        
        saved_interactions = Interaction.objects.filter(
            user=user,
            is_saved=True
        ).select_related('publication')
        
        
        publications = Publication.objects.filter(
            id__in=saved_interactions.values_list('publication_id', flat=True)
        ).annotate(
            saved_at=F('interactions__saved_at')
        ).order_by('-saved_at', 'id')
        
        return publications

class FavoritePostView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, book_id):
        serializer = InteractionSerializer(
            data = {
                'publication': book_id,
                'is_saved': True
            },
            partial = True,
            context = {
                'request': request
            }
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(data = {
                'message': 'Livro favoritado'
            }, status=201)
        return Response(data = {
            'message': 'erro',
            'details': serializer.errors
        }, status=400)
    
    
    def delete(self, request, book_id):
        serializer = InteractionSerializer(
            data = {
                'publication': book_id,
                'is_saved': False
            },
            partial = True,
            context = {
                'request': request
            }
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(data = {
                'message': 'Livro desfavoritado'
            }, status=204)
        return Response(data = {
            'message': 'erro',
            'details': serializer.errors
        }, status=400)


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