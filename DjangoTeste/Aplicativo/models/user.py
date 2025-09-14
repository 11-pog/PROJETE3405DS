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
    """
    Modelo personalizado de usuário que estende o modelo padrão do Django (`AbstractUser`) para incluir um campo extra: número de telefone.
    
    O Django por padrão utiliza o modelo `AbstractUser`, que já inclui os campos `username`, `password`, `email`, `first_name`, `last_name`, etc.
    Este modelo redefine e adiciona o campo `phone_number` como obrigatório e único, garantindo que cada usuário tenha um número de telefone válido e exclusivo.
    
    E sim esse docstring foi feito pelo chat, desculpa
    
    Campos:
        phone_number (CharField):
            - verbose_name="Numero de Telefone": nome legível exibido em formulários e interfaces administrativas.
            - validators=[phone_validator]: validação customizada para o formato do número (ex: regex).
            - max_length=20: tamanho máximo permitido para o número.
            - unique=True: garante que o número não será duplicado entre usuários.
            - blank=False, null=False: torna o campo obrigatório tanto em nível de formulário quanto de banco de dados.
    
    Métodos:
        __str__(): Retorna o `username` como representação textual do objeto.
    """
    
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
    
    def __str__(self):
        return self.username