import numpy as np
from sklearn.cluster import KMeans
from Aplicativo.ml.vector import get_publication_vector, get_user_vector
from Aplicativo.models.publication_models import Publication
from django.contrib.auth import get_user_model
from sklearn.metrics import silhouette_score

User = get_user_model()

def find_optimal_k_silhouette(X, k_min=2, k_max=30):
    sample_amount = len(X)

    # Adjust k_max based on sample size
    k_max = min(k_max, sample_amount - 1)
    if sample_amount <= k_min:
        # Return 1 cluster with a fitted model
        kmeans = KMeans(n_clusters=1, random_state=42).fit(X)
        return 1, kmeans

    best_k, best_score = k_min, -1
    best_model = None
    
    for k in range(k_min, k_max+1):
        kmeans = KMeans(n_clusters=k, random_state=42).fit(X)
        score = silhouette_score(X, kmeans.labels_)
        if score > best_score:
            best_k, best_score = k, score
            best_model = kmeans

    return best_k, best_model


def cluster_publications():
    data = get_publication_vector()
    
    X = np.array([d['vector'] for d in data])
    _, kmeans = find_optimal_k_silhouette(X, 5, 40)
    labels = kmeans.fit_predict(X)
    
    for d, label in zip(data, labels):
        pub = Publication.objects.get(id=d['id'])
        pub.cluster_label = int(label)
        pub.save()

def cluster_users():
    users = User.objects.all()
    
    user_vectors = []
    user_ids = []
    
    for user in users:
        vec = get_user_vector(user)
        user_vectors.append(vec)
        user_ids.append(user.id)
    
    X = np.array(user_vectors)
    
    _, kmeans = find_optimal_k_silhouette(X, 5, 40)
    labels = kmeans.fit_predict(X)
    
    for uid, label in zip(user_ids, labels):
        user = User.objects.get(id=uid)
        
        user.cluster_label = int(label)
        user.save()
