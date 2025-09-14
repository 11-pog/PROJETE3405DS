import os
import shutil
from django.apps import AppConfig
from django.conf import settings


class AplicativoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Aplicativo'
    
    
    def ready(self): # Automaticamente copia a imagem icone padrão de static para media/defaults
        media_defaults = os.path.join(settings.MEDIA_ROOT, 'defaults')
        os.makedirs(media_defaults, exist_ok=True)
        default_media_image = os.path.join(media_defaults, 'default_user.png')
        
        if not os.path.exists(default_media_image):
            static_image = os.path.join(settings.BASE_DIR, 'static', 'img', 'default_user.png')
            if os.path.exists(static_image):
                shutil.copy(static_image, default_media_image)
            else:
                print("⚠️ Warning: static default_user.png missing!")
