from sklearn.metrics.pairwise import cosine_similarity
from Aplicativo.ml.vector import get_all_publication_vector, get_all_user_vector
from Aplicativo.models.publication_models import Publication
import numpy as np

def recommend_publications_for_user(user, top_n=10):
    user_vec = get_all_user_vector(user).reshape(1, -1)
    
    publications = get_all_publication_vector()
    pub_vectors = np.array([p['vector'] for p in publications])
    pub_ids = [p['id'] for p in publications]
    
    similarities = cosine_similarity(user_vec, pub_vectors)[0]  # 1 x N → array of similarities
    
    top_indices = similarities.argsort()[::-1][:top_n]
    top_pub_ids = [pub_ids[i] for i in top_indices]
    
    recommended_publications = Publication.objects.filter(id__in=top_pub_ids)
    
    recommended_publications = sorted(
        recommended_publications,
        key=lambda pub: top_pub_ids.index(pub.id)
    )
    
    return recommended_publications
