import numpy as np
from sklearn.cluster import KMeans
from Aplicativo.ml.vector import get_publication_vector, get_user_vector
from Aplicativo.models.publication_models import Publication
from django.contrib.auth import get_user_model
from sklearn.metrics import silhouette_score
from django.db import transaction

User = get_user_model()

def find_optimal_k_silhouette(X, k_min=2, k_max=30):
    n_samples = len(X)
    k_max = min(k_max, n_samples-1)
    if n_samples <= k_min:
        kmeans = KMeans(n_clusters=1, random_state=42).fit(X)
        return 1, kmeans

    best_k, best_score = k_min, -1
    best_model = None

    for k in range(k_min, k_max+1):
        kmeans = KMeans(n_clusters=k, random_state=42).fit(X)
        score = silhouette_score(X, kmeans.labels_)
        if score > best_score:
            best_k, best_score, best_model = k, score, kmeans

    return best_k, best_model

def cluster_publications():
    data = get_publication_vector()
    X = np.array([d['vector'] for d in data])
    ids = [d['id'] for d in data]

    _, kmeans = find_optimal_k_silhouette(X, 5, 40)
    labels = kmeans.labels_  # Already fitted

    pubs = Publication.objects.in_bulk(ids)  # One query for all pubs
    with transaction.atomic():
        for pub_id, label in zip(ids, labels):
            pub = pubs[pub_id]
            pub.cluster_label = int(label)
        Publication.objects.bulk_update(pubs.values(), ['cluster_label'])

def cluster_users():
    users = list(User.objects.all())
    X = np.array([get_user_vector(u) for u in users])
    ids = [u.id for u in users]

    _, kmeans = find_optimal_k_silhouette(X, 5, 40)
    labels = kmeans.labels_

    with transaction.atomic():
        for uid, label in zip(ids, labels):
            user = next(u for u in users if u.id == uid)
            user.cluster_label = int(label)
        User.objects.bulk_update(users, ['cluster_label'])
