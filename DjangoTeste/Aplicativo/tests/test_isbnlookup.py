from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class IsbnLookupTest(APITestCase):
    def test_valid_isbn_returns_book_data(self):
        # Arrange: define a sample ISBN
        sample_isbn = "9780140328721"  # pick a real one for testing

        # Act: call the endpoint using Django test client
        url = reverse("isbn-lookup")  # the name of your URL pattern for the view
        response = self.client.get(url, {"isbn": sample_isbn})  # <-- query param!
        print(response.content) 
        
        # Assert: check status code and response keys
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("title", response.data)
        self.assertIn("author", response.data)
        self.assertIn("publisher", response.data)
        self.assertIn("year", response.data)
        self.assertIn("description", response.data)

    def test_invalid_isbn_returns_error(self):
        invalid_isbn = "0000000000000"

        url = reverse("isbn-lookup")
        response = self.client.get(url, {"isbn": invalid_isbn})
        print(response.content)  
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)
