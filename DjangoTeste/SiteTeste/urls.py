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
from django.urls import path, include

from Aplicativo.views.auth_views import LoginUsuario
from Aplicativo.views.external_api_views import ISBNLookup
from Aplicativo.views.usuario_views import UserView, UploadUserImage
from Aplicativo.views.publication_views import CadastrarLivro, pesquisadelivro, GetBookList, PrivateChat, FavoritePostView, GetFavoriteBooks
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginUsuario.as_view()),
    path('api/login/refresh/', TokenRefreshView.as_view(), name="token refresh"),
    path('api/usuario/', UserView.as_view(), name="usuario"),
    path('api/usuario/mudarfoto/', UploadUserImage.as_view()),
    path('api/usuario/favoritos/', GetFavoriteBooks.as_view()),
    path('api/isbn/', ISBNLookup.as_view(), name="isbn-lookup"),
    path('api/livros/pesquisar/', pesquisadelivro.as_view()),
    path('api/livros/feed/', GetBookList.as_view(), name='listar-livros'),
    path('api/livros/cadastrar/', CadastrarLivro.as_view()),
    path('api/livros/<int:book_id>/favoritar/', FavoritePostView.as_view()),

        # Chat privado
    path('private/<str:user1>/<str:user2>/', PrivateChat.as_view(), name='private_chat'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

