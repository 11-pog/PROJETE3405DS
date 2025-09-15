from Aplicativo.models.publication_models import Publication
from rest_framework import serializers


class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = '__all__'