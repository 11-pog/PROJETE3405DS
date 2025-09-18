from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/publications/$', consumers.LivrosConsumer.as_asgi()),
]
