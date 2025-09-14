import sys, os
# 1) Deixa o Python enxergar a raiz (onde está manage.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# 2) Sobe o Django
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SiteTeste.settings")
django.setup()

# 3) Imports do DRF e da sua app
from rest_framework.test import APIRequestFactory
from Aplicativo.views import CadastrarUsuario   # ou RegistrarUsuario
from DjangoTeste.Aplicativo.models.user import Usuario           # se for User padrão: from django.contrib.auth.models import User

# 4) Monta o POST (não use GET para criar!)
factory = APIRequestFactory()
payload = {
    "usuario": "robzinho&robozao",
    "email": "belezamane@email.com",
    "senha": "1234",
    "telefone": "25999999999"   # inclua se sua view/model espera telefone
}
request = factory.post('/api/registrar/', payload, format='json')  # <- POST!

# 5) Chama a view
view = CadastrarUsuario.as_view()  # ou RegistrarUsuario.as_view()
response = view(request)

print("Status:", response.status_code)
print("Response data:", response.data)

# 6) Lê de volta do banco e imprime
u = Usuario.objects.get(username=payload["usuario"])   # se for User padrão, troque por User
print("Salvo no banco: ", u.id, u.username, u.email, getattr(u, "phone_number", None))

