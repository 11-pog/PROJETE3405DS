import sys, os
# Configuração Django
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SiteTeste.settings")
django.setup()

# Imports
from rest_framework.test import APIRequestFactory
from Aplicativo.views.publication_views import pesquisadelivro

# Cria requisição de pesquisa (simula o front enviando o título)
factory = APIRequestFactory()
request = factory.post('/api/pesquisa/', {"book_title": "papai and mamae"}, format='json')

# Chama a view
view = pesquisadelivro.as_view()
response = view(request)

# Mostra no terminal
print("Status:", response.status_code)
print("Response data:", response.data)
