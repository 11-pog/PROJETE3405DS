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
        isbn = 9788598078441 #mudar para entrada
        url = f"https://openlibrary.org/isbn/{isbn}.json"

        resposta = requests.get(url)
        
        if resposta.status_code != 200 or not resposta.json():
            return Response({"erro": "Erro ao consultar a API externa"}, status=500)  
        else: 
         url_autor = resposta.json().get("authors", [{}])[0].get("key")
         if url_autor:
            resposta_autor = requests.get(f"https://openlibrary.org{url_autor}.json")
         resultado ={
            "Autor": resposta_autor.json().get("name") if url_autor else None,
            "titulo": resposta.json().get("title"),
            "editor": resposta.json().get("publishers", [None])[0],
            "Descrição": resposta.json().get("description", {}).get("value") if isinstance(resposta.json().get("description"), dict) else resposta.json().get("description"),
            }
        return Response(resultado, status=200)