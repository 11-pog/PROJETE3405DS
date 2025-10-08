from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.apps import apps
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SiteTeste.settings')

# THIS LINE IS CRUCIAL
django.setup()

app = Celery('SiteTeste')

app.config_from_object('django.conf:settings', namespace='CELERY')

installed_apps = [app_config.name for app_config in apps.get_app_configs()]
app.autodiscover_tasks(lambda: installed_apps, force=True)

# amanha tentar voltar pra brincadeirinha do python 12 pq aparentemente 13 dá conflito lmfao


