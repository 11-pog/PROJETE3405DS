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
        
        static_images_dir = os.path.join(settings.BASE_DIR, 'static', 'img')
        
        if not os.path.exists(static_images_dir):
            print("Warning: static/img folder missing!")
            return
        
        for image_file in os.listdir(static_images_dir):
            if image_file.startswith('default_'):
                source_path = os.path.join(static_images_dir, image_file)
                dest_path = os.path.join(media_defaults, image_file)
                
                if os.path.exists(source_path):
                    shutil.copy(source_path, dest_path)
                else:
                    print(f"Warning: static {image_file} missing!")
