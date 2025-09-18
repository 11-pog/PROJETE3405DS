from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_view, name='test'),
    path('websocket-test/', views.websocket_test, name='websocket_test'),
]