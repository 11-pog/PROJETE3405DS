from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import CursorPagination
from django.db.models import F

from Aplicativo.models.publication_models import Publication, Interaction
from Aplicativo.serializers.publication_serializer import PublicationFeedSerializer, CreatePublicationSerializer
from Aplicativo.serializers.interaction_serializer import InteractionSerializer
from django.db.models import Q


class GetMinhasPublicacoes(ListAPIView):
    """
    Endpoint para listar apenas as publicações do usuário logado.
    Usa a mesma paginação e serializer do feed principal.
    """
    class Pagination(CursorPagination):
        page_size = 20
        ordering = "-created_at"

    serializer_class = PublicationFeedSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Publication.objects.filter(post_creator=user).order_by('-created_at', 'id')


class GetBookList(ListAPIView):
    """
    Lista todas as publicações para o feed geral (ordenadas pela data de criação).
    """
    class Pagination(CursorPagination):
        page_size = 20
        ordering = "-created_at"
    
    serializer_class = PublicationFeedSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Publication.objects.all().order_by('-created_at', 'id')


class GetFavoriteBooks(ListAPIView):
    """
    Lista apenas os livros que o usuário marcou como favoritos.
    """
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
    """
    Permite favoritar ou desfavoritar uma publicação.
    POST = favoritar
    DELETE = desfavoritar
    """
    permission_classes = [IsAuthenticated]
    
    def dispatch(self, request, *args, **kwargs):
        print(f"[FAVORITAR] Requisicao {request.method} recebida para livro {kwargs.get('book_id')}")
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request, book_id):
        print(f"[FAVORITAR] Tentando favoritar livro ID: {book_id}")
        print(f"[FAVORITAR] Usuario: {request.user}")
        
        # Verifica se a publicação existe
        try:
            publication = Publication.objects.get(id=book_id)
            print(f"[FAVORITAR] Publicacao encontrada: {publication.book_title}")
        except Publication.DoesNotExist:
            print(f"[FAVORITAR] ERRO: Publicacao {book_id} nao existe")
            return Response({'error': 'Publicação não encontrada'}, status=404)
        
        serializer = InteractionSerializer(
            data={'publication': book_id, 'is_saved': True},
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            print(f"[FAVORITAR] Livro {book_id} favoritado com sucesso")
            return Response({'message': 'Livro favoritado'}, status=201)
        
        print(f"[FAVORITAR] Erros de validacao: {serializer.errors}")
        return Response({'message': 'erro', 'details': serializer.errors}, status=400)
    
    def delete(self, request, book_id):
        print(f"[DESFAVORITAR] Tentando desfavoritar livro ID: {book_id}")
        print(f"[DESFAVORITAR] Usuario: {request.user}")
        
        serializer = InteractionSerializer(
            data={'publication': book_id, 'is_saved': False},
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            print(f"[DESFAVORITAR] Livro {book_id} desfavoritado com sucesso")
            return Response({'message': 'Livro desfavoritado'}, status=200)
        
        print(f"[DESFAVORITAR] Erros de validacao: {serializer.errors}")
        return Response({'message': 'erro', 'details': serializer.errors}, status=400)


class CadastrarLivro(APIView): 
    """
    Endpoint para cadastrar um novo livro/publicação.
    Também dispara uma notificação via Django Channels.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            print("[CADASTRAR] VIEW CADASTRAR LIVRO EXECUTADA!")
            print(f"[CADASTRAR] Dados recebidos: {request.data}")
            print(f"[CADASTRAR] Usuario: {request.user}")
            
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            serializer = CreatePublicationSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                publication = serializer.save()
                
                # Dispara notificação para o grupo de publicações
                channel_layer = get_channel_layer()
                if channel_layer:
                    message_data = {
                        'type': 'new_publication',
                        'publication': {
                            'title': publication.book_title,
                            'author': publication.book_author,
                            'user': publication.post_creator.username if publication.post_creator else 'Usuário',
                            'message': f'Novo livro cadastrado: {publication.book_title}'
                        }
                    }
                    print(f"[CADASTRAR] Enviando notificacao: {message_data}")
                    async_to_sync(channel_layer.group_send)('publications', message_data)
                else:
                    print("[CADASTRAR] Channel layer nao encontrado!")
                
                return Response({"mensagem": "Livro cadastrado com sucesso!"}, status=status.HTTP_201_CREATED)
            
            print(f"[CADASTRAR] Erros de validacao: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"[CADASTRAR] ERRO INTERNO: {str(e)}")
            import traceback
            print(f"[CADASTRAR] TRACEBACK: {traceback.format_exc()}")
            return Response({"error": "Erro interno do servidor"}, status=500)


class pesquisadelivro(APIView):
    """
    Endpoint de busca por título de livro.
    Usa POST para receber o termo e retorna lista de resultados.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({"message": "Use POST to search for a book."})
    
    def post(self, request):
        print(f"[BUSCA] VIEW BUSCA EXECUTADA! Dados: {request.data}")
        book_title = request.data.get('book_title')
        if not book_title:
            return Response({'error': 'O título do livro é obrigatório'}, status=400)
        
        busca = request.data.get('book_title')
        livros = Publication.objects.filter(
            Q(book_title__icontains=busca) |
            Q(post_location_city__icontains=busca) |
            Q(post_type__icontains=busca) |
            Q(book_author__icontains=busca)
        )

        if not livros.exists():
            return Response({'message': 'Nenhum livro encontrado com esse título'}, status=404)
        
        serializer = PublicationFeedSerializer(livros, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'count': len(serializer.data),
            'livros': serializer.data
        }, status=200)