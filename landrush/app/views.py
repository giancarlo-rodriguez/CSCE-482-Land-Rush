from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import User, University, PendingCreateOrg, PendingJoinOrg, Role, Organization
from .permissions import IsStudent, IsUniversity, IsOrgAdmin

# Create your views here.
def home(request):
    return HttpResponse("Hello, world. You're at the landrush app home.")

class Register(APIView):
    def get(self,request):
        req_email = request.GET["email"]
        req_password = request.GET["password"]
        try:
            user = User.objects.get(email=req_email)
            return HttpResponse("User already exists")
        except:
            user = User.objects.create_user(req_email,req_password)
            return HttpResponse("User created")

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

class showCreatetOrgPending(APIView):
    authentication_classes = [TokenAuthentication]
    #permission_classes = [IsOrgAdmin]
    def get(self,request):
        if(request.user.is_university == False):
            return HttpResponse("You are not a university")
        pending_requests = PendingCreateOrg.objects.get(university = request.user.university)
        return HttpResponse(pending_requests)

class CreateOrgResponse(APIView):
    authentication_classes = [TokenAuthentication]
    #permission_classes = [IsUniversity]
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

