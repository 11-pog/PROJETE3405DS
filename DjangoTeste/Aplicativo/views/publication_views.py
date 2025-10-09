from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import CursorPagination
from django.db.models import F, Q, Value, FloatField, Case, When    

from Aplicativo.models.publication_models import ClusterInteractionMatrix, Publication, Interaction
from Aplicativo.serializers.publication_serializer import PublicationFeedSerializer, CreatePublicationSerializer
from Aplicativo.serializers.interaction_serializer import InteractionSerializer
from Aplicativo.serializers.user_serializer import UserSerializer
from django.shortcuts import get_object_or_404

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



from pgvector.django import CosineDistance


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
    class Pagination(CursorPagination):
        page_size = 20
        ordering = ['-cluster_strength', '-similarity', '-created_at', 'id']
    
    serializer_class = PublicationFeedSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]
    
    def get_ranked_queryset(qs, user):
        # Default annotations
        qs = qs.annotate(
            cluster_strength=Value(0.0, output_field=FloatField()),
            similarity=Value(0.0, output_field=FloatField())
        )

        # If user has cluster_label, add cluster strength info
        if hasattr(user, 'cluster_label') and user.cluster_label is not None:
            user_cluster = user.cluster_label

            # Build a mapping of cluster → strength
            strengths = dict(
                ClusterInteractionMatrix.objects
                .filter(user_cluster_id=user_cluster)
                .values_list('publication_cluster_id', 'interaction_strength')
            )

            # Annotate each publication with the corresponding cluster strength (or 0)
            cases = [
                When(cluster_label=cluster_id, then=Value(strength))
                for cluster_id, strength in strengths.items()
            ]
            if cases:
                qs = qs.annotate(cluster_strength=Case(*cases, default=Value(0.0), output_field=FloatField()))

        # If user has a full vector, compute similarity
        if hasattr(user, 'full_vector') and user.full_vector is not None:
            user_vec = user.full_vector
            qs = qs.exclude(full_vector=None).annotate(
                similarity=-CosineDistance(F("full_vector"), user_vec)
            )

        # Order by: cluster_strength DESC → similarity DESC → created_at DESC → id ASC
        qs = qs.order_by('-cluster_strength', '-similarity', '-created_at', 'id')

        return qs

    def get_queryset(self):
        user = self.request.user
        qs = Publication.objects.exclude(post_creator=user)
        
        return GetBookList.get_ranked_queryset(qs, user)



class BookDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, book_id):
        print(f"[BOOK_DETAIL] Buscando detalhes do livro ID: {book_id}")
        p = get_object_or_404(Publication, id=book_id)
        print(f"[BOOK_DETAIL] Livro encontrado: {p.book_title}, Tipo: {p.post_type}")
        
        p_serializer = PublicationFeedSerializer(p,
            context = {
                'request': request
            })
        user_serializer = UserSerializer(p.post_creator,
            context = {
                'request': request
            })
        
        InteractionSerializer.increment_view(
            request.user,
            p
        )
        
        print(f"[BOOK_DETAIL] Retornando dados: Título={p_serializer.data.get('book_title')}, Tipo={p_serializer.data.get('post_type')}")
        
        return Response(
            {
                'book': p_serializer.data,
                'post_creator': user_serializer.data
            },
            status=status.HTTP_200_OK
        )



class GetFavoriteBooks(ListAPIView):
    """
    Lista apenas os livros que o usuário marcou como favoritos.
    """
    
    class Pagination(CursorPagination):
        page_size = 20
        ordering = "-id"
    
    serializer_class = PublicationFeedSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Busca as publicações favoritadas através das interações
        saved_publication_ids = Interaction.objects.filter(
            user=user,
            is_saved=True
        ).values_list('publication_id', flat=True)
        
        # Retorna QuerySet das publicações favoritadas
        return Publication.objects.filter(
            id__in=saved_publication_ids
        ).order_by('-id')


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
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        print(f"[CADASTRO] Dados recebidos: {list(request.data.keys())}")
        print(f"[CADASTRO] Tem post_cover: {'post_cover' in request.data}")
        if 'post_cover' in request.data:
            print(f"[CADASTRO] Tipo do arquivo: {type(request.data['post_cover'])}")
            print(f"[CADASTRO] Nome do arquivo: {getattr(request.data['post_cover'], 'name', 'N/A')}")
        
        # Separar a imagem dos outros dados
        data_dict = {}
        image_file = None
        
        for key, value in request.data.items():
            if key == 'post_cover':
                image_file = value
            else:
                data_dict[key] = value
        
        serializer = CreatePublicationSerializer(data=data_dict, context={'request': request})
        if serializer.is_valid():
            publication = serializer.save()
            
            # Adicionar a imagem após salvar
            if image_file:
                publication.post_cover = image_file
                publication.save()
                print(f"[CADASTRO] Imagem salva: {publication.post_cover}")
            
            print(f"[CADASTRO] Publicacao salva com post_cover: {publication.post_cover}")
            
            # Dispara notificação
            channel_layer = get_channel_layer()
            if channel_layer:
                message_data = {
                    'type': 'new_publication',
                    'publication': {
                        'title': publication.book_title,
                        'author': publication.book_author or 'Autor não informado',
                        'user': publication.post_creator.username,
                        'message': f'Novo livro cadastrado: {publication.book_title}'
                    }
                }
                async_to_sync(channel_layer.group_send)('publications', message_data)
            
            return Response({"mensagem": "Livro cadastrado com sucesso!"}, status=201)
        
        return Response(serializer.errors, status=400)


class EditarLivro(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, book_id):
        try:
            print(f"[EDITAR] Tentando editar livro ID: {book_id}")
            print(f"[EDITAR] Dados recebidos: {request.data}")
            
            publication = get_object_or_404(Publication, id=book_id)
            print(f"[EDITAR] Livro encontrado: {publication.book_title}")
            
            if publication.post_creator != request.user:
                return Response({"error": "Você não pode editar este livro"}, status=403)
            
            # Guarda referência da imagem antiga
            old_image = publication.post_cover if 'post_cover' in request.data and publication.post_cover else None
            
            # Separar a imagem dos outros dados (igual ao cadastro)
            data_dict = {}
            image_file = None
            
            for key, value in request.data.items():
                if key == 'post_cover':
                    # Verifica se é um arquivo válido
                    if hasattr(value, 'read') and hasattr(value, 'name'):
                        image_file = value
                        print(f"[EDITAR] Arquivo de imagem válido recebido: {value.name}")
                    else:
                        print(f"[EDITAR] Valor inválido para post_cover: {type(value)} - {value}")
                        image_file = None
                else:
                    data_dict[key] = value
            
            print(f"[EDITAR] Criando serializer com dados: {list(data_dict.keys())}")
            serializer = CreatePublicationSerializer(publication, data=data_dict, partial=True, context={'request': request})
            if serializer.is_valid():
                updated_publication = serializer.save()
                
                # Adicionar a imagem após salvar em editar
                if image_file:
                    updated_publication.post_cover = image_file
                    updated_publication.save()
                    print(f"[EDITAR] Nova imagem salva: {updated_publication.post_cover}")
                    print(f"[EDITAR] Verificando se foi salva: {bool(updated_publication.post_cover)}")
                    # isso é meio que para garantir a atualização(precisa)
                    updated_publication.refresh_from_db()
                    print(f"[EDITAR] Após refresh_from_db: {updated_publication.post_cover}")
                
                print(f"[EDITAR] Livro atualizado com sucesso!")
                
                # Só deleta a antiga se a nova foi salva com sucesso
                if old_image and image_file and updated_publication.post_cover != old_image:
                    try:
                        print(f"[EDITAR] Deletando imagem antiga: {old_image}")
                        old_image.delete(save=False)
                        print(f"[EDITAR] Imagem antiga deletada com sucesso")
                    except Exception as delete_error:
                        print(f"[EDITAR] Erro ao deletar imagem antiga: {delete_error}")
                
                return Response({"mensagem": "Livro atualizado com sucesso!"}, status=200)
            
            print(f"[EDITAR] Erros de validação: {serializer.errors}")
            print(f"[EDITAR] Dados que causaram erro: {request.data}")
            return Response({
                "error": "Erro de validação",
                "details": serializer.errors,
                "message": str(serializer.errors)
            }, status=400)
            
        except Exception as e:
            print(f"[EDITAR] Exceção: {str(e)}")
            return Response({"error": str(e)}, status=500)


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
        print(f"[BUSCA] Termo de busca: '{busca}'")
        
        # Busca básica
        query = (
            Q(book_title__icontains=busca) |
            Q(post_location_city__icontains=busca) |
            Q(post_type__icontains=busca) |
            Q(book_author__icontains=busca) |
            Q(book_genre__icontains=busca) |
            Q(post_creator__username__icontains=busca)
        )
        
        # Busca por gêneros específicos
        busca_lower = busca.lower()
        if 'peça' in busca_lower:
            query |= Q(book_genre='peca_teatral')
        if 'romance' in busca_lower or 'narrativa' in busca_lower:
            query |= Q(book_genre='romance_narrativa')
        if 'não-ficção' in busca_lower or 'nao ficcao' in busca_lower:
            query |= Q(book_genre='nao_ficcao')
            
        livros = Publication.objects.filter(query)
        
        print(f"[BUSCA] Encontrados {livros.count()} livros")
        for livro in livros[:3]:  # Mostra os primeiros 3
            print(f"[BUSCA] - {livro.book_title} (gênero: {livro.book_genre})")
        
        if not livros.exists():
            print(f"[BUSCA] Nenhum resultado encontrado para '{busca}'")
            return Response({'message': 'Nenhum livro encontrado com esse título'}, status=404)
        
        serializer = PublicationFeedSerializer(livros, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'count': len(serializer.data),
            'livros': serializer.data
        }, status=200)