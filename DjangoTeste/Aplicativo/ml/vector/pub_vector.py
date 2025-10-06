from Aplicativo.ml.vector.shared import text_model, encode_all_texts
from django.db.models import Avg, Sum, Count, Q
from Aplicativo.models.publication_models import Publication, Interaction
import numpy as np


def get_publication_vector(pub, **kwargs):
    feat_vector = get_publication_feature_vec(pub, **kwargs)
    text_vector = kwargs.get('text_vector')
    if text_vector is None:
        text_vector = get_publication_text_vec(pub)
    
    return feat_vector, text_vector, np.concatenate([feat_vector, text_vector])


def get_publication_feature_vec(pub, **kwargs):
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
    
    return np.concatenate([behavior_vector, post_type_vector, genre_vector])


def get_publication_text_vec(pub):
    text = pub.book_description or ""
    text_vector = text_model.encode(text)
    
    return text_vector


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
    
    all_text_embed = encode_all_texts(publications)
    
    for pub in publications:
        feat_vec, text_vec, full_vec = get_publication_vector(
            pub,
            stats = stats_lookup.get(pub.id),
            text_vector = all_text_embed.get(pub.id),
            **kwargs
        )
        
        features_list.append({
            'id': pub.id,
            'full_vector': full_vec,
            'feature_vector': feat_vec,
            'text_embedding': text_vec,
        })
        
        pub.full_vector = full_vec
        pub.features_embedding = feat_vec
        pub.description_embedding = text_vec
        updt_pubs.append(pub)
    
    Publication.objects.bulk_update(updt_pubs, ['full_vector', 'features_embedding', 'description_embedding'])
    
    if stdout:
        stdout.write(f"Updated embeddings for {len(updt_pubs)} publications")
    
    return features_list