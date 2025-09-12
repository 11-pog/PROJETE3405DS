from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser

from django.conf import settings

# Create your models here.

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
    
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True) # Fotinha de perfil
    age = models.PositiveIntegerField(blank=True, null=True)
    favorite_genres = models.JSONField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.username


# Modelo de banco de dados de Postagem/Publicação
class Publication(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='publications',
        verbose_name= "Post Author",
        blank=True, null=True
    )
    # Dica: Aparentemente, feito desse jeito, se você, em um objeto de usuario, escrever:
    # [objeto do usuario].publications.all()
    # Você consegue pegar todos post feito por esse usuário.
    # Suponho q tenham mais funções alem de .all(), mais mesmo assim é legal isso e vai facilitar bastante
    
    # Book stuff
    book_title = models.CharField(max_length=255, verbose_name= "Book Title")
    book_author = models.CharField(max_length=255, verbose_name= "Book Author", blank=True, null=True)
    book_publisher = models.CharField(max_length=255, verbose_name= "Book Publisher", blank= True)
    book_publication_date = models.DateField(blank=True, null=True, verbose_name="Book Publication Year")
    book_description = models.TextField(blank=True, null=True, verbose_name= "Book Description")
    
    # Post Stuff
    post_thumbnail = models.ImageField(upload_to='thumbnails/', null=True, verbose_name= "Post Thumbnail")
    post_location_city   = models.CharField(max_length=100, verbose_name= "Post City")
    post_description = models.TextField(blank=True, null=True, verbose_name= "Post Description")
    
    tags = models.JSONField(blank=True, null=True)  # Store genre tags, themes
    isbn = models.CharField(max_length=20, blank=True, null=True)
    language = models.CharField(max_length=30, blank=True, null=True)
    full_text_excerpt = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Post Creation Date")
    
    def __str__(self):
        return self.book_title


class Interaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    
    book_rating = models.IntegerField(blank=True, null=True)  # optional
    
    is_liked = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    
    messaged_author = models.BooleanField(default=False)
    verified_trade = models.BooleanField(default=False)
    
    last_viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'publication')
