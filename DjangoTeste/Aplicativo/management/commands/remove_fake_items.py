from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication, Interaction

User = get_user_model()

class Command(BaseCommand):
    help = "Delete fake users and/or publications"
    
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
        
        parser.add_argument(
            '-i',
            '--interactions',
            dest='interactions',
            action='store_true',
            help='Delete fake interactions'
        )
    
    def handle(self, *args, **options):
        del_pub = options['pubs']
        del_user = options['users']
        del_inter = options['interactions']
        
        if not (del_pub or del_user or del_inter):
            raise CommandError("Please specify --users (-u), --publications (-p), or --interactions (-i). Note: deleting fake users will also delete their fake publications and interactions.")
        
        if del_user:
            self.delete_fake(User)
            self.stdout.write(self.style.SUCCESS(f"Django automatically deletes all fake posts and interactions as well"))
            return
        
        if del_pub:
            self.delete_fake(Publication)
        
        if del_inter:
            deleted, _ = Interaction.objects.filter(user__is_fake=True).delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} fake Interactions"))
    
    
    def delete_fake(self, model):
        deleted, _ = model.objects.filter(is_fake=True).delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} fake {model.__name__}"))
