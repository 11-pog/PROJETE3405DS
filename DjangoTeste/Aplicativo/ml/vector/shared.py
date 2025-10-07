from Aplicativo.models.publication_models import Publication
from sentence_transformers import SentenceTransformer
from django.contrib.auth import get_user_model
import numpy as np

text_model = SentenceTransformer('all-MiniLM-L6-v2')
User = get_user_model()

def zero_desc_embedding():
    return np.zeros(text_model.get_sentence_embedding_dimension())

def zero_feat_embedding():
    return np.zeros(Publication.feature_embedding_size)

def zero_full_embedding():
    return np.concatenate([zero_feat_embedding(), zero_desc_embedding()])


FRONTEND_ID_TO_BACKEND_GENRE = {
    "1": Publication.BookGenre.ROMANCE_NARRATIVA,
    "2": Publication.BookGenre.POESIA,
    "3": Publication.BookGenre.PECA_TEATRAL,
    "4": Publication.BookGenre.DIDATICO,
    "5": Publication.BookGenre.NAO_FICCAO,
    "6": Publication.BookGenre.NAO_ESPECIFICADO
}

def encode_all_texts(publications: Publication):
    texts = [pub.book_description or "" for pub in publications]
    text_vectors = text_model.encode(texts, batch_size=32)
    
    # Build lookup dictionary
    lookup = {pub.id: vec for pub, vec in zip(publications, text_vectors)}
    
    return lookup


def build_full_vec(item = None, **kwargs):
    alpha = 0.8  # feature weight
    beta = 0.2   # text weight
    
    feat = kwargs.get("feat") or item.features_embedding
    text = kwargs.get("text") or item.description_embedding
    
    return np.concatenate([alpha * feat, beta * text])