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

# Integration testing 
# Scenario 1
# One University is created, Two users are created, 
# User 1 creates an organization
# User 2 joins User 1's organizattion.

class ScenarioOneTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client1 = APIClient()
        self.client2 = APIClient()
    
    def test_Scenario_1(self):
        # Create the university and test for accurate results
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

        #Create User 1 and test for accurate results
        data = {
            "fullName": "John Doe",
            "email": "john@example.com",
            "password": "john",
            "university": "Test University",
        }
        response = self.client1.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="john@example.com").exists())
        john_user = User.objects.get(email="john@example.com")
        self.assertEqual(john_user.university.name, "Test University")
        self.assertEqual(john_user.name, "John Doe")

        #Create User 2 and test for accurate results.
        data = {
            "fullName": "Sasan Lotfi",
            "email": "sasan@example.com",
            "password": "sasan",
            "university": "Test University",
        }
        response = self.client.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="sasan@example.com").exists())
        sasan_user = User.objects.get(email="sasan@example.com")
        self.assertEqual(sasan_user.university.name, "Test University")
        self.assertEqual(sasan_user.name, "Sasan Lotfi")
        #Create token for Sasan
        sasan_token = Token.objects.create(user = sasan_user)
        self.client1.credentials(HTTP_AUTHORIZATION='Token ' + sasan_token.key)

        #Sasan Creates Organization Aggie Coding Club
        data = {
            "organization": "Aggie Coding Club",
        }
        response = self.client1.post('/create/org/request', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Organization.objects.filter(name="Aggie Coding Club").exists())
        role = Role.objects.get(user= sasan_user, organization__name="Aggie Coding Club")
        self.assertTrue(role.is_admin)

        #Create token for john
        john_token = Token.objects.create(user = john_user)
        self.client2.credentials(HTTP_AUTHORIZATION='Token ' + john_token.key)

        #John joins organization Aggie Coding Club
        url = '/join/org'
        data = {'organization': 'Aggie Coding Club'}
        response = self.client2.post(url, data, format='json')
        new_org = Organization.objects.get(name = data['organization'])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Role.objects.filter(user=john_user, organization=new_org).exists(), True)


# Scenario Comprehensive
# One University is created, Five Users are created
# User 1 -> Admin of Aggie Coding Club
# User 2 -> Admin of Aggie Soccer Club
# User 3 -> Joins Aggie Coding Club
# User 4 -> Joins Aggie Coding Club
# User 5 -> Joins Aggie Soccer Club
# University Creates "Test" event
# Coding and Soccer clubs register for that event
# All users register for the event through their organizations
# Call AverageRegistration Time view to check the results
class ScenarioTwoTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client1 = APIClient()
        self.client2 = APIClient()
        self.client3 = APIClient()
        self.client4 = APIClient()
        self.client5 = APIClient()

    def test_Scenario_1(self):
        # Create the university and test for accurate results
        data = {
            "email": "university@example.com",
            "password": "university",
            "universityName": "Test University",
        }
        response = self.client.post('/register/university', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(University.objects.filter(name="Test University").exists())
        self.assertTrue(User.objects.filter(email="university@example.com").exists())
        user = User.objects.get(email="university@example.com")
        self.assertEqual(user.university.name, "Test University")
        self.assertTrue(user.is_university)

        #Create User 1 and test for accurate results
        data = {
            "fullName": "User One",
            "email": "user1@example.com",
            "password": "user1",
            "university": "Test University",
        }
        response = self.client1.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="user1@example.com").exists())
        user1 = User.objects.get(email="user1@example.com")
        self.assertEqual(user1.university.name, "Test University")
        self.assertEqual(user1.name, "User One")

        #Create User 2 and test for accurate results.
        data = {
            "fullName": "User Two",
            "email": "user2@example.com",
            "password": "user2",
            "university": "Test University",
        }
        response = self.client.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="user2@example.com").exists())
        user2 = User.objects.get(email="user2@example.com")
        self.assertEqual(user2.university.name, "Test University")
        self.assertEqual(user2.name, "User Two")

        #Create User 3 and test for accurate results.
        data = {
            "fullName": "User Three",
            "email": "user3@example.com",
            "password": "user3",
            "university": "Test University",
        }
        response = self.client.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="user3@example.com").exists())
        user3 = User.objects.get(email="user3@example.com")
        self.assertEqual(user3.university.name, "Test University")
        self.assertEqual(user3.name, "User Three")

        #Create User 4 and test for accurate results.
        data = {
            "fullName": "User Four",
            "email": "user4@example.com",
            "password": "user4",
            "university": "Test University",
        }
        response = self.client.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="user4@example.com").exists())
        user4 = User.objects.get(email="user4@example.com")
        self.assertEqual(user4.university.name, "Test University")
        self.assertEqual(user4.name, "User Four")

        #Create User 5 and test for accurate results.
        data = {
            "fullName": "User Five",
            "email": "user5@example.com",
            "password": "user5",
            "university": "Test University",
        }
        response = self.client.post('/register/student', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="user5@example.com").exists())
        user5 = User.objects.get(email="user5@example.com")
        self.assertEqual(user5.university.name, "Test University")
        self.assertEqual(user5.name, "User Five")

        #Create token for User 1
        user1_token = Token.objects.create(user = user1)
        self.client1.credentials(HTTP_AUTHORIZATION='Token ' + user1_token.key)

        #User 1 Creates Organization Aggie Coding Club
        data = {
            "organization": "Aggie Coding Club",
        }
        response = self.client1.post('/create/org/request', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Organization.objects.filter(name="Aggie Coding Club").exists())
        role = Role.objects.get(user= user1, organization__name="Aggie Coding Club")
        self.assertTrue(role.is_admin)

        #Create token for User 2
        user2_token = Token.objects.create(user = user2)
        self.client2.credentials(HTTP_AUTHORIZATION='Token ' + user2_token.key)

        #User 2 Creates Organization Aggie Soccer Club
        data = {
            "organization": "Aggie Soccer Club",
        }
        response = self.client2.post('/create/org/request', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Organization.objects.filter(name="Aggie Soccer Club").exists())
        role = Role.objects.get(user= user2, organization__name="Aggie Soccer Club")
        self.assertTrue(role.is_admin)



        #Create token for User 3
        user3_token = Token.objects.create(user = user3)
        self.client3.credentials(HTTP_AUTHORIZATION='Token ' + user3_token.key)

        #User 3 joins organization Aggie Coding Club
        url = '/join/org'
        data = {'organization': 'Aggie Coding Club'}
        response = self.client3.post(url, data, format='json')
        new_org = Organization.objects.get(name = data['organization'])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Role.objects.filter(user=user3, organization=new_org).exists(), True)

        #Create token for User 4
        user4_token = Token.objects.create(user = user4)
        self.client4.credentials(HTTP_AUTHORIZATION='Token ' + user4_token.key)

        #User 4 joins organization Aggie Coding Club
        url = '/join/org'
        data = {'organization': 'Aggie Coding Club'}
        response = self.client4.post(url, data, format='json')
        new_org = Organization.objects.get(name = data['organization'])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Role.objects.filter(user=user4, organization=new_org).exists(), True)

        #Create token for User 5
        user5_token = Token.objects.create(user = user5)
        self.client5.credentials(HTTP_AUTHORIZATION='Token ' + user5_token.key)
        
        #User 5 joins organization Aggie Coding Club
        url = '/join/org'
        data = {'organization': 'Aggie Soccer Club'}
        response = self.client5.post(url, data, format='json')
        new_org = Organization.objects.get(name = data['organization'])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Role.objects.filter(user=user5, organization=new_org).exists(), True)

        #Create a sample plot for event
        self.plot = Plot.objects.create(name='Test Plot', university=user.university)
        self.new_plot = Plot.objects.get(name = 'Test Plot')

        #Create token for University User
        user_token = Token.objects.create(user = user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + user_token.key)

        #Create Event using the created plot
        self.event_payload = {
            'event_name': 'Test Event',
            'event_date': '2024-05-01T12:00:00',
            'plot_id': self.new_plot.id,
        }
        url = '/create/event'
        response = self.client.post(url, self.event_payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Event.objects.count(), 1)
        event = Event.objects.get()
        self.assertEqual(event.name, 'Test Event')

        #User 1 as Aggie Coding Club registers for event
        org = Organization.objects.get(name = 'Aggie Coding Club')
        data = {
            'event_id': event.id,
            'org_id': org.id,
        }

        response = self.client1.post('/event/org/register', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.assertTrue(OrgRegisteredEvent.objects.filter(organization = org, event = event).exists())

        #User 2 as Aggie Soccer Club registers for event
        org2 = Organization.objects.get(name = 'Aggie Soccer Club')
        data = {
            'event_id': event.id,
            'org_id': org2.id,
        }

        response = self.client.post('/event/org/register', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.assertTrue(OrgRegisteredEvent.objects.filter(organization=org2, event=event).exists())

        #User 3 registers for event through Aggie Coding Club
        data = {
            'event_id': event.id,
            'org_id': org.id,
        }

        response = self.client3.post('/event/student/register', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #User 4 registers for event through Aggie Coding Club
        data = {
            'event_id': event.id,
            'org_id': org.id,
        }

        response = self.client4.post('/event/student/register', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #User 5 registers for event through Aggie Coding Club
        data = {
            'event_id': event.id,
            'org_id': org2.id,
        }

        response = self.client5.post('/event/student/register', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        #Query the queue of orgs that are registered for event
        url = f'/show/registered/students?event_id={event.id}'
        response = self.client.get(url)
        self.assertTrue(response.data[1][1]/response.data[1][0] < response.data[2][1]/response.data[2][0])
        self.assertEqual(len(response.data), 2)
