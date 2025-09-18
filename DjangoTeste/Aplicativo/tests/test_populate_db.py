from django.test import TestCase
from django.core.management import call_command

from faker import Faker
from django.contrib.auth import get_user_model
from Aplicativo.models.publication_models import Publication, PostType



fake = Faker()
User = get_user_model()


class PopulateDBTestCase(TestCase):
    def setUp(self):
        # Call thy management command as part of setup
        call_command('populate_fake_db', publications=25)
    
    def test_publications_created(self):
        count = Publication.objects.count()
        print(f"Total publications in test DB: {count}")
        self.assertTrue(count == 25)
