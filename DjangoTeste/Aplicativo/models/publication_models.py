from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from pgvector.django import VectorField

# Modelo de banco de dados de Postagem/Publicação
class Publication(models.Model):
    class PostType(models.TextChoices):
        EMPRESTIMO = "emprestimo", "Empréstimo"
        TROCA = "troca", "Troca"
    
    class BookGenre(models.TextChoices):
        ROMANCE_NARRATIVA = "romance_narrativa", "Romance/Narrativa"
        POESIA = "poesia", "Poesia"
        PECA_TEATRAL = "peca_teatral", "Peça Teatral"
        DIDATICO = "didatico", "Didático"
        NAO_FICCAO = "nao_ficcao", "Não-ficção"
    
    post_type = models.CharField(
        max_length=10,
        choices=PostType.choices,
        default=PostType.EMPRESTIMO
        )
    
    post_creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='publications',
        verbose_name= "Post Author"
    )
    
    cluster_label = models.IntegerField(null=True, blank=True)
    
    # Dica: Aparentemente, feito desse jeito, se você, em um objeto de usuario, escrever:
    # [objeto do usuario].publications.all()
    # Você consegue pegar todos post feito por esse usuário.
    # Suponho q tenham mais funções alem de .all(), mais mesmo assim é legal isso e vai facilitar bastante
    
    # Book stuff
    book_title = models.CharField(max_length=255, verbose_name= "Book Title")
    book_author = models.CharField(max_length=255, verbose_name= "Book Author", blank=True, null=True)
    book_publisher = models.CharField(max_length=255, verbose_name= "Book Publisher", blank=True, null=True)
    book_publication_date = models.DateField(blank=True, null=True, verbose_name="Book Publication Year")
    book_description = models.TextField(blank=True, null=True, verbose_name= "Book Description")
    book_genre = models.CharField(
        max_length=20,
        choices=BookGenre.choices,
        blank=True,
        null=True,
        verbose_name="Gênero do Livro"
    )
    
    
    post_cover = models.ImageField(
        upload_to='livros/',
        null=True,
        blank=True,
        default='defaults/default_thumbnail.png'
        )
    post_location_city = models.CharField(max_length=100, blank=True, null=True, verbose_name="Post City")
    post_description = models.TextField(blank=True, null=True, verbose_name= "Post Description")
    
    
    book_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(5),],
        default=3
    )
    
    is_fake = models.BooleanField(default=False) # determina se a postagem é verdadeira ou foi criada pelo comando
    
    tags = models.JSONField(blank=True, null=True) # Store genre tags, themes
    isbn = models.CharField(max_length=15, blank=True, null=True)
    language = models.CharField(max_length=30, blank=True, null=True)
    full_text_excerpt = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Post Creation Date")
    
    embedding_size = 5 + len(PostType) + len(BookGenre) + 384
    embedding = VectorField(dimensions=embedding_size, null = True, blank= True)
    
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
    view_count = models.PositiveIntegerField(default=1)
    
    is_saved = models.BooleanField(default=False)
    saved_at = models.DateTimeField(null=True, blank=True)
    
    messaged_author = models.BooleanField(default=False)
    verified_trade = models.BooleanField(default=False)
    last_viewed_at = models.DateTimeField(auto_now=True)
    
    def save(self, force_insert = False, force_update = False, using = None, update_fields = None):
        if self.is_saved and not self.saved_at:
            self.saved_at = timezone.now()
        
        elif not self.is_saved:
            self.saved_at = None
        
        return super().save(force_insert, force_update, using, update_fields)
    
    class Meta:
        unique_together = ('user', 'publication')

class Loan(models.Model):
    class LoanStatus(models.TextChoices):
        PENDING = "pending", "Pendente"
        ACTIVE = "active", "Ativo"
        COMPLETED = "completed", "Finalizado"
        OVERDUE = "overdue", "Atrasado"
        CANCELLED = "cancelled", "Cancelado"
    
    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name='loans'
    )
    lender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lent_books',
        verbose_name="Quem emprestou"
    )
    borrower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='borrowed_books',
        verbose_name="Quem pegou emprestado"
    )
    
    start_date = models.DateTimeField(auto_now_add=True)
    expected_return_date = models.DateField()
    actual_return_date = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(
        max_length=10,
        choices=LoanStatus.choices,
        default=LoanStatus.PENDING
    )
    
    notes = models.TextField(blank=True, null=True, verbose_name="Observações")
    
    def __str__(self):
        return f"{self.publication.book_title} - {self.borrower.username}"
    
    class Meta:
        ordering = ['-start_date']



