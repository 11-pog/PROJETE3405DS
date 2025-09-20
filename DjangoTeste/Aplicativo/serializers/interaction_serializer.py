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
        read_only_fields = ["saved_at", "last_viewed_at", "view_count"]
    
    def save(self, **kwargs):
        user = self.context['request'].user
        kwargs['user'] = user
        
        if not self.instance:
            publication = self.initial_data.get("publication")

            # Fetch the original if it exists
            self.instance = Interaction.objects.filter(user=user, publication=publication).first()
        
        return super().save(**kwargs)