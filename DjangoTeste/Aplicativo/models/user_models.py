from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User
from django.conf import settings


class UserManager(models.Manager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        
        user = self.model(
            username=username,
            email=self.normalize_email(email),
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(
            username=username,
            email=email,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user 

phone_regex_pattern = r'^\+?1?\d{9,15}$'
phone_validator = RegexValidator(regex=phone_regex_pattern, message="Número inválido.") # negocio do chat sla

# Modelo de usuario pro banco de dados porque o padrão do django não tem numero de telefone
# Os outro campos como nome, senha, email, etc, são derivados de AbstractUser, então não é necessário implementa-los denovo
class Usuario(AbstractUser): 
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    email = models.EmailField(unique=True)
    phone_number = models.CharField( # Adiciona o campo numero de telefone
        verbose_name="Numero de Telefone", # O nome que o django vai usar pra mostrar pra nois (o nome legível)
        validators=[phone_validator], # Coiso engraçado q o chat pediu pra fazer
        max_length= 20, # Tamanho maximo
        unique=True, # Faz com que todo numero no banco de dados seja único
        null=True,
        blank=True, 
        )
    
    
    profile_picture = models.ImageField(
        upload_to='profiles/',
        default='defaults/default_user.png',  # default inside media
    )
    age = models.PositiveIntegerField(blank=True, null=True)
    favorite_genres = models.JSONField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.username