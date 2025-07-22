from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

class cadastrarusuario(APIView):
    def post(self, request):
       usuario = request.data.get('usuario')
       senha = request.data.get('senha')
       email = request.data.get('email')
       numero = request.data.get('numero') 
        
       if User.objects.filter(username=usuario).exists():
        return Response({'error': 'Usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)
       else:
        user = User.objects.create_user(username=usuario, password=senha, email=email, numero=numero)
        return Response({"mensagem": "Usuário criado com sucesso!"}, status=status.HTTP_201_CREATED)
       
class loginusuario(APIView):
    def post(self, request):
        usuario = request.data.get('usuario')
        senha = request.data.get('senha')

        user = authenticate(username=usuario, password=senha)
        if user is None:
         return Response({'error': 'Usuário ou senha incorretos'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
         return Response({'mensagem': 'Login bem-sucedido'}, status=status.HTTP_200_OK)
    
# Create your views here.
