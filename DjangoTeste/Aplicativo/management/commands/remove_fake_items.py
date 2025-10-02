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
            help='Include fake users'
        )
        
        parser.add_argument(
            '-p',
            '--pubs',
            '--publications',
            dest='pubs',
            action='store_true',
            help='Include fake publications'
        )
    
    def handle(self, *args, **options):
        del_pub = options['pubs']
        del_user = options['users']
        
        if not (del_pub or del_user):
            raise CommandError("Please specify --users (-u) or --publications (-p), keep in mind that deleting fake users will cascade into deleting fake publications as well")
        
        if del_user:
            self.delete_fake(User)
            self.stdout.write(self.style.SUCCESS(f"Django automatically deletes all fake posts as well"))
            return
        
        if del_pub:
            self.delete_fake(Publication)
    
    
    def delete_fake(self, model):
        deleted, _ = model.objects.filter(is_fake=True).delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} fake {model.__name__}"))
