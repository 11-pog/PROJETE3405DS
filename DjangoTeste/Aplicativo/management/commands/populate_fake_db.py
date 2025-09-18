import random
from django.core.management.base import BaseCommand
from faker import Faker
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication, PostType

fake = Faker()
User = get_user_model()

class Command(BaseCommand):
    help = "Populate the DB with fake users and publications"

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of fake users to create'
        )
        parser.add_argument(
            '--publications',
            type=int,
            default=50,
            help='Number of fake publications to create'
        )


    def handle(self, *args, **options):
        num_users = options['users']
        num_publications = options['publications']
        
        self.stdout.write(self.style.NOTICE(f"Creating {num_users} users and {num_publications} publications..."))
        
        # --- Create users ---
        users = []
        for _ in range(num_users):
            username = fake.user_name()
            email = fake.email()
            password = "testpassword123"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email}
            )
            if created:
                user.set_password(password)
                user.save()
            users.append(user)
            self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))

        # --- Create publications ---
        for _ in range(num_publications):
            creator = random.choice(users)
            pub = Publication.objects.create(
                post_creator=creator,
                book_title=fake.sentence(nb_words=4),
                book_author=fake.name(),
                book_publisher=fake.company(),
                book_publication_date=fake.date_between(start_date="-20y", end_date="today"),
                book_description=fake.paragraph(nb_sentences=3),
                post_location_city=fake.city(),
                post_description=fake.text(max_nb_chars=200),
                post_type=random.choice([PostType.EMPRESTIMO, PostType.TROCA]),
                book_rating=random.randint(0, 5),
                tags=random.sample(
                    ["fantasy", "mystery", "romance", "sci-fi", "adventure", "horror"],
                    k=random.randint(1, 3)
                ),
                isbn=fake.isbn13(separator="-"),
                language=random.choice(["English", "Portuguese", "Spanish", "German"]),
                full_text_excerpt=fake.paragraph(nb_sentences=5),
            )
            self.stdout.write(self.style.SUCCESS(f"Created publication: {pub.book_title}"))

        self.stdout.write(self.style.SUCCESS("FAKE DB POPULATION COMPLETE!"))
