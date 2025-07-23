from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

from Aplicativo.models import Usuario

class RegistrarUsuario(APIView):
    def get(self, request):
        return Response({"message": "Use POST to register a user."})
    
    def post(self, request):
        usuario = request.data.get('usuario')
        senha = request.data.get('senha')
        email = request.data.get('email')
        telefone = request.data.get('telefone') 
        
        if Usuario.objects.filter(username=usuario).exists():
            return Response({'error': 'Usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Usuario.objects.create_user(username=usuario, password=senha, email=email, phone_number=telefone)
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