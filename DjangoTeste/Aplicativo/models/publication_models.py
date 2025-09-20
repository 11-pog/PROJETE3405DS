from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator




# Modelo de banco de dados de Postagem/Publicação
class Publication(models.Model):
    class PostType(models.TextChoices):
        EMPRESTIMO = "emprestimo", "Empréstimo"
        TROCA = "troca", "Troca"
    
    post_type = models.CharField(
        max_length=10,
        choices=PostType.choices,
        default=PostType.EMPRESTIMO
        )
    
    post_creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='publications',
        verbose_name= "Post Author",
        null=True
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
    post_cover = models.ImageField(
        upload_to='thumbnails/',
        default='defaults/default_thumbnail.png'
        )
    post_location_city   = models.CharField(max_length=100, verbose_name= "Post City")
    post_description = models.TextField(blank=True, null=True, verbose_name= "Post Description")
    
    
    book_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(5),],
        default=3
    )
    
    tags = models.JSONField(blank=True, null=True) # Store genre tags, themes
    isbn = models.CharField(max_length=15, blank=True, null=True)
    language = models.CharField(max_length=30, blank=True, null=True)
    full_text_excerpt = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Post Creation Date")
    
    def __str__(self):
        return self.book_title


class Interaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='interactions')
    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name='interactions')
    
    book_rating = models.IntegerField(blank=True, null=True) # optional
    view_count = models.PositiveIntegerField(default=0)

    is_saved = models.BooleanField(default=False)
    saved_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    
    messaged_author = models.BooleanField(default=False)
    verified_trade = models.BooleanField(default=False)
    last_viewed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'publication')