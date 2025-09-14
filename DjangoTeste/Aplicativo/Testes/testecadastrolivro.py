# testecadastrolivro.py — versão que garante salvar mesmo com inconsistência author/model
import sys, os, random
from datetime import date
from django.db import IntegrityError, connection

# 1) Deixa o Python enxergar a raiz (onde está manage.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# 2) Sobe o Django
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SiteTeste.settings")
django.setup()

# 3) Imports do DRF e da sua app
from rest_framework.test import APIRequestFactory, force_authenticate
from Aplicativo.views.publication_views import CadastrarLivro
from Aplicativo.models.publication_models import Publication
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# ---------- função para obter/usar um usuário existente (evita criar e provocar UNIQUE errors) ----------
BASE_USERNAME = "script_test_user"
BASE_EMAIL = "script@example.com"
BASE_PASSWORD = "senha_teste_123"

def get_test_user():
    # tenta por username
    u = User.objects.filter(username=BASE_USERNAME).first()
    if u:
        print(f"Usando usuário existente por username: {u.username}")
        return u
    # fallback: usa qualquer usuário existente (evita criar e provocar IntegrityError por phone_number)
    any_user = User.objects.first()
    if any_user:
        print(f"Usando usuário existente (fallback): {any_user.username}")
        return any_user
    # último recurso: tenta criar (pode falhar se o User exigir campos únicos/obrigatórios)
    try:
        u = User.objects.create(username=BASE_USERNAME, email=BASE_EMAIL)
        try:
            u.set_password(BASE_PASSWORD)
            u.save()
        except Exception:
            pass
        print(f"Usuário criado: {u.username}")
        return u
    except Exception as e:
        raise RuntimeError(f"Não consegui localizar nem criar usuário de teste: {e}")

user = get_test_user()

# ---------- payload do livro (inclui post_location_city obrigatório) ----------
payload = {
    "book_title": "a face do mal",
    "book_author": "lili spector",
    "book_publisher": "viva",
    "book_publication_date": "2007-12-17",
    "book_description": "face do medo sobre uma realidade oculta em que todos vivemos, a solidao e nesse livro entevemos a visaod e ana como ocultar crimes atraves da etica e moral",
    "post_location_city": "São Paulo",
    "post_description": "gabriel é uma pessoa foda que viveu em sao paulo, se formou na pscilogia na usp"
}

# ---------- detecta campos do modelo Publication ----------
print("\nCampos do modelo Publication (detectando nomes):")
field_names = []
author_field_name = None
for f in Publication._meta.get_fields():
    field_names.append(getattr(f, "name", str(f)))
    try:
        remote = getattr(f, "remote_field", None)
        if remote and getattr(remote, "model", None) == User:
            author_field_name = f.name
    except Exception:
        pass

print(", ".join(field_names))
print("Campo FK detectado para User (se houver):", author_field_name)

# ---------- 1) Chama a view (para testar endpoint) ----------
factory = APIRequestFactory()
request = factory.post('/api/cadastrarlivro/', payload, format='json')
force_authenticate(request, user=user)
view = CadastrarLivro.as_view()
response = view(request)

print("\nResposta da view:")
print("Status:", response.status_code)
print("Response data:", response.data)

# ---------- 2) Se a view NÃO salvou (status != 201), tenta o ORM; se o ORM falhar por author_id, usa INSERT SQL ----------
saved = False
if response.status_code == 201:
    saved = True
else:
    print("\nA view não salvou o registro. Tentando salvar via ORM (se possível)...")

    # prepara kwargs apenas com campos válidos do modelo (campos concretos)
    model_field_set = {f.name for f in Publication._meta.get_fields() if getattr(f, "concrete", False)}
    create_kwargs = {}
    for k, v in payload.items():
        if k in model_field_set:
            try:
                field_obj = Publication._meta.get_field(k)
                if field_obj.get_internal_type() == "DateField" and isinstance(v, str):
                    try:
                        create_kwargs[k] = date.fromisoformat(v)
                    except Exception:
                        create_kwargs[k] = None
                else:
                    create_kwargs[k] = v
            except Exception:
                create_kwargs[k] = v

    try:
        # Tenta criar via ORM (sem FK caso o campo FK não exista no modelo)
        livro = Publication.objects.create(**create_kwargs)
        print("Publication criado via ORM (sem atribuir FK do usuário).")
        saved = True
        # se modelo tiver campo FK detectado, associa:
        if author_field_name:
            try:
                setattr(livro, author_field_name, user)
                livro.save(update_fields=[author_field_name])
                print(f"FK do usuário atribuída no campo '{author_field_name}'.")
            except Exception as e:
                print(f"Falha ao atribuir FK no campo '{author_field_name}':", e)
    except IntegrityError as e:
        print("IntegrityError ao criar Publication via ORM:", e)
    except TypeError as e:
        print("TypeError ao criar Publication via ORM (campos inválidos?):", e)
    except Exception as e:
        print("Erro inesperado ao criar Publication via ORM:", e)

# Se não salvou ainda, fazemos INSERT SQL forçado incluindo author_id
if not saved:
    print("\nTentando INSERT SQL direto (insere author_id para satisfazer NOT NULL no DB)...")
    # prepara valores
    pub_date = None
    try:
        pub_date = date.fromisoformat(payload["book_publication_date"])
    except Exception:
        pub_date = None

    now = timezone.now()
    table = "Aplicativo_publication"  # nome da tabela, conforme seu DB
    sql = f"""
    INSERT INTO {table}
    (book_title, book_author, book_publisher, book_publication_date, book_description,
     post_location_city, post_description, created_at, author_id)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        payload.get("book_title"),
        payload.get("book_author"),
        payload.get("book_publisher"),
        pub_date,
        payload.get("book_description"),
        payload.get("post_location_city"),
        payload.get("post_description"),
        now,
        user.id
    )

    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
        print("INSERT SQL executado com sucesso — registro adicionado no DB (com author_id).")
    except Exception as e:
        print("Falha ao executar INSERT SQL direto:", e)

# ---------- 3) Ler e imprimir o registro (se existir) ----------
from django.db import connection as _conn  # só para garantir que transação foi commitada (dependendo do backend)
# buscar por título
livro = Publication.objects.filter(book_title=payload["book_title"]).first()
if not livro:
    print("\nNenhum registro encontrado com esse título (provavelmente não foi salvo).")
else:
    print("\nSalvo no banco de livro:")
    print("ID:", livro.id)
    def safe_get(attr):
        return getattr(livro, attr, None)
    print("book_author:", safe_get("book_author"))
    if author_field_name:
        fk = getattr(livro, author_field_name, None)
        username = getattr(fk, "username", None) if fk else None
        print(f"FK ({author_field_name}) username:", username)
    else:
        # modelo não possui campo FK; não conseguimos mostrar FK via ORM
        print("Observação: o modelo Publication não define um campo FK para User — o DB pode ter a coluna author_id, mas o modelo atual não expõe ela.")
    print("titulo:", safe_get("book_title"))
    print("editor(a):", safe_get("book_publisher"))
    print("descrição do livro:", safe_get("book_description"))
    print("dat de publicação:", safe_get("book_publication_date"))
    print("local de postagem:", safe_get("post_location_city"))
    print("descrição da postagem:", safe_get("post_description"))
    print("created_at:", safe_get("created_at"))
