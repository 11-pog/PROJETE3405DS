from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse


def test_view(request):
    return JsonResponse({"status": "ok", "message": "Django funcionando"})

class TestAuth(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'message': 'Autenticação funcionando!',
            'user': request.user.username,
            'user_id': request.user.id
        })
    
    def post(self, request):
        print(f"[TEST_AUTH] Dados recebidos: {request.data}")
        print(f"[TEST_AUTH] Usuario: {request.user}")
        print(f"[TEST_AUTH] Autenticado: {request.user.is_authenticated}")
        
        return Response({
            'message': 'POST funcionando!',
            'user': request.user.username,
            'data_received': request.data
        })