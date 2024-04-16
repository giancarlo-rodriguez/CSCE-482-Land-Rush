from rest_framework import serializers
from . import models



class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.University
        slug_field = 'name'

class EventSerializer(serializers.ModelSerializer):
    university = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )
    class Meta:
        model = models.Event
        fields = ['id','name','plot','created','university','timestamp']

class PlotSerializer(serializers.ModelSerializer):
    university = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )

    class Meta:
        model = models.Plot
        fields = ['id', 'name', 'university']

class CoordinateSerializer(serializers.ModelSerializer):
    plot = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )

    class Meta:
        model = models.Coordinates
        fields = ['longitude', 'latitude', 'plot']

class UserSerializer(serializers.ModelSerializer):
    university = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )
    
    class Meta: 
        model = models.User
        fields = ['email','name','university','is_university']


class OrganizationSerializer(serializers.ModelSerializer):
    university = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )

    class Meta:
        model = models.Organization
        fields = ['id','university','name']

class RoleSerializer(serializers.ModelSerializer):
    organization = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )
    user = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'email'
    )

    class Meta:
        model = models.Role
        fields = ['id','organization','user','is_admin']


class PendingJoinOrgSerializer(serializers.ModelSerializer):
    requester = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'email'
    )

    organization = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )

    class Meta:
        model = models.PendingJoinOrg
        fields = ['requester','organization']

class PendingCreateOrgSerializer(serializers.ModelSerializer):
    requester = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'email'
    )

    university = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )

    class Meta:
        model = models.PendingCreateOrg
        fields = ['requester', 'university', 'org_name']

class OrgRegisteredEventSerializer(serializers.ModelSerializer):
    organization = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )

    event = serializers.SlugRelatedField(
        read_only = True,
        slug_field = 'name'
    )
    
    class Meta:
        model = models.OrgRegisteredEvent
        fields = ['date_registered','event','organization']