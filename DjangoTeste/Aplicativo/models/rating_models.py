from django.db import models
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class UserRating(models.Model):
    # Quem está sendo avaliado
    rated_user = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='received_ratings')
    # Quem está avaliando
    rater = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='given_ratings')
    
    # Avaliações separadas
    person_rating = models.IntegerField()  # 1-5 estrelas para avaliar a pessoa
    book_care_rating = models.IntegerField()  # 1-5 estrelas para cuidado com livro
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['rated_user', 'rater']  # Cada pessoa só pode avaliar outra uma vez
    
    def __str__(self):
        return f"{self.rater.username} avaliou {self.rated_user.username}"

class UserStats(models.Model):
    user = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='stats')
    
    # Estatísticas de avaliação da pessoa
    total_person_rating = models.IntegerField(default=0)
    person_rating_count = models.IntegerField(default=0)
    
    # Estatísticas de cuidado com livro
    total_book_care_rating = models.IntegerField(default=0)
    book_care_rating_count = models.IntegerField(default=0)
    
    def get_person_average(self):
        if self.person_rating_count > 0:
            return round(self.total_person_rating / self.person_rating_count, 2)
        return 0
    
    def get_book_care_average(self):
        if self.book_care_rating_count > 0:
            return round(self.total_book_care_rating / self.book_care_rating_count, 2)
        return 0
    
    def __str__(self):
        return f"Stats de {self.user.username}"