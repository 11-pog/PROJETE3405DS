import numpy as np
from sklearn.cluster import KMeans
from Aplicativo.ml.vector.pub_vector import get_all_publication_vector
from Aplicativo.ml.vector.user_vector import get_all_user_vector
from Aplicativo.models.publication_models import Interaction, Publication, ClusterInteractionMatrix
from django.db.models import Sum
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

def cluster_publications(**kwargs):
    stdout = kwargs.get('stdout')
    if stdout:
        stdout.write("Starting publication clustering")
    
    data = get_all_publication_vector(**kwargs)
    X = np.array([d['full_vector'] for d in data])
    ids = [d['id'] for d in data]
    
    if stdout:
        stdout.write(f"Clustering {len(data)} publications")
    
    _, kmeans = find_optimal_k_silhouette(X, 5, 40)
    labels = kmeans.labels_  # Already fitted
    
    if stdout:
        stdout.write(f"Found {len(set(labels))} publication clusters")
    
    pubs = Publication.objects.in_bulk(ids)  # One query for all pubs
    with transaction.atomic():
        for pub_id, label in zip(ids, labels):
            pub = pubs[pub_id]
            pub.cluster_label = int(label)
        Publication.objects.bulk_update(pubs.values(), ['cluster_label'])
    
    if stdout:
        stdout.write("Publication clustering completed")


def cluster_users(**kwargs):
    stdout = kwargs.get('stdout')
    if stdout:
        stdout.write("Starting user clustering")
    
    data = get_all_user_vector(**kwargs)
    X = np.array([d['full_vector'] for d in data])
    ids = [d['id'] for d in data]
    
    if stdout:
        stdout.write(f"Clustering {len(data)} users")
    
    _, kmeans = find_optimal_k_silhouette(X, 5, 40)
    labels = kmeans.labels_
    
    if stdout:
        stdout.write(f"Found {len(set(labels))} user clusters")
    
    users = User.objects.in_bulk(ids)
    with transaction.atomic():
        for uid, label in zip(ids, labels):
            user = users[uid]
            user.cluster_label = int(label)
        User.objects.bulk_update(users.values(), ['cluster_label'])
    
    if stdout:
        stdout.write("User clustering completed")


def update_cluster_interaction_matrix():
    # Aggregate interaction counts per (user_cluster, pub_cluster)
    data = (
        Interaction.objects
        .values('user__cluster_label', 'publication__cluster_label')
        .annotate(total_views=Sum('view_count'))
    )

    # Build or update matrix entries
    objs_to_update = []
    for entry in data:
        user_cluster = entry['user__cluster_label']
        pub_cluster = entry['publication__cluster_label']
        total = entry['total_views']

        obj, created = ClusterInteractionMatrix.objects.get_or_create(
            user_cluster_id=user_cluster,
            publication_cluster_id=pub_cluster,
            defaults={'interaction_strength': total}
        )

        if not created:
            obj.interaction_strength = total
        objs_to_update.append(obj)

    ClusterInteractionMatrix.objects.bulk_update(objs_to_update, ['interaction_strength', 'updated_at'])
