from django.db.models import Avg, Sum, Count, Q
from Aplicativo.models.publication_models import Publication, Interaction
from django.contrib.auth import get_user_model
from sentence_transformers import SentenceTransformer
import numpy as np

text_model = SentenceTransformer('all-MiniLM-L6-v2')
User = get_user_model()

FRONTEND_ID_TO_BACKEND_GENRE = {
    "1": Publication.BookGenre.ROMANCE_NARRATIVA,
    "2": Publication.BookGenre.POESIA,
    "3": Publication.BookGenre.PECA_TEATRAL,
    "4": Publication.BookGenre.DIDATICO,
    "5": Publication.BookGenre.NAO_FICCAO,
}

def encode_all_texts(publications: Publication):
    texts = [pub.book_description or "" for pub in publications]
    
    text_vectors = text_model.encode(texts, batch_size=32)
    
    return text_vectors

def get_publication_vector(pub):
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
    
    return np.concatenate([behavior_vector, post_type_vector, genre_vector, text_vector])

def get_all_publication_vector():
    publications = Publication.objects.all()
    
    features_list = []
    updt_pubs = []
    
    for pub in publications:
        full_vector = get_publication_vector(pub)
        features_list.append({
            'id': pub.id,
            'vector': full_vector
        })
        
        pub.embedding = full_vector
        updt_pubs.append(pub)
    
    Publication.objects.bulk_update(updt_pubs, ['embedding'])
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
    
    post_type_counts = user.interactions.values('publication__post_type').annotate(count=Count('id'))
    post_type_vector = [0] * len(Publication.PostType.values)
    
    for count_data in post_type_counts:
        idx = Publication.PostType.values.index(count_data['publication__post_type'])
        post_type_vector[idx] = count_data['count']
        
    total = sum(post_type_vector) or 1
    post_type_vector = [g/total for g in post_type_vector]
    
    
    genre_counts = user.interactions.values('publication__book_genre').annotate(count=Count('id'))
    genre_vector = [0] * len(Publication.BookGenre.values)
    
    for count_data in genre_counts:
        idx = Publication.BookGenre.values.index(count_data['publication__book_genre'])
        genre_vector[idx] = count_data['count']
        
    total = sum(genre_vector) or 1
    genre_vector = [g/total for g in genre_vector]
    
    
    
    pubs = Publication.objects.filter(interactions__user=user)
    
    text_vectors = []
    weights = []
    for pub in pubs:
        vec = text_model.encode(pub.book_description or "")
        w = pub.interactions.filter(user=user).aggregate(
            weight=Avg("book_rating")
        )["weight"] or 1
        text_vectors.append(vec)
        weights.append(w)
    text_vector = np.average(text_vectors, axis=0, weights=weights)
    
    return np.concatenate([behavior_vector, post_type_vector, genre_vector, text_vector])


def get_all_user_vector():
    users = User.objects.all()
    
    features_list = []
    updt_users = []
    
    for user in users:
        full_vector = get_user_vector(user)
        features_list.append({
            'id': user.id,
            'vector': full_vector
        })
        
        user.embedding = full_vector
        updt_users.append(user)
    
    User.objects.bulk_update(updt_users, ['embedding'])
    return features_list