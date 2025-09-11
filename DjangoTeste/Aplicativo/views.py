import requests #baixar pip install requests
from django.db import IntegrityError
from rest_framework.views import APIView     #baixar pip install djangorestframework
from rest_framework.response import Response    
from rest_framework import status
from django.contrib.auth import authenticate
from Aplicativo.models import Usuario
from Aplicativo.models import Publication


class CadastrarUsuario(APIView):
    def get(self, request):
        return Response({"message": "Use POST to register a user."})
    
    def post(self, request):
        usuario = request.data.get('usuario')
        senha = request.data.get('senha')
        email = request.data.get('email')
        
        if Usuario.objects.filter(username=Usuario).exists():
            return Response({'error': 'Usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Usuario.objects.create_user(username=usuario, password=senha, email=email)
            return Response({"mensagem": "Usuário criado com sucesso!"}, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({'error': 'Telefone já registrado'}, status=status.HTTP_400_BAD_REQUEST)


class LoginUsuario(APIView):
    def get(self, request):
        return Response({"message": "Use POST to login."})
    
    def post(self, request):
        Usuario = request.data.get('usuario')
        Senha = request.data.get('senha')
        
        user = authenticate(username=Usuario, password=Senha)
        if user is None:
            return Response({'error': 'Usuário ou senha incorretos'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'mensagem': 'Login bem-sucedido'}, status=status.HTTP_200_OK)
            
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
            "autor(a)": autor, #outro URL
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