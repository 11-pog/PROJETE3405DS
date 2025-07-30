from django.test import TestCase
from .models import Usuario, phone_regex_pattern


class TelefoneRegetTest(TestCase):
    def testRegex(self):
        self.assertRegex("+2349234999", expected_regex=phone_regex_pattern)