from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/publications/$', consumers.PublicationConsumer.as_asgi()),
    re_path(r'ws/private/(?P<user1>\w+)/(?P<user2>\w+)/$', consumers.PrivateChatConsumer.as_asgi()),
    re_path(r'ws/online/(?P<username>\w+)/$', consumers.OnlineStatusConsumer.as_asgi()),
]