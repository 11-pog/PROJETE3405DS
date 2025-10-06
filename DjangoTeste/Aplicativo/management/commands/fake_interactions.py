from itertools import product
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication, Interaction

User = get_user_model()

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            'interactions',   # no dashes → positional
            type=int,
            nargs='?',        # makes it optional
            default=50,       # fallback if user gives nothing
            help='Number of fake interactions to create'
        )
    
    def handle(self, *args, **options):
        num_interactions = options['interactions']
        
        self.stdout.write(self.style.SUCCESS(f"Creating {num_interactions} fake interactions..."))
        
        users = User.objects.all().filter(is_fake = True)
        pubs = Publication.objects.all().filter()
        
        self.stdout.write(f"Found {len(users)} fake users and {len(pubs)} publications")
        
        if num_interactions > (len(users)*len(pubs)):
            raise ValueError("Amount of interactions cannot be bigger than the number of unique combinations between posts and fake users")
        
        all_pairs = list(product(users, pubs))
        
        # Shuffle & cut down to desired number
        random.shuffle(all_pairs)
        selected_pairs = all_pairs[:num_interactions]
        
        self.stdout.write("Generating interactions...")
        
        interactions = []
        for user, pub in selected_pairs:
            interaction = Interaction(
                user=user,
                publication=pub,
                book_rating=random.choice([None, random.randint(1, 5)]),
                view_count=random.randint(1, 10),
                is_saved = random.choices([True, False], weights=[0.05, 0.95], k=1)[0],
                messaged_author = random.choices([True, False], weights=[0.03, 0.97], k=1)[0],
                verified_trade = random.choices([True, False], weights=[0.01, 0.99], k=1)[0]
            )
            interactions.append(interaction)
        
        self.stdout.write("Saving interactions to database...")
        
        Interaction.objects.bulk_create(interactions, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(f"Created {len(interactions)} interactions"))
