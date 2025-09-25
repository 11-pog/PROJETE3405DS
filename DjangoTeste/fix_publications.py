#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SiteTeste.settings')
django.setup()

from Aplicativo.models.publication_models import Publication
from Aplicativo.models.user_models import Usuario

def fix_publications():
    # Buscar publicações sem autor
    publications_without_author = Publication.objects.filter(post_creator__isnull=True)
    print(f"Encontradas {publications_without_author.count()} publicações sem autor")
    
    if publications_without_author.exists():
        # Pegar o primeiro usuário disponível
        first_user = Usuario.objects.first()
        if first_user:
            print(f"Atribuindo publicações ao usuário: {first_user.username}")
            publications_without_author.update(post_creator=first_user)
            print("Publicações corrigidas!")
        else:
            print("Nenhum usuário encontrado no banco!")
    else:
        print("Todas as publicações já têm autor!")

if __name__ == '__main__':
    fix_publications()