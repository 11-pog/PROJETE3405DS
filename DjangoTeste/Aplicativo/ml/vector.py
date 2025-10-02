from django.db.models import Avg, Sum, Count, Q
from Aplicativo.models.publication_models import Publication, Interaction
from django.contrib.auth import get_user_model
from sentence_transformers import SentenceTransformer
import numpy as np

text_model = SentenceTransformer('all-MiniLM-L6-v2')
User = get_user_model()

def encode_all_texts(publications: Publication):
    texts = [pub.book_description or "" for pub in publications]
    
    text_vectors = text_model.encode(texts, batch_size=32)
    
    return text_vectors

def get_publication_vector():
    publications = Publication.objects.all()
    
    features_list = []
    updt_pubs = []
    
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
        
        post_type_vector = [int(pub.post_type == t) for t in Publication.PostType.values]
        genre_vector = [int(pub.book_genre == g) for g in Publication.BookGenre.values]
        
        text = pub.book_description or ""
        text_vector = text_model.encode(text, batch_size=32)
        
        full_vector = np.concatenate([behavior_vector, post_type_vector, genre_vector, text_vector])
        features_list.append({
            'id': pub.id,
            'vector': full_vector
        })
        
        pub.embedding = full_vector
        updt_pubs.append(pub)
    
    Publication.objects.bulk_update(updt_pubs, ['embedding'])
    return features_list


def get_user_vector():
    users = User.objects.all()
    
    features_list = []
    updt_users = []
    
    for user in users:
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
        
        post_type_vector = []
        for post_type in Publication.PostType.values:
            count = user.interactions.filter(publication__post_type=post_type).count()
            post_type_vector.append(count)
        total = sum(post_type_vector) or 1
        post_type_vector = [g/total for g in post_type_vector]
        
        genre_vector = []
        for genre in Publication.BookGenre.values:
            count = user.interactions.filter(publication__book_genre=genre).count()
            genre_vector.append(count)
        total = sum(genre_vector) or 1
        genre_vector = [g/total for g in genre_vector]
        
        pubs = Publication.objects.filter(interactions__user=user)
        if pubs.exists():
            text_vectors = np.array([text_model.encode(pub.book_description or "") for pub in pubs])
            text_vector = np.mean(text_vectors, axis=0)
        else:
            text_vector = np.zeros(text_model.get_sentence_embedding_dimension())
        
        full_vector = np.concatenate([behavior_vector, post_type_vector, genre_vector, text_vector])
        features_list.append({
            'id': user.id,
            'vector': full_vector
        })
        
        user.embedding = full_vector
        updt_users.append(user)
    
    User.objects.bulk_update(updt_users, ['embedding'])
    return features_list