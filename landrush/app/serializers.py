from rest_framework import serializers
from . import models



class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.University
        slug_field = 'name'

class EventSerializer(serializers.ModelSerializer):
    university = serializers.SlugRelatedField(
        read_only=True,
        slug_field='name'
    )
    registered = serializers.SerializerMethodField()

    def get_registered(self, event):
        # Check if the current user is registered for this event
        request = self.context.get('request')
        if request and not request.user.is_anonymous:
            if not request.user.is_university:
                # If the user is not a university, check if they are registered for the event
                is_registered = models.StudentRegisteredEvent.objects.filter(member=request.user, event=event).exists()
                return is_registered
        return False

    class Meta:
        model = models.Event
        fields = ['id', 'name', 'plot', 'created', 'university', 'timestamp', 'registered']

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
        read_only=True,
        slug_field='name'
    )
    num_people = serializers.SerializerMethodField()
    user_has_role = serializers.SerializerMethodField()

    class Meta:
        model = models.Organization

        fields = ['id','university', 'name', 'num_people', 'user_has_role']

    def get_num_people(self, obj):
        return models.Role.objects.filter(organization=obj).count()
    
    def get_user_has_role(self, obj):
        user = self.context['request'].user
        role = models.Role.objects.filter(user=user, organization=obj).first()
        if role:
            if role.is_admin:
                return "Admin"
            else:
                return "Regular member"
        else:
            return "Not a member"



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