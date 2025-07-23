from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser, UserManager

# Create your models here.

phone_validator = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Número inválido.") # negocio do chat sla

# Modelo de usuario pro banco de dados porque o padrão do django não tem numero de telefone
# Os outro campos como nome, senha, email, etc, são derivados de AbstractUser, então não é necessário implementa-los denovo
class Usuario(AbstractUser): 
    """
    Modelo personalizado de usuário que estende o modelo padrão do Django (`AbstractUser`) para incluir um campo extra: número de telefone.

    O Django por padrão utiliza o modelo `AbstractUser`, que já inclui os campos `username`, `password`, `email`, `first_name`, `last_name`, etc.
    Este modelo redefine e adiciona o campo `telefone` como obrigatório e único, garantindo que cada usuário tenha um número de telefone válido e exclusivo.
    
    E sim esse docstring foi feito pelo chat, desculpa

    Campos:
        telefone (CharField):
            - name="phone_number": define o nome da coluna no banco de dados.
            - verbose_name="Numero de Telefone": nome legível exibido em formulários e interfaces administrativas.
            - validators=[phone_validator]: validação customizada para o formato do número (ex: regex).
            - max_length=20: tamanho máximo permitido para o número.
            - unique=True: garante que o número não será duplicado entre usuários.
            - blank=False, null=False: torna o campo obrigatório tanto em nível de formulário quanto de banco de dados.

    Métodos:
        __str__(): Retorna o `username` como representação textual do objeto.
    """

    phone_number = models.CharField( # Adiciona o campo numero de telefone
        verbose_name="Numero de Telefone", # O nome que o django vai usar pra mostrar pra nois (o nome legível)
        validators=[phone_validator], # Coiso engraçado q o chat pediu pra fazer
        max_length= 20, # Tamanho maximo
        unique=True, # Faz com que todo numero no banco de dados seja único
        blank=False, # Esse e o debaixo fazem com que o campo seja obrigatorio no banco de dados (não seja permitido ficar vazio ou nulo)
        null=False
        )
    
    def __str__(self):
        return self.username