from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication
from DjangoTeste.Aplicativo.ml.clustering import cluster_publications, cluster_users
from sklearn.cluster import KMeans
import numpy as np

User = get_user_model()

class Command(BaseCommand):
    help = "calculates publications and user's clusters for recsys"
    
    def handle(self, *args, **options):
        cluster_publications()
        cluster_users()