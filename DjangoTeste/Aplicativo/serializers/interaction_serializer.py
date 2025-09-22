from Aplicativo.models.publication_models import Interaction
from Aplicativo.models.user_models import Usuario
from rest_framework import serializers


class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        fields = [
            "id",                # auto read-only
            "publication",
            "book_rating",
            "view_count",
            "is_saved",
            "saved_at",
            "messaged_author",
            "verified_trade",
            "last_viewed_at",
        ]
        read_only_fields = ["saved_at", "last_viewed_at"]
    
    def save(self, **kwargs):
        user = self.context.get('user') or self.context['request'].user
        kwargs['user'] = user
        
        if not self.instance:
            publication = self.validated_data.get("publication")
            
            self.instance = Interaction.objects.filter(user=user, publication=publication).first()
        print(self.validated_data)
        return super().save(**kwargs)
    
    
    @classmethod
    def increment_view(cls, user, publication):
        interaction = Interaction.objects.filter(user=user, publication=publication).first()
        view_count = interaction.view_count if interaction else 0
        view_count = view_count + 1
        
        print (interaction)
        print (view_count)
        
        serializer = cls(
            data = {
                'view_count': view_count,
                'publication': publication.id
            },
            partial = True,
            context = {
                'user': user
            }
        )
        
        if serializer.is_valid():
            print ("valid")
            serializer.save()
        else:
            print(serializer.errors)