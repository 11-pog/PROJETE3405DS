from django.db.models import Avg, Sum, Count, Q
from Aplicativo.models.publication_models import Publication

def get_publication_features():
    return (
        Publication.objects
        .annotate(
            avg_rating=Avg('interactions__book_rating'),
            total_views=Sum('interactions__view_count'),
            save_count=Count('interactions', filter=Q(interactions__is_saved=True)),
            trade_count=Count('interactions', filter=Q(interactions__verified_trade=True)),
            message_count=Count('interactions', filter=Q(interactions__messaged_author=True)),
        )
        .values('id', 'avg_rating', 'total_views', 'save_count', 'trade_count', 'message_count')
    )
