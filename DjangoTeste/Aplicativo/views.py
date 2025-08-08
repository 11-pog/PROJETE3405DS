import requests #baixar pip install requests
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from Aplicativo.models import Usuario


class CadastrarUsuario(APIView):
    def get(self, request):
        return Response({"message": "Use POST to register a user."})
    
    def post(self, request):
        usuario = request.data.get('usuario')
        senha = request.data.get('senha')
        email = request.data.get('email')
        
        if Usuario.objects.filter(username=usuario).exists():
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
        usuario = request.data.get('usuario')
        senha = request.data.get('senha')
        
        user = authenticate(username=usuario, password=senha)
        if user is None:
            return Response({'error': 'Usuário ou senha incorretos'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'mensagem': 'Login bem-sucedido'}, status=status.HTTP_200_OK)
            
class Buscadelivro(APIView):
    def get(self, request):
        isbn = 9780545069670 #colocar isbn manual(codigo anterior), request.query_params.get('isbn')
        if not isbn:
            return Response({"erro": "ISBN não fornecido"}, status=400)
    
        url = f"https://openlibrary.org/isbn/{isbn}.json" #vou trocar provavelmente(certeza)
        resposta = requests.get(url)
        
        if resposta.status_code != 200:
            return Response({"erro": "Erro ao consultar a API externa"}, status=500)
        
        dados = resposta.json()
        if not dados:
            return Response({"erro": "Livro não encontrado"}, status=404)

        livro = dados["docs"][0]

        authors = livro.get("authors", [])
        autor = "Desconhecido" 
        if authors:
           autorkey = authors[0].get("key", None)

           if autorkey:
             url_autor = f"https://openlibrary.org{autorkey}.json"
             resposta_autor = requests.get(url_autor)

             if resposta_autor.status_code == 200:
                 autor = resposta_autor.json().get("name", "Desconhecido")


        resultado = {
            "titulo": livro.get("title", "Título não encontrado"),
            "autor(a)": autor, #outro URL
            "editor(a)": livro.get("publishers", ["Editora desconhecida"])[0],
            "ano_publicacao": livro.get("publish_date", "Ano desconhecido"),
            "Descricao": livro.get("value", "Descrição não disponível"), 
        }
            
        return Response(resultado, status=200)