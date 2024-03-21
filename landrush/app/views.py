from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import User, University, PendingCreateOrg, PendingJoinOrg, Role
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
        user = User.objects.get(id = request.user.id)
        user.is_university = True
        university_name = request.GET["university"]
        user_university = University(name = university_name)
        user_university.save()
        user.university = user_university
        user.save()
        return HttpResponse("Made user university.")

class ChooseUniversity(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]
    def get(self,request):
        university_name = request.GET["university"]
        selected_uni = University.objects.get(name = university_name)
        cur_user = Users.objects.get(email = request.user.email)
        cur_user.university = selected_uni
        cur_user.save()
        return HttpResponse("Chose University.")

class CreateOrg(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]
    def get(self,request):
        create_requester = request.user
        org_name = request.GET["organizaion"]
        check_exists = Organization.objects.get(name = org_name)
        if check_exists is not None:
            return HttpResponse("Organization already exists")
        university = request.user.university
        create_org = PendingCreateOrg(requester = create_requester, name = org_name, university = university)
        create_org.save()
        return HttpResponse("Organization create reques submitted")

class JoinOrg(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]
    def get(self,request):
        join_requester = request.user
        organization_name = request.GET["organization"]
        org = Organization.objects.get(name = organization_name)
        org_join = PendingJoinOrg(requester = join_requester, organization = org)
        org_join.save()

class showJoinOrgPending(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsOrgAdmin]
    def get(self,request):
        org = Organization.objects.get()
        pending_requests = PendingCreateOrg.objects.get()
        for pending in pending_requests:
            print(pending)
        return Response(pending_requests)

class CreateOrgResponse(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsUniversity]
    def get(self,reques):
        status = request.GET["status"]
        if(status == "Accepted"):
            requester_email = request.GET["requester"]
            requester = User.objects.get(email = requester_email)
            org_name = request.GET["organization"]
            org = Organization.objects.get(name = org_name)
            university = request.user.university
            org = Organization(name = org_name, university = university)
            new_role = Role(user = requester, organization = org)
            new_role.save()
            return HttpResponse("Org created")
        else:
            return HttpResponse("Org not created")

