from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser , PermissionsMixin, BaseUserManager

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


# Modelo de usuario pro banco de dados porque o padrão do django não tem numero de telefone
# Os outro campos como nome, senha, email, etc, são derivados de AbstractUser, então não é necessário implementa-los denovo
class Usuario(AbstractUser): 
    # email, username, password, is_active, is_staff, first_name, last_name
    # todos esses já existem nesse modelo por causa da heranca de AbstractUser
    # não tem porque adicionar denovo, muito pelo contrario, isso pode quebrar migrações
    
    # nesse caso aqui, é preciso SOBRESCREVER os campos anteriores para mudar alguns parametros
    username = models.CharField(max_length=150, unique=False)
    email = models.EmailField(unique=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    # não precisa de numero de telefone por enquanto (o proprio aplicativo vai ter chat)
    
    profile_picture = models.ImageField(
        upload_to='profiles/',
        default='defaults/default_user.png',  # default inside media
    )
    city = models.CharField(max_length=100, blank=True, null=True)
    points = models.IntegerField(default=0)  
    
    def get_care_rating_average(self):
        from .publication_models import BookCareRating, Loan
        ratings = BookCareRating.objects.filter(loan__borrower=self)
        if ratings.exists():
            return round(ratings.aggregate(models.Avg('care_rating'))['care_rating__avg'], 2)
        return None
    
    def get_total_loans_count(self):
        from .publication_models import Loan
        return Loan.objects.filter(borrower=self).count()
    
    def get_completed_loans_count(self):
        from .publication_models import Loan
        return Loan.objects.filter(borrower=self, status='completed').count()
    
    def __str__(self):
        return self.email
