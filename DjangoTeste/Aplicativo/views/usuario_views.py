from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from Aplicativo.models.user import Usuario
from rest_framework.permissions import IsAuthenticated


class EditarUsuario(APIView):
    permission_classes = [IsAuthenticated]  # garante que só usuário logado pode editar
    
    def patch(self, request):
        user = request.user
        username = request.data.get('username')
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