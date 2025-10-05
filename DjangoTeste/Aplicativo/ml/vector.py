from collections import defaultdict
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

def get_publication_vector(pub, **kwargs):
    stats = kwargs.get('stats') or Interaction.objects.filter(publication=pub).aggregate(
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
    text_vector = text_model.encode(text)
    
    return np.concatenate([behavior_vector, post_type_vector, genre_vector, text_vector])

def get_all_publication_vector(**kwargs):
    stdout = kwargs.get('stdout')
    publications = Publication.objects.all()
    
    if stdout:
        stdout.write(f"Generating vectors for {len(publications)} publications")
    
    features_list = []
    updt_pubs = []
    
    all_stats = Interaction.objects.values('publication').annotate(
        avg_rating=Avg('book_rating'),
        total_views=Sum('view_count'),
        save_count=Count('id', filter=Q(is_saved=True)),
        trade_count=Count('id', filter=Q(verified_trade=True)),
        message_count=Count('id', filter=Q(messaged_author=True)),
    )
    stats_lookup = {stat['publication']: stat for stat in all_stats}
    
    for pub in publications:
        full_vector = get_publication_vector(
            pub,
            stats = stats_lookup.get(pub.id),
            **kwargs
        )
        
        features_list.append({
            'id': pub.id,
            'vector': full_vector
        })
        
        pub.embedding = full_vector
        updt_pubs.append(pub)
    
    Publication.objects.bulk_update(updt_pubs, ['embedding'])
    
    if stdout:
        stdout.write(f"Updated embeddings for {len(updt_pubs)} publications")
    
    return features_list


def get_user_vector(user, **kwargs):
    stats = kwargs.get('stats') or user.interactions.aggregate(
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
    
    post_type_counts = kwargs.get('post_type_counts') or user.interactions.values('publication__post_type').annotate(count=Count('id'))
    post_type_vector = [0] * len(Publication.PostType.values)
    
    for count_data in post_type_counts:
        idx = Publication.PostType.values.index(count_data['publication__post_type'])
        post_type_vector[idx] = count_data['count']
    
    total = sum(post_type_vector) or 1
    post_type_vector = [g/total for g in post_type_vector]
    
    
    genre_counts = kwargs.get('book_genre_counts') or user.interactions.values('publication__book_genre').annotate(count=Count('id'))
    genre_vector = [0] * len(Publication.BookGenre.values)
    
    for count_data in genre_counts:
        idx = Publication.BookGenre.values.index(count_data['publication__book_genre'])
        genre_vector[idx] = count_data['count']
    
    total = sum(genre_vector) or 1
    genre_vector = [g/total for g in genre_vector]
    
    text_vector = get_text_vector(user, **kwargs)
    
    return np.concatenate([behavior_vector, post_type_vector, genre_vector, text_vector])


def get_text_vector(user, **kwargs):
    pubs = kwargs.get('interacted_pubs') or Publication.objects.filter(interactions__user=user)
    zeros = np.zeros(text_model.get_sentence_embedding_dimension())
    
    if len(pubs) == 0:
        return zeros
    
    ratings_dict = kwargs.get('ratings_dict')
    if ratings_dict is None:
        ratings = (
            Interaction.objects.filter(user=user, publication__in=pubs)
            .values("publication_id")
            .annotate(weight=Avg("book_rating"))
        )
        ratings_dict = {r["publication_id"]: r["weight"] for r in ratings}
    
    embeddings = kwargs.get('book_description_embeddings')
    if embeddings is None:
        embeddings = encode_all_texts(pubs)
        embeddings = {pub.id: embedding for pub, embedding in zip(pubs, embeddings)}
    
    text_vectors = []
    weights = []
    for pub in pubs:
        vec = embeddings.get(pub.id)
        if vec is None:
            vec = zeros
        w = ratings_dict.get(pub.id) or 1
        text_vectors.append(vec)
        weights.append(w)
    return np.average(text_vectors, axis=0, weights=weights)


def get_all_user_vector(**kwargs):
    stdout = kwargs.get('stdout')
    users = User.objects.all()
    
    if stdout:
        stdout.write(f"Generating vectors for {len(users)} users")
    
    features_list = []
    updt_users = []
    
    info_kwargs = get_kwargs()
    
    for user in users:
        full_vector = get_user_vector(
            user,
            stats=info_kwargs['stats'].get(user.id, {}),
            post_type_counts=info_kwargs['post_type_counts'].get(user.id, []),
            book_genre_counts=info_kwargs['book_genre_counts'].get(user.id, []),
            ratings_dict=info_kwargs['ratings_dict'].get(user.id, {}),
            book_description_embeddings=info_kwargs['book_embeddings'],
            interacted_pubs=info_kwargs['interacted_pubs'].get(user.id, []),
            **kwargs
        )
        features_list.append({
            'id': user.id,
            'vector': full_vector
        })
        
        user.embedding = full_vector
        updt_users.append(user)
    
    User.objects.bulk_update(updt_users, ['embedding'])
    
    if stdout:
        stdout.write(f"Updated embeddings for {len(updt_users)} users")
    
    return features_list


def get_kwargs():
    pubs = Publication.objects.all()
    
    book_embeddings = encode_all_texts(pubs)
    book_embeddings = {pub.id: emb for pub, emb in zip(pubs, book_embeddings)}
    
    ratings = (
        Interaction.objects
        .values("user_id", "publication_id")
        .annotate(weight=Avg("book_rating"))
    )
    ratings_dict_by_user = defaultdict(dict)
    for r in ratings:
        ratings_dict_by_user[r["user_id"]][r["publication_id"]] = r["weight"]
    
    user_pubs = (
        Interaction.objects.values("user_id", "publication_id").distinct()
    )
    pubs_by_user = defaultdict(list)
    pub_map = {p.id: p for p in pubs}
    for rel in user_pubs:
        pubs_by_user[rel["user_id"]].append(pub_map[rel["publication_id"]])
    
    
    # 3) interacted publications per user (one query)
    user_pubs_qs = Interaction.objects.values('user_id', 'publication_id').distinct()
    pubs_by_user = defaultdict(list)
    for rel in user_pubs_qs:
        pub = pub_map.get(rel['publication_id'])
        if pub is not None:
            pubs_by_user[rel['user_id']].append(pub)
    
    
    stats_qs = Interaction.objects.values('user_id').annotate(
        avg_rating=Avg('book_rating'),
        total_views=Sum('view_count'),
        save_count=Count('id', filter=Q(is_saved=True)),
        trade_count=Count('id', filter=Q(verified_trade=True)),
        message_count=Count('id', filter=Q(messaged_author=True)),
    )
    stats_by_user = {}
    for s in stats_qs:
        stats_by_user[s['user_id']] = {
            'avg_rating': s.get('avg_rating'),
            'total_views': s.get('total_views'),
            'save_count': s.get('save_count'),
            'trade_count': s.get('trade_count'),
            'message_count': s.get('message_count'),
        }
    
    
    post_type_qs = Interaction.objects.values('user_id', 'publication__post_type').annotate(count=Count('id'))
    post_type_by_user = defaultdict(list)
    for p in post_type_qs:
        post_type_by_user[p['user_id']].append({
            'publication__post_type': p['publication__post_type'],
            'count': p['count']
        })
    
    
    genre_qs = Interaction.objects.values('user_id', 'publication__book_genre').annotate(count=Count('id'))
    genre_by_user = defaultdict(list)
    for g in genre_qs:
        genre_by_user[g['user_id']].append({
            'publication__book_genre': g['publication__book_genre'],
            'count': g['count']
        })
    
    return {
        'stats': stats_by_user,
        'post_type_counts':post_type_by_user,
        'book_genre_counts':genre_by_user,
        'ratings_dict':ratings_dict_by_user,
        'book_embeddings':book_embeddings,
        'interacted_pubs':pubs_by_user,
    }