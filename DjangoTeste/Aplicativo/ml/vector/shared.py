from Aplicativo.models.publication_models import Publication
from sentence_transformers import SentenceTransformer
from django.contrib.auth import get_user_model

text_model = SentenceTransformer('all-MiniLM-L6-v2')
User = get_user_model()

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