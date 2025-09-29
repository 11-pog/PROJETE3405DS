import numpy as np
from sklearn.cluster import KMeans
from Aplicativo.ml.features import get_publication_features

def cluster_publications():
    data = list(get_publication_features())
    if not data:
        return []
    
    features = np.array([
        [
            d['avg_rating'] or 0,
            d['total_views'] or 0,
            d['save_count'],
            d['trade_count'],
            d['message_count'],
        ]
        for d in data
    ])
    
    kmeans = KMeans(n_clusters=5, random_state=42)
    labels = kmeans.fit_predict(features)
    
    # attach labels to publications
    for d, label in zip(data, labels):
        d['cluster'] = int(label)
    
    return data