from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models.publication_models import Publication

@receiver(post_save, sender=Publication)
def notify_new_publication(sender, instance, created, **kwargs):
    if created:  # Só notifica quando é uma nova publicação
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'publications',
            {
                'type': 'new_publication',
                'publication': {
                    'title': instance.book_title,
                    'author': instance.book_author,
                    'user': instance.post_creator.username if instance.post_creator else 'Usuário',
                    'message': f'Novo livro cadastrado: {instance.book_title}'
                }
            }
        )