import requests

from django.test import TestCase
from django.test import Client
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from rest_framework import status
from .models import *


class StudentRegisterTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.university = University.objects.create(name="Test University")

    def test_student_register_success(self):
        data = {
            "fullName": "John Doe",
            "email": "john@example.com",
            "password": "testpassword",
            "university": "Test University",
        }
        response = self.client.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="john@example.com").exists())
        user = User.objects.get(email="john@example.com")
        self.assertEqual(user.university.name, "Test University")
        self.assertEqual(user.name, "John Doe")

    def test_student_already_exists(self):
        User.objects.create_user(email="john@example.com", password="testpassword")
        data = {
            "fullName": "Jane Doe",
            "email": "john@example.com",
            "password": "testpassword",
            "university": "Test University",
        }
        response = self.client.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, "Student already exists")


class UniversityRegisterTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_university_register_success(self):
        data = {
            "email": "test@example.com",
            "password": "testpassword",
            "universityName": "Test University",
        }
        response = self.client.post('/register/university', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(University.objects.filter(name="Test University").exists())
        self.assertTrue(User.objects.filter(email="test@example.com").exists())
        user = User.objects.get(email="test@example.com")
        self.assertEqual(user.university.name, "Test University")
        self.assertTrue(user.is_university)

    def test_university_already_exists(self):
        # Create a university with the same name as in the previous test
        University.objects.create(name="Test University")
        data = {
            "email": "test@example.com",
            "password": "testpassword",
            "universityName": "Test University",
        }
        response = self.client.post('/register/university', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, "University already exists")


class OrganizationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='test@example.com', password='password')
        self.new_user = User.objects.get(email = 'test@example.com')
        self.token = Token.objects.create(user=self.new_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        University.objects.create(name="Test University")
        self.new_uni = University.objects.get(name = "Test University")
        self.new_user.university = self.new_uni
        self.new_user.save()

    def test_create_organization_success(self):
        data = {
            "organization": "Test Organization",
        }
        response = self.client.post('/create/org/request', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Organization.objects.filter(name="Test Organization").exists())
        role = Role.objects.get(user=self.new_user, organization__name="Test Organization")
        self.assertTrue(role.is_admin)
    
    def test_delete_organization_success(self):
        organization = Organization.objects.create(name="Test Org", university = self.new_uni)
        new_org = Organization.objects.get(name='Test Org')
        url = '/delete/org'
        data = {'org_id': new_org.id}
        response = self.client.delete(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Organization.objects.filter(id=new_org.id).exists())

    def test_join_org_success(self):
        org = Organization.objects.create(name='Test Organization', university = self.new_uni)
        new_org = Organization.objects.get(name = 'Test Organization')
        url = '/join/org'
        data = {'organization': 'Test Organization'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Role.objects.filter(user=self.new_user, organization=new_org).exists(), True)

class EventCreateTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='testuser@gmail.com', password='testpassword')
        self.new_user = User.objects.get(email='testuser@gmail.com')
        University.objects.create(name="Test University")
        self.new_uni = University.objects.get(name = "Test University")
        self.new_user.university = self.new_uni
        self.new_user.save()
        self.token = Token.objects.create(user=self.new_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.plot = Plot.objects.create(name='Test Plot', university=self.new_uni)
        self.new_plot = Plot.objects.get(name = 'Test Plot')
        self.valid_payload = {
            'event_name': 'Test Event',
            'event_date': '2024-04-27T12:00:00',
            'plot_id': self.new_plot.id,
        }
    
    def test_create_event_success(self):
        url = '/create/event'
        response = self.client.post(url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Event.objects.count(), 1)
        event = Event.objects.get()
        self.assertEqual(event.name, 'Test Event')
    
    def test_delete_event_success(self):
        event = Event.objects.create(name='Test Event', plot=self.new_plot, university=self.new_uni)
        new_event = Event.objects.get(name='Test Event')
        url = f'/delete/event?event_id={new_event.id}'  # Construct URL with event_id query parameter
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Event.objects.count(), 0)
    
class EventRegisterTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='testuser@gmail.com', password='testpassword')
        self.new_user = User.objects.get(email='testuser@gmail.com')
        University.objects.create(name="Test University")
        self.new_uni = University.objects.get(name = "Test University")
        self.new_user.university = self.new_uni
        self.new_user.save()
        self.token = Token.objects.create(user=self.new_user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.organization = Organization.objects.create(name='Test Organization', university = self.new_uni)
        self.new_organization = Organization.objects.get(name='Test Organization', university = self.new_uni)
        self.plot = Plot.objects.create(name='Test Plot', university=self.new_uni)
        self.new_plot = Plot.objects.get(name = 'Test Plot')
        self.event = Event.objects.create(name='Test Event', university=self.new_uni, plot = self.new_plot)
        self.new_event = Event.objects.get(name='Test Event', university=self.new_uni, plot = self.new_plot)



    def test_org_register_event(self):
        data = {
            'event_id': self.new_event.id,
            'org_id': self.new_organization.id,
        }

        response = self.client.post('/event/org/register', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.assertTrue(OrgRegisteredEvent.objects.filter(organization=self.new_organization, event=self.new_event).exists())
    
    def test_student_register_event(self):
        add_membership = Role.objects.create(organization = self.new_organization, user = self.new_user)
        register_for_event = OrgRegisteredEvent(organization = self.new_organization, event=self.new_event)
        register_for_event.save()
        data = {
            'event_id': self.new_event.id,
            'org_id': self.new_organization.id,
        }

        response = self.client.post('/event/student/register', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        