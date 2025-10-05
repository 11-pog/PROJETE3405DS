import random
from django.core.management.base import BaseCommand
from faker import Faker
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication

fake = Faker()
User = get_user_model()

class Command(BaseCommand):
    help = "Populate the DB with fake users and publications"
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            '-u',
            type=int,
            default=0,
            help='Number of fake users to create'
        )
        
        parser.add_argument(
            '--publications',
            '--pubs',
            '-p',
            type=int,
            default=0,
            help='Number of fake publications to create'
        )
    
    
    def handle(self, *args, **options):
        num_users = options['users']
        num_publications = options['publications']
        
        self.stdout.write(self.style.NOTICE(f"Creating {num_users} users and {num_publications} publications..."))
        
        if num_users > 0:
            self.create_users(num_users)
        
        if num_publications > 0:
            pubs = self.create_publications(num_publications)
            Publication.objects.bulk_create(pubs)
        
        self.stdout.write(self.style.SUCCESS("FAKE DB POPULATION COMPLETE!"))
    
    
    def create_users(self, num_users):
        for _ in range(num_users):
            username = fake.user_name()
            email = fake.email()
            password = "testpassword123"
            
            user, created = User.objects.get_or_create(
                email = email,
                defaults={
                    'username': username,
                    'is_fake': True,
                    }
                )
            
            if created:
                user.set_password(password)
                user.save()
            
            self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
    
    
    def create_publications(self, num_publications):
        users = list(User.objects.filter(is_fake = True))
        
        pubs = []
        for _ in range(num_publications):
            creator = random.choice(users)
            pub = Publication(
                post_creator=creator,
                book_title=fake.sentence(nb_words=4),
                book_author=fake.name(),
                book_publisher=fake.company(),
                book_publication_date=fake.date_between(start_date="-20y", end_date="today"),
                book_description=fake.paragraph(nb_sentences=3),
                post_location_city=fake.city(),
                post_description=fake.text(max_nb_chars=200),
                post_type=random.choice([type[0] for type in Publication.PostType.choices]),
                book_rating=random.randint(0, 5),
                book_genre=random.choice(
                    [genre[0] for genre in Publication.BookGenre.choices]
                ),
                isbn=fake.isbn13(separator="-"),
                is_fake=True,
                language=random.choice(["English", "Portuguese", "Spanish", "German"]),
            )
            pubs.append(pub)
            self.stdout.write(self.style.SUCCESS(f"Created publication: {pub.book_title}"))
        
        return pubs
