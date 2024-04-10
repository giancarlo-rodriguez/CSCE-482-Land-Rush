from django.db import models

from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager

from django.utils import timezone

# Create your models here.
class University(models.Model):
    """
    Model for University table
    Each row is a university
    """
    # Add your university specific fields here
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = "universities"
        verbose_name_plural = "Universities"

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    """
    Custom user manager for user creation
    """

    def create_user(self, email, password, is_university=False, **extra_fields):
        """
        Creates and saves a user with the given email, password, and other fields.
        """
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Creates and saves a superuser with the given email, password and other fields.
        """
        user = self.create_user(email, password, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """
    Custom User model for user table
    """
    id = models.IntegerField(primary_key=True)
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    university = models.ForeignKey(University, on_delete=models.SET_NULL, related_name='user', null=True, blank=True)#not sure 
    is_university = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)  # for admin users
    is_superuser = models.BooleanField(default=False)  # for superuser

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        """
        Determines user permissions
        """
        # Modify logic according to your permission system
        return self.is_staff

    def has_module_perms(self, app_label):
        """
        Determines module permissions for the user
        """
        # Modify logic according to your permission system
        return True


class Organization(models.Model):
    """
    Model for Organization table
    Each row is an organization within a university
    """
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    university = models.ForeignKey(University, related_name='organization', on_delete=models.CASCADE)
    # reservation

    class Meta:
        db_table = "organizations"
        verbose_name_plural = "Organizations"

    def __str__(self):
        return self.name


class Role(models.Model):
    """
    Model for Role table
    Each row is a user and their role within an organization (admin or not)
    """
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    organization = models.ForeignKey(Organization, related_name='role', on_delete=models.CASCADE, null=True, blank=True)
    is_admin = models.BooleanField(default=False)


    class Meta:
        db_table = "roles"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.user.email + ' is admin of ' + self.organization.name
    

    
class Plot(models.Model):
    """
    Model for Plot table
    Each row is a plot within a section
    """
    id = models.IntegerField(primary_key=True)
    university = models.ForeignKey(University, related_name='plot', on_delete = models.CASCADE, default = None, null = True)
    name = models.CharField(max_length = 250, default = "Aggie Plot", null=True)

    class Meta:
        db_table = "plots"
        verbose_name_plural = "Plots"

    def __str__(self):
        return self.name + " at " + self.university.name

class Coordinates(models.Model):
    id = models.IntegerField(primary_key = True)
    plot = models.ForeignKey(Plot, related_name = "event", on_delete=models.CASCADE)
    latitude = models.CharField(max_length=250)
    longitude = models.CharField(max_length=250)

    def __str__(self):
        return "(" + str(self.latitude) + " , " + str(self.longitude) + ") for plot id " + str(self.plot.id)  



class Event(models.Model):
    """
    Model for Event table
    Each row is an event within a university
    """
    id = models.IntegerField(primary_key=True)
    university = models.ForeignKey(University, related_name='event', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length = 90, default=None)
    plot = models.ForeignKey(Plot, related_name='event_plot', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = "events"
        verbose_name_plural = "Events"

    def __str__(self):
        return "'" + self.name + "' at " + self.plot.name 



class PendingJoinOrg(models.Model):
    id = models.IntegerField(primary_key=True)
    requester = models.ForeignKey(User, related_name='join_requester', on_delete = models.CASCADE)
    organization = models.ForeignKey(Organization, related_name = 'requested_org', on_delete = models.CASCADE)

    class Meta:
        unique_together = ["requester","organization"]

    def __str__(self):
        return self.requester.email + ' wants to join ' + self.organization.name

class PendingCreateOrg(models.Model):
    id = models.IntegerField(primary_key=True)
    requester = models.ForeignKey(User, related_name='create_requester', on_delete = models.CASCADE)
    university = models.ForeignKey(University, related_name = 'requested_org', on_delete = models.CASCADE)
    org_name = models.CharField(max_length=50)

    class Meta:
        unique_together = ["requester","org_name","university"]

    def __str__(self):
        return self.requester.email + ' wants to create ' + self.org_name


class OrgRegisteredEvent(models.Model):
    id = models.IntegerField(primary_key = True)
    organization = models.ForeignKey(Organization, related_name = 'registered_org', on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name= 'event', on_delete=models.CASCADE)
    date_registered = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.organization.name + ' registered for  ' + self.event.name

class StudentRegisteredEvent(models.Model):
    id = models.IntegerField(primary_key = True)
    organization = models.ForeignKey(Organization, related_name = 'registered_member_org', on_delete=models.CASCADE)
    member = models.ForeignKey(User, related_name= 'registered_member', on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name= 'registered_member_event', on_delete=models.CASCADE)
    date_time_registered = models.DateTimeField(default=timezone.now)

    
    def __str__(self):
        return self.member.name + " attending " + self.event.name + " through " + self.organization.name

