from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import User, University, PendingCreateOrg, PendingJoinOrg, Role, Organization,Event, OrgRegisteredEvent
from .permissions import IsStudent, IsUniversity, IsOrgAdmin
import json
from rest_framework.renderers import JSONRenderer
from . import serializers
# Create your views here.
def home(request):
    return HttpResponse("Hello, world. You're at the landrush app home.")

class StudentRegister(APIView):
    def get(self,request):
        req_email = request.GET["email"]
        req_password = request.GET["password"]
        first_name = request.GET["first_name"]
        last_name = request.GET["last_name"]
        university_name = request.GET["university_name"]
        university = University.objects.get(name = university_name)
        try:
            user = User.objects.get(email=req_email)
            return HttpResponse("User already exists")
        except:
            user = User.objects.create_user(req_email,req_password)
            new_user = User.objects.get(email = req_email)
            new_user.university = university
            new_user.first_name = first_name
            new_user.last_name = last_name
            new_user.save()
            return HttpResponse("User created")

class UniversityRegister(APIView):
    def get(self,request):
        req_email = request.GET["email"]
        req_password = request.GET["password"]
        university_name = request.GET["university_name"]
        try:
            university = University.objects.get(name = university_name)
            return HttpResponse("University already exists")
        
        except:
            user = User.objects.create_user(req_email,req_password)
            new_user = User.objects.get(email = req_email)
            new_user.is_university = True
            new_uni = University(name = university_name)
            new_user.save()
            

        


class Login(ObtainAuthToken):
    def get(self,request,*args,**kwargs):
        email = request.GET["email"]
        password = request.GET["password"]
        user = authenticate(email=email,password = password)
        print(request.user)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
            })
        else:
            return HttpResponse("Not authenticated")

class Logout(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        request.user.auth_token.delete()
        return HttpResponse("Token deleted")


class RequestUser(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        return HttpResponse(request.user)

class MakeUserUni(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]
    def get(self,request):
        university_name = request.GET["university"]
        user_university = University(name = university_name)
        user_university.save()
        new_user_university = University.objects.get(name = university_name)
        user = User.objects.get(id = request.user.id)
        user.is_university = True
        user.university = new_user_university
        user.save()
        return HttpResponse("Made user university.")

class ChooseUniversity(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]
    def get(self,request):
        university_name = request.GET["university"]
        selected_uni = University.objects.get(name = university_name)
        cur_user = User.objects.get(email = request.user.email)
        cur_user.university = selected_uni
        cur_user.save()
        return HttpResponse("Chose University.")

class CreateOrg(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]
    def get(self,request):
        create_requester = request.user
        org_name = request.GET["organization"]
        try:
            check_exists = Organization.objects.get(name = org_name)
            return HttpResponse("Organization already exists")
        except:
            university = request.user.university
            create_org = PendingCreateOrg(requester = create_requester, org_name = org_name, university = university)
            create_org.save()
            return HttpResponse("Organization create request submitted")

class JoinOrg(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]
    def get(self,request):
        join_requester = request.user
        organization_name = request.GET["organization"]
        try:
            org = Organization.objects.get(name = organization_name)
        except:
            return HttpResponse("Org does not exist")
        if(join_requester.university != org.university):
            return HttpResponse("You are not a member of this university")
        org_join = PendingJoinOrg(requester = join_requester, organization = org)
        org_join.save()
        return HttpResponse("Join request Created")

class showCreateOrgPending(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsUniversity]
    def get(self,request):
        pending_requests = PendingCreateOrg.objects.get(university = request.user.university)
        return HttpResponse(pending_requests)

class CreateOrgResponse(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsUniversity]
    def get(self,request):
        status = request.GET["status"]
        if(status == "Accepted"):
            requester_email = request.GET["requester"]
            requester = User.objects.get(email = requester_email)
            org_name = request.GET["organization"]
            university = request.user.university
            org = Organization(name = org_name, university = university)
            org.save()
            new_org = Organization.objects.get(name = org_name)
            new_role = Role(user = requester, organization = new_org, is_admin = True)
            new_role.save()
            pending_create = PendingCreateOrg.objects.get(requester = requester, university = request.user.university, org_name = org_name)
            pending_create.delete()
            return HttpResponse("Org created")
        else:
            return HttpResponse("Org not created")


##### Not Yet Tested #######
class showJoinOrgPending(APIView):
    authentication_classes = [TokenAuthentication]
    #permission_classes = [IsOrgAdmin]
    def get(self,request):
        try:
            cur_admin_orgs = Role.objects.get(user = request.user,is_admin=True)
            orgs = Organization.objects.get(name = cur_admin_orgs.organization.name)
            pending_join = PendingJoinOrg.objects.get(organization = orgs)
            return HttpResponse(pending_join)
        except Exception as error:
            return HttpResponse(error)

class CreateEvent(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsUniversity]
    def get(self,request):
        event_university = request.user.university
        event_name = request.GET["event_name"]
        new_event = Event(name = event_name, university = event_university)
        new_event.save()
        return HttpResponse("Event Created")

class RegisterForEvent(APIView):
    authentication_classes = [TokenAuthentication]
    #permission_classes = [?is user admin of org]
    def get(self, request):
        organization_name = request.GET["organization"]
        organization = Organization.objects.get(name=organization_name)
        event = Event.objects.get(university = request.user.university, id = request.GET["event_name"])
        register_for_event = OrgRegisteredEvent(organization = organization, event = event)
        register_for_event.save()
        return HttpResponse("Organization has registered for event")

class JoinOrgResponse(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        status = request.GET["status"]
        if(status == "Accepted"):
            organization = Organization.objects.get(name = request.GET["organization"])
            requester = User.objects.get(email = request.GET["requester"])
            new_member = Role(organization = organization, user = requester, is_admin = False)
            new_member.save()
            pending_join = PendingJoinOrg.objects.get(organization=organization, requester = requester)
            pending_join.delete()
            return HttpResponse("Join Org Request Accepted")
        else:
            return HttpResponse("Rejected")



# *********show resource views******** #
#show profile info:
class ShowProfile(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        profile_serialized = serializers.UserSerializer(request.user)
        return Response(profile_serialized.data)

#show all current events
class ShowEvent(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        events = Event.objects.get(university = request.user.university)
        print(events)
        event_json = serializers.EventSerializer(events)
        print(event_json)
        return Response(event_json.data)

class ShowUserOrganizations(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        user_roles = Role.objects.filter(user = request.user)
        orgs = []
        for role in user_roles:
            org_serialized = serializers.OrganizationSerializer(role.organization)
            orgs.append(org_serialized.data)
        return Response(orgs)
        


