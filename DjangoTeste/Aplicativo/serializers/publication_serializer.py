from Aplicativo.models.publication_models import Publication
from Aplicativo.models.user_models import Usuario
from rest_framework import serializers


"""
Os serializadores das publicações so sitezinho

Temos:
    PublicationSerializer -> todos os campos, pra uso no admin panel
        NOTA: NUNCA USAR ESSE PRA CRIAR POST PUBLICAMENTE, isso possibilita que o front consiga modificar QUALQUER propriedade
        do banco, até alguns que são apenas leitura/criados automaticamente e nunca deveriam ser modificados
        ou passados manualmente (Ex: id, created_at).

    CreatePublicationSerializer -> usado para criar novas publicações via API
        Permite apenas os campos que o usuário deve fornecer
        Adiciona automaticamente o post_creator como o usuário logado
        Evita que campos sensíveis ou gerados automaticamente sejam modificados pelo front

    PublicationFeedSerializer -> usado para exibir as publicações no feed
        Contém apenas os campos necessários para o frontend
        Exibe o username do post_creator ao invés do ID


Se tiver um novo eu boto aqui, se pá
"""



class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = '__all__'


class CreatePublicationSerializer(serializers.ModelSerializer):
    book_publication_date = serializers.DateField(
    input_formats=['%d/%m/%y'],
    format='%d/%m/%y')
    class Meta:
        model = Publication
        fields = [
            "book_title",
            "book_author",
            "book_publisher",
            "book_publication_date",
            "book_description",
            "post_location_city",
            "post_type"
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.setdefault("post_location_city", "Não informado")
        validated_data.setdefault("post_type", Publication.PostType.EMPRESTIMO)
        return Publication.objects.create(post_creator=user, **validated_data)


class PublicationFeedSerializer(serializers.ModelSerializer):
    post_creator = serializers.CharField(source="post_creator.username", read_only=True)
    post_creator_id = serializers.IntegerField(source="post_creator.id", read_only=True)
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = Publication
        fields = [
            "id",
            "book_title",
            "book_author",
            "book_description",
            "post_type",
            "post_cover",
            "post_creator",
            "post_creator_id",
            "is_saved"
        ]
    
    def get_is_saved(self, obj):
        user: Usuario = self.context['request'].user
        return bool(user.interactions.filter(publication=obj, is_saved=True).exists())