"""from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SiteTeste.settings')

app = Celery('SiteTeste')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

# amanha tentar voltar pra brincadeirinha do python 12 pq aparentemente 13 dá conflito lmfao

@app.task(bind=True)
def debug_task(self): # Teste
    print(f'Teste: {self.request!r}')"""
