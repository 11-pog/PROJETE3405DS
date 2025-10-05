from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication
from Aplicativo.ml.clustering import cluster_publications, cluster_users
from sklearn.cluster import KMeans
import numpy as np

User = get_user_model()

class Command(BaseCommand):
    help = "calculates publications and user's clusters for recsys"
    def add_arguments(self, parser):
        parser.add_argument(
            '-u',
            '--users',
            dest='users',
            action='store_true',
            help='Delete fake users'
        )
        
        parser.add_argument(
            '-p',
            '--pubs',
            '--publications',
            dest='pubs',
            action='store_true',
            help='Delete fake publications'
        )
    
    def handle(self, *args, **options):
        if options['pubs']:
            cluster_publications(stdout=self.stdout)
        
        if options['users']:
            cluster_users(stdout=self.stdout)
