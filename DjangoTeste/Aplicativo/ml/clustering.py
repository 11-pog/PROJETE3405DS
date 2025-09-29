import numpy as np
from sklearn.cluster import KMeans
from DjangoTeste.Aplicativo.ml.vector import get_publication_vector, get_user_vector
from Aplicativo.models.publication_models import Publication
from django.contrib.auth import get_user_model


User = get_user_model()

def cluster_publications():
    data = get_publication_vector()
    
    X = np.array([d['vector'] for d in data])
    kmeans = KMeans(n_clusters=20, random_state=42)
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
    
    kmeans = KMeans(n_clusters=20, random_state=42)
    labels = kmeans.fit_predict(X)
    
    for uid, label in zip(user_ids, labels):
        user = User.objects.get(id=uid)
        
        user.userprofile.cluster_label = int(label)
        user.userprofile.save()
