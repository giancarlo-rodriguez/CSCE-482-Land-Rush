from django.db import models

from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager

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
    password = models.CharField(max_length=128)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='user', null=True, blank=True)
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
        return self.university.name + '_' + self.name


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
        return self.name


class Event(models.Model):
    """
    Model for Event table
    Each row is an event within a university
    """
    id = models.IntegerField(primary_key=True)
    university = models.ForeignKey(University, related_name='event', on_delete=models.CASCADE)
    event_time = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "events"
        verbose_name_plural = "Events"

    def __str__(self):
        return self.university.name + '_' + str(self.id)


class Section(models.Model):
    """
    Model for Section table
    Each row is a section within a university
    """
    id = models.IntegerField(primary_key=True)
    university = models.ForeignKey(University, related_name='section', on_delete=models.CASCADE)
    
    class Meta:
        db_table = "sections"
        verbose_name_plural = "Sections"

    def __str__(self):
        return self.university.name + '_' + str(self.id)


class Plot(models.Model):
    """
    Model for Plot table
    Each row is a plot within a section
    """
    id = models.IntegerField(primary_key=True)
    section = models.ForeignKey(Section, related_name='plot', on_delete=models.CASCADE)

    class Meta:
        db_table = "plots"
        verbose_name_plural = "Plots"

    def __str__(self):
        return self.university.name + '_' + str(self.section.id) + '_' + str(self.id)


class Reservation(models.Model):
    """
    Model for Reservation
    Each row is an organization's plot reservation
    """
    id = models.IntegerField(primary_key=True)
    plot = models.ForeignKey(Plot, on_delete=models.CASCADE, related_name='reservation', null=True, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='reservation', null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reservation', null=True, blank=True)


class RequestOrgToUni(models.Model):
    """
    Model for RequestOrgToUni
    Each row is a request from an organization(admin user) to a university
    """
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='org_request', null=True, blank=True)


class RequestUserToOrg(models.Model):
    """
    Model for RequestUserToOrg
    Each row is a a user's request to join an organization
    """
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='user_request', null=True, blank=True)


class RequestPlot(models.Model):
    """
    Model for RequestPlot
    Each row is an organization's request for a plot
    """
    id = models.IntegerField(primary_key=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='user_request', null=True, blank=True) 
    member_count = models.IntegerField()
    request_time = models.DateTimeField(auto_now_add=True)


class PointSection(models.Model):
    """
    Model for PointSection table
    Each row is a vertex of a section within a university
    """
    id = models.IntegerField(primary_key=True)
    latitude = models.IntegerField()
    longitude = models.IntegerField()
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='point', null=True, blank=True)


class PointPlot(models.Model):
    """
    Model for PointPlot table
    Each row is a vertex of a plot within a section
    """
    id = models.IntegerField(primary_key=True)
    latitude = models.IntegerField()
    longitude = models.IntegerField()
    plot = models.ForeignKey(Plot, on_delete=models.CASCADE, related_name='point', null=True, blank=True)