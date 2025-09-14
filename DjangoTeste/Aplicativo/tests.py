from django.test import TestCase
from .models.user import phone_regex_pattern


class TelefoneRegetTest(TestCase):
    def testRegex(self):
        self.assertRegex("+2349234999", expected_regex=phone_regex_pattern)