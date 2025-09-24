from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from Aplicativo.models.publication_models import Publication

class GetBookAuthor(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, book_id):
        try:
            publication = Publication.objects.select_related('post_creator').get(id=book_id)
            print(f"[DEBUG] Publicação {book_id} encontrada")
            print(f"[DEBUG] post_creator: {publication.post_creator}")
            if publication.post_creator:
                print(f"[DEBUG] username: {publication.post_creator.username}")
            else:
                print(f"[DEBUG] post_creator é None!")
            
            return Response({
                'author_username': publication.post_creator.username if publication.post_creator else None,
                'author_id': publication.post_creator.id if publication.post_creator else None
            })
        except Publication.DoesNotExist:
            return Response({'error': 'Publicação não encontrada'}, status=404)