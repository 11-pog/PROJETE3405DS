from rest_framework.views import APIView     #baixar pip install djangorestframework
from rest_framework.response import Response
from rest_framework import status
from Aplicativo.models.publication_models import Publication
from Aplicativo.serializers.publication_serializer import PublicationSerializer
from rest_framework.decorators import api_view

@api_view(['GET'])
def listar_livros(request):
    livros = Publication.objects.all()
    serializer = PublicationSerializer(livros, many=True)
    return Response(serializer.data)


class CadastrarLivro(APIView):
    def get(self, request):
        serializer = PublicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"mensagem": "Livro cadastrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        book_title = request.data.get('book_title')
        book_author = request.data.get('book_author')
        book_publisher = request.data.get('book_publisher')
        book_publication_date = request.data.get('book_publication_date')
        book_description = request.data.get('book_description')
        
        
        if not all([book_title, book_author, book_publisher, book_publication_date, book_description]):
            return Response({'error': 'Todos os campos são obrigatórios'}, status=400)
        
        try:
            livro = Publication.objects.create(
                book_title=book_title,
                book_author=book_author,
                book_publisher=book_publisher,
                book_publication_date=book_publication_date,
                book_description=book_description
            )
            return Response({"mensagem": "Livro cadastrado com sucesso!","usuario": request.user.email}, status=201)
        except Exception as e:
            return Response({'error': f'Erro ao cadastrar o livro: {str(e)}'}, status=400)


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
                'book_description': livro.book_description
            })
        
        return Response({'results': resultados}, status=200)      