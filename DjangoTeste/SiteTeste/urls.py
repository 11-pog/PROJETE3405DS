"""
URL configuration for SiteTeste project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.urls import path
from Aplicativo.views.delete_views import PublicationDeleteView

from Aplicativo.views.auth_views import LoginUsuario
from Aplicativo.views.external_api_views import ISBNLookup
from Aplicativo.views.usuario_views import UserView, UploadUserImage, ListUsers, SearchUser
from Aplicativo.views.publication_views import (
    CadastrarLivro,
    pesquisadelivro,
    GetBookList,
    FavoritePostView,
    GetFavoriteBooks,
    BookDetailView,
    GetMinhasPublicacoes,  
)
from Aplicativo.views.usuario_views import UserView, UploadUserImage
from Aplicativo.views.chat_views import PrivateChat
from Aplicativo.views.usuario_views import CreateLoan, CompleteLoan, UserProfile, GenerateChatLink
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Autenticação
    path('api/login/', LoginUsuario.as_view(), name="login"),
    path('api/login/refresh/', TokenRefreshView.as_view(), name="token_refresh"),

    # Usuário
    path('api/usuario/', UserView.as_view(), name="usuario"),
    path('api/usuario/mudarfoto/', UploadUserImage.as_view(), name="usuario-mudar-foto"),
    path('api/usuario/favoritos/', GetFavoriteBooks.as_view(), name="usuario-favoritos"),
    path('api/usuarios/', ListUsers.as_view(), name="listar_usuarios"),
    path('api/search/usuarios/', SearchUser.as_view(), name="search_usuarios"),

    # Livros / Publicações
    path('api/livros/feed/', GetBookList.as_view(), name='listar-livros'),
    path('api/livros/cadastrar/', CadastrarLivro.as_view(), name='cadastrar-livro'),
    path('api/livros/<int:book_id>/', BookDetailView.as_view()),
    path('api/livros/<int:book_id>/favoritar/', FavoritePostView.as_view(), name="favoritar-livro"),
    path('api/search/livros/', pesquisadelivro.as_view(), name="pesquisa-livros"),
    path('api/usuario/publicacoes/', GetMinhasPublicacoes.as_view(), name="minhas-publicacoes"),

    # Empréstimos
    path('api/emprestimos/criar/', CreateLoan.as_view(), name='create_loan'),
    path('api/emprestimos/finalizar/', CompleteLoan.as_view(), name='complete_loan'),
    path('api/usuario/<int:user_id>/perfil/', UserProfile.as_view(), name='user_profile'),
    path('api/chat/gerar-link/', GenerateChatLink.as_view(), name='generate_chat_link'),

    # Outros
    path('api/isbn/', ISBNLookup.as_view(), name="isbn-lookup"),
    path('private/<int:user1_id>/<int:user2_id>/', PrivateChat.as_view(), name='private_chat'),
    path("api/usuario/publicacoes/<int:pk>/delete/", PublicationDeleteView, name="publication-delete"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
