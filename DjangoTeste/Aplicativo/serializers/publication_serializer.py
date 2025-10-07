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
    class Meta:
        model = Publication
        #removido o post creator pois no front não estamos enviando, isso que estava dando erro de badrequest#
        fields = [
            "book_title",
            "book_author",
            "book_publisher",
            "book_publication_date",
            "book_description",
            "book_genre",
            "post_location_city",
            "post_type",
            "book_rating",
        ]
    
    def to_internal_value(self, data):
        # Limpa campos vazios antes da validação
        data = data.copy()
        if 'book_publication_date' in data and data['book_publication_date'] == '':
            del data['book_publication_date']
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.setdefault("post_location_city", "Não informado")
        validated_data.setdefault("post_type", Publication.PostType.EMPRESTIMO)
        
        print(f"[SERIALIZER] validated_data keys: {list(validated_data.keys())}")
        if 'post_cover' in validated_data:
            print(f"[SERIALIZER] post_cover no validated_data: {validated_data['post_cover']}")
        else:
            print(f"[SERIALIZER] post_cover NÃO está no validated_data")
        
        return Publication.objects.create(post_creator=user, **validated_data)


class PublicationFeedSerializer(serializers.ModelSerializer):
    post_creator = serializers.CharField(source="post_creator.username", read_only=True)
    post_creator_id = serializers.IntegerField(source="post_creator.id", read_only=True)
    author_username = serializers.CharField(source="post_creator.username", read_only=True)
    is_saved = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    post_cover = serializers.SerializerMethodField()
    
    class Meta:
        model = Publication
        fields = [
            "id",
            "post_creator_id",
            "post_creator",
            "author_username",
            "book_title",
            "book_author",
            "book_description",
            "book_genre",
            "post_type",
            "post_cover",
            "is_saved",
            "is_owner",
            "is_available",
            "book_rating",
        ]
    
    def get_is_saved(self, obj):
        user: Usuario = self.context['request'].user
        return bool(user.interactions.filter(publication=obj, is_saved=True).exists())
    
    def get_is_owner(self, obj):
        user: Usuario = self.context['request'].user
        return obj.post_creator.id == user.id
    
    def get_post_cover(self, obj):
        if obj.post_cover:
            return obj.post_cover.url
        return None