import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SiteTeste.settings")
django.setup()

from Aplicativo.models.publication_models import Publication

# Deletar por ID
book_id = 1
try:
    book = Publication.objects.get(id=book_id)
    book.delete()
    print(f"Livro ID {book_id} deletado com sucesso!")
except Publication.DoesNotExist:
    print(f"Livro ID {book_id} não encontrado.")