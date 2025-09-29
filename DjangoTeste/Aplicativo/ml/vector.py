from django.db.models import Avg, Sum, Count, Q
from Aplicativo.models.publication_models import Publication, Interaction
from django.contrib.auth import get_user_model
from sentence_transformers import SentenceTransformer
import numpy as np

text_model = SentenceTransformer('all-MiniLM-L6-v2')

def get_publication_vector():
    publications = Publication.objects.all()
    
    features_list = []
    
    for pub in publications:
        stats = Interaction.objects.filter(publication=pub).aggregate(
            avg_rating=Avg('book_rating'),
            total_views=Sum('view_count'),
            save_count=Count('id', filter=Q(is_saved=True)),
            trade_count=Count('id', filter=Q(verified_trade=True)),
            message_count=Count('id', filter=Q(messaged_author=True)),
        )
        behavior_vector = [
            stats['avg_rating'] or 0,
            stats['total_views'] or 0,
            stats['save_count'] or 0,
            stats['trade_count'] or 0,
            stats['message_count'] or 0
        ]
        
        # --- Categorical one-hot encoding ---
        post_type_vector = [int(pub.post_type == t) for t in Publication.PostType.values]
        genre_vector = [int(pub.book_genre == g) for g in Publication.BookGenre.values]
        
        # --- Text embeddings ---
        text = (pub.book_description or "") + " " + (pub.full_text_excerpt or "")
        text_vector = text_model.encode(text)
        
        # --- Combine everything ---
        full_vector = np.concatenate([behavior_vector, post_type_vector, genre_vector, text_vector])
        features_list.append({
            'id': pub.id,
            'vector': full_vector
        })
    
    return features_list


def get_user_vector(user):
    stats = user.interactions.aggregate(
        avg_rating=Avg('book_rating'),
        total_views=Sum('view_count'),
        save_count=Count('id', filter=Q(is_saved=True)),
        trade_count=Count('id', filter=Q(verified_trade=True)),
        message_count=Count('id', filter=Q(messaged_author=True)),
    )
    behavior_vector = [
        stats['avg_rating'] or 0,
        stats['total_views'] or 0,
        stats['save_count'] or 0,
        stats['trade_count'] or 0,
        stats['message_count'] or 0
    ]
    
    # genre preference vector
    genre_vector = []
    for genre in Publication.BookGenre.values:
        count = user.interactions.filter(publication__book_genre=genre).count()
        genre_vector.append(count)
    
    # normalize genre_vector so big readers don’t dominate
    total = sum(genre_vector) or 1
    genre_vector = [g/total for g in genre_vector]
    
    # combine
    return np.array(behavior_vector + genre_vector)

