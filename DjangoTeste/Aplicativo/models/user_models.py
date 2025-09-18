from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser , PermissionsMixin, BaseUserManager
from django.contrib.auth.models import User
from django.conf import settings

class UserManager(BaseUserManager):
    # criar usuário normal: agora usa email como identificador
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    # criar superuser: aceita email + password + extra_fields
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser precisa ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser precisa ter is_superuser=True.")
        
        return self.create_user(email, password, **extra_fields)


phone_regex_pattern = r'^\+?1?\d{9,15}$'
phone_validator = RegexValidator(regex=phone_regex_pattern, message="Número inválido.") # negocio do chat sla

# Modelo de usuario pro banco de dados porque o padrão do django não tem numero de telefone
# Os outro campos como nome, senha, email, etc, são derivados de AbstractUser, então não é necessário implementa-los denovo
class Usuario(AbstractUser, PermissionsMixin): 
    
    # email = models.EmailField(unique=True)
    # username = models.CharField(max_length=150, blank=True, null=True)  # opcional
    # nome = models.CharField(max_length=150, blank=True, null=True)
    
    # gente pelo amor de deus leiam comentarios de vez em quando
    
    # email, username, password, is_active, is_staff, first_name, last_name
    # todos esses já existem nesse modelo por causa da heranca de AbstractUser
    # não tem porque adicionar denovo, muito pelo contrario, isso pode quebrar migrações
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    email = models.EmailField(unique=True)
    
    # não precisa de numero de telefone por enquanto (o proprio aplicativo vai ter chat)
    
    profile_picture = models.ImageField(
        upload_to='profiles/',
        default='defaults/default_user.png',  # default inside media
    )
    
    def __str__(self):
        return self.email
