from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User
from django.conf import settings


class ChatGroup(models.Model):
    group_name = models.CharField(max_length=128,unique=True)

    def __str__(self):
        return self.group_name


class ChatMessage(models.Model):
    group = models.ForeignKey(ChatGroup, related_name='chat_messages', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) # mudei aqui pq tava dando erro no user
    body = models.CharField(max_length=300)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} : {self.body}'
    
    class Meta:
        ordering = ('created')