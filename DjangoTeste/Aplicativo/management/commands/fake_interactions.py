import random
from django.core.management.base import BaseCommand
from faker import Faker
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication, Interaction
from django.utils import timezone

fake = Faker()
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
        num_interactions = num_publications * 5  # ~5 per pub
        interactions = []

        all_pubs = list(Publication.objects.all())

        for _ in range(num_interactions):
            user = random.choice(users)
            pub = random.choice(all_pubs)
            
            # avoid duplicates
            if Interaction.objects.filter(user=user, publication=pub).exists():
                continue
            
            interaction = Interaction(
                user=user,
                publication=pub,
                book_rating=random.choice([None, random.randint(1, 5)]),  # sometimes None
                view_count=random.randint(1, 10),
                is_saved=random.choice([True, False]),
                messaged_author=random.choice([True, False, False]),  # bias to rare
                verified_trade=random.choice([True, False, False, False]),  # rarer
                last_viewed_at=timezone.now(),
            )
            interactions.append(interaction)

        # Bulk insert for speed
        Interaction.objects.bulk_create(interactions, ignore_conflicts=True)

        self.stdout.write(self.style.SUCCESS(f"Created {len(interactions)} interactions"))