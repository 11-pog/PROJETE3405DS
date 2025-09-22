# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from Aplicativo.models.publication_models import Publication

@csrf_exempt
@api_view(['DELETE', 'POST'])
@permission_classes([IsAuthenticated])
def PublicationDeleteView(request, pk):
    try:
        print(f"[DELETE] Tentando excluir publicacao ID: {pk}")
        print(f"[DELETE] Usuario logado: {request.user}")
        
        # Busca a publicação
        publication = get_object_or_404(Publication, pk=pk)
        print(f"[DELETE] Publicacao encontrada: {publication.book_title}")
        print(f"[DELETE] Criador da publicacao: {publication.post_creator}")
        
        # Verifica se o usuário é o dono
        if publication.post_creator != request.user:
            print(f"[DELETE] ERRO: Usuario {request.user} nao e o dono da publicacao")
            return Response(
                {"error": "Você só pode excluir suas próprias publicações."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        print(f"[DELETE] Excluindo publicacao {publication.id} do usuario {request.user}")
        
        # Exclui a publicação
        publication.delete()
        
        print(f"[DELETE] Publicacao {pk} excluida com sucesso")
        
        return Response(
            {"message": "Publicação excluída com sucesso"}, 
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        print(f"[DELETE] ERRO ao excluir publicacao: {e}")
        import traceback
        print(f"[DELETE] TRACEBACK: {traceback.format_exc()}")
        return Response(
            {"error": "Erro interno do servidor"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )