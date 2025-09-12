import requests #baixar pip install requests
from django.db import IntegrityError
from rest_framework.views import APIView     #baixar pip install djangorestframework
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from Aplicativo.models import Usuario
from Aplicativo.models import Publication
from rest_framework.permissions import IsAuthenticated
from django.views.generic.edit import UpdateView
from django.http import HttpRequest
from .serializers import LoginEmailTokenSerializer

class EditarUsuario(APIView):
    
    permission_classes = [IsAuthenticated]  # garante que só usuário logado pode editar

    def patch(self, request):

        user = request.user
        username = request.data.get('usuario')
        email = request.data.get('email')
        cidade = request.data.get('cidade')
        if username:
            user.username = username
        if email:
            user.email = email
        if cidade:
            user.cidade = cidade  
    
        user.save()
        return Response({"mensagem": "Dados atualizados com sucesso!"}, status=200)


class CadastrarUsuario(APIView):
    def get(self, request):
        return Response({"message": "Use POST to register a user."})
    
    def post(self, request):
        usuario = request.data.get('usuario')
        senha = request.data.get('senha')
        email = request.data.get('email')
        cidade = request.data.get('cidade')

        if Usuario.objects.filter(username=Usuario).exists():
            return Response({'error': 'Usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)
    
        user = Usuario.objects.create_user(username=usuario, password=senha, email=email)
        return Response({"mensagem": "Usuário criado com sucesso!"}, status=status.HTTP_201_CREATED)


class LoginUsuario(TokenObtainPairView):
    serializer_class = LoginEmailTokenSerializer
   
            
class Buscadelivro(APIView):
    def get(self, request):
            return Response({"error": "ISBN não fornecido"}, status=400)
    def post(self, request):
        isbn = request.data.get('isbn')
        url = f"https://openlibrary.org/isbn/{isbn}.json" #link correto
        resposta = requests.get(url)
        
        if resposta.status_code != 200:
            return Response({"error": "Erro ao consultar a API externa"}, status=500)
        
        dados = resposta.json()
        if not dados:
            return Response({"error": "Livro não encontrado"}, status=404)

        livro = dados["docs"][0]

        authors = livro.get("authors", [])
        if authors:
            autorkey = authors[0].get("key", None)

            if autorkey:
                url_autor = f"https://openlibrary.org{autorkey}.json"
                resposta_autor = requests.get(url_autor)

                if resposta_autor.status_code == 200:
                        autor = resposta_autor.json().get("name", "Não encontrado")


        resultado = {
            "titulo": livro.get("title", "Título não encontrado"),
            "autor(a)": livro.get("authors []"), #outro URL
            "editor(a)": livro.get("publishers", ["Editora desconhecida"])[0],
            "ano_publicacao": livro.get("publish_date", "Ano desconhecido"),
            "Descricao": livro.get("value", "Descrição não disponível"), 
        }
            
        return Response(resultado, status=200)
    
class CadastrarLivro(APIView):
    def get(self, request):
        return Response({"message": "Use POST to register a book."})
    
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
            return Response({"mensagem": "Livro cadastrado com sucesso!"}, status=201)
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

