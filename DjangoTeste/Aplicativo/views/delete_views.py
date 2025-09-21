# views.py
from rest_framework import generics, permissions
from Aplicativo.models.publication_models import Publication
from Aplicativo.serializers.publication_serializers import PublicationSerializer

class PublicationDeleteView(generics.DestroyAPIView):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    permission_classes = [permissions.IsAuthenticated]  # só logado pode deletar
