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
from Aplicativo.views.usuario_views import CadastrarUsuario, EditarUsuario, GetUser, UploadUserImage
from Aplicativo.views.publication_views import CadastrarLivro, pesquisadelivro, GetBookList
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginUsuario.as_view()),
    path('api/login/refresh/', TokenRefreshView.as_view(), name="token refresh"),
    path('api/cadastrar/', CadastrarUsuario.as_view(), name="cadastrar_usuario"),
    path('api/editar/', EditarUsuario.as_view(), name="editar_usuario"),
    path('api/usuario/', GetUser.as_view()),
    path('api/usuario/mudarfoto/', UploadUserImage.as_view()),
    path('api/cadastrarlivro/', CadastrarLivro.as_view()), #o url tem que alterar o nome ou utilzar este mesmo
    
    # tava mesmo nome do anterior, mudei pra isbn
    path('api/isbn/', ISBNLookup.as_view(), name="isbn-lookup"),
    
    path('api/pesquisa/', pesquisadelivro.as_view()),
    path('api/livros/', GetBookList.as_view(), name='listar_livros'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

