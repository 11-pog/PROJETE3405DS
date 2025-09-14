from django.contrib import admin
from Aplicativo.models.user import Usuario 
from Aplicativo.models.chat import ChatGroup, ChatMessage    
from django.contrib.auth.admin import UserAdmin

admin.site.register(ChatGroup)
admin.site.register(ChatMessage)

admin.register(Usuario)
class CustomUserAdmin(UserAdmin):
    pass