from django.contrib import admin
from .models.user import UserManager 
from .models.chat import ChatGroup, ChatMessage    

admin.site.register(ChatGroup)
admin.site.register(ChatMessage)