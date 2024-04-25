from django.shortcuts import render
from django.core.files.base import ContentFile
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.contrib.auth import authenticate
from django.core.serializers import serialize
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import User, University, PendingCreateOrg, PendingJoinOrg, Role, Organization,Event, OrgRegisteredEvent, Coordinates, Plot, StudentRegisteredEvent, FilledPlot
from .permissions import IsStudent, IsUniversity, IsOrgAdmin
import json
from rest_framework.renderers import JSONRenderer
from . import serializers
from datetime import datetime
from .algo import algorithm

# Add this at the top of your file to configure logging
# Create your views here.
def home(request):
    algorithm()
    return HttpResponse("Hello, world. You're at the landrush app home.")

class FillPlot(APIView):
    authentication_classes = [TokenAuthentication]
    def post(self, request):
        try:
            #1. get event ID from request
            event_id = request.data.get('event_id')


 
            # event_id = request.GET["event_id"]
            event = Event.objects.get(id = event_id)
            orgs_attending = {}
            registered_students = StudentRegisteredEvent.objects.filter(event = event)
            for registered_student in registered_students: 
                org_id = registered_student.organization.id
                time_registered = registered_student.date_time_registered
                difference = time_registered - event.created
                if(org_id in orgs_attending):
                    orgs_attending[org_id] = (orgs_attending[org_id][0] + 1, orgs_attending[org_id][1] + difference.total_seconds() / 60)
                else:
                    orgs_attending[org_id] = (1,difference.total_seconds() / 60)
            print(orgs_attending)
            # return Response(orgs_attending)


            #2. find the plot for that event ID
            exists = FilledPlot.objects.filter(event_id=event_id).exists()
            if exists:
                return Response("A filled plot already exists for this event", status=status.HTTP_400_BAD_REQUEST)
            event = Event.objects.get(id=event_id)

            #3. get lat/long points for that plot
            plot = event.plot
            plot_coordinates_from_db = Coordinates.objects.filter(plot=plot)
            plot_coordinates = []

            #4. convert lat/long list with strings to doubles/floats
            for p in plot_coordinates_from_db:
                plot_coordinates.append((float(p.longitude), float(p.latitude)))

            image_data = algorithm(plot_coordinates, orgs_attending)

            #7. save image in database
            filled_plot = FilledPlot(event=event)
            filled_plot.image.save('filled_plot.png', ContentFile(image_data), save=True)
            #8. return 201 if success
            return Response("Image saved successfully", status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetFilledPlot(APIView):
    def post(self, request):
        try:
            # Get event ID from request body
            event_id = request.data.get('event_id')
            # Find the filled plot entry for the given event ID
            
            filled_plot = FilledPlot.objects.filter(event_id=event_id).first()

            # Initialize a list to store image data for each filled plot
            image_data_list = []

            # Loop through each filled plot instance
            with filled_plot.image.open() as image_file:
                image_data = image_file.read()
                image_data_list.append(image_data)
            # Return the image data in the response
            response = HttpResponse(image_data, content_type='image/png')
            
            response['Content-Disposition'] = 'attachment; filename="filled_plot.png"'
            return response
        except FilledPlot.DoesNotExist:
            return Response("Filled plot not found for the given event ID", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetAllFilledPlots(APIView):
    def get(self, request):
        try:
            # Get all filled plot instances from the database
            filled_plots = FilledPlot.objects.all()

            # Serialize the filled plot instances into JSON
            serialized_plots = serialize('json', filled_plots)

            # Deserialize the JSON data to convert it into a Python object
            deserialized_plots = json.loads(serialized_plots)

            # Return the serialized data as JSON response
            return JsonResponse(deserialized_plots, safe=False)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class StudentRegister(APIView):
    def post(self, request):
        try:
            req_name = request.data.get("fullName")
            req_email = request.data.get("email")
            req_password = request.data.get("password")
            university = request.data.get("university")  # Adjust the key to match frontend
            university = University.objects.get(name = university)

            if not (req_email and req_password and university and req_name):
                return Response("Email, password, and university name are required.", status=status.HTTP_400_BAD_REQUEST)

            # Check if the university already exists
            if User.objects.filter(email = req_email).exists():
                return Response("Student already exists", status=status.HTTP_400_BAD_REQUEST)

            # Create a new user
            user = User.objects.create_user(req_email,req_password)
            new_user = User.objects.get(email = req_email)
            new_user.university = university
            new_user.name = req_name
            new_user.save()

            return Response("Student registered successfully", status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UniversityRegister(APIView):
    def post(self, request):
        try:
            req_email = request.data.get("email")
            req_password = request.data.get("password")
            university_name = request.data.get("universityName")  # Adjust the key to match frontend

            if not (req_email and req_password and university_name):
                return Response("Email, password, and university name are required.", status=status.HTTP_400_BAD_REQUEST)

            # Check if the university already exists
            if University.objects.filter(name=university_name).exists():
                return Response("University already exists", status=status.HTTP_400_BAD_REQUEST)
            
            # Create a new university
            uni = University(name = university_name)
            uni.save()
            new_university = University.objects.get(name = university_name)
            # Create a new user with is_university set to True
            user = User.objects.create_user(req_email,req_password)
            new_user = User.objects.get(email = req_email)
            new_user.university = new_university
            new_user.is_university = True
            new_user.save()
            
            return Response("University registered successfully", status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Logout(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        request.user.auth_token.delete()
        return HttpResponse("Token deleted")
    

class ChooseUniversity(APIView):
    def get(self, request):
        university_names = University.objects.values_list('name', flat=True)
        return Response(university_names)

"""
Temporary Commented out.
Not needed for MVP. Create org directly after request for MVP. 
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
"""
        
class OrganizationList(APIView):
    authentication_classes = [TokenAuthentication]
    
    def get(self, request):
        university = request.user.university
        organizations = Organization.objects.filter(university=university)
        serializer = serializers.OrganizationSerializer(organizations, many=True, context={'request': request})

        return Response(serializer.data, status=status.HTTP_200_OK)
"""
join org if we do org member request
class JoinOrg(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsStudent]

    def post(self, request):
        join_requester = request.user
        organization_name = request.data.get("organization")
        if not organization_name:
            return HttpResponseBadRequest("Organization name not provided in the URL query parameters")
        
        try:
            org = Organization.objects.get(name=organization_name)
        except Organization.DoesNotExist:
            return HttpResponse("Organization does not exist")

        if join_requester.university != org.university:
            return HttpResponse("You are not a member of this organization's university")
        
        org_join = PendingJoinOrg(requester=join_requester, organization=org)
        org_join.save()
        
        return HttpResponse("Join request Created")
"""
class JoinOrg(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        join_requester = request.user
        organization_name = request.data.get("organization")
        if not organization_name:
            return HttpResponseBadRequest("Organization name not provided in the URL query parameters")

        try:
            org = Organization.objects.get(name=organization_name, university=join_requester.university)
        except Organization.DoesNotExist:
            return HttpResponse("Organization does not exist at your university")

        # Check if the user is already a member of the organization
        if Role.objects.filter(user=join_requester, organization=org).exists():
            return HttpResponse("You are already a member of this organization")

        # Create a regular role for the user in the organization
        new_role = Role(user=join_requester, organization=org, is_admin=False)
        new_role.save()

        return HttpResponse("You have been added to the organization as a regular member")

class DropOrg(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        drop_requester = request.user
        organization_name = request.data.get("organization")
        if not organization_name:
            return HttpResponseBadRequest("Organization name not provided in the request body")

        try:
            org = Organization.objects.get(name=organization_name, university=drop_requester.university)
        except Organization.DoesNotExist:
            return Response("Organization does not exist at your university", status=status.HTTP_404_NOT_FOUND)

        # Check if the user is a member of the organization
        try:
            role = Role.objects.get(user=drop_requester, organization=org)
        except Role.DoesNotExist:
            return Response("You are not a member of this organization", status=status.HTTP_400_BAD_REQUEST)

        # Delete the role for the user in the organization
        role.delete()

        return Response("You have been removed from the organization", status=status.HTTP_200_OK)

#used if we do org pending and accepting
class OrgPending(APIView):
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

class ShowJoinOrgPending(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsOrgAdmin]  # You can uncomment this once the permission is implemented

    def get(self, request):
        try:
            # Assuming the user is an admin for multiple organizations
            admin_roles = Role.objects.filter(user=request.user, is_admin=True)
            organizations = [role.organization for role in admin_roles]
            pending_join_requests = []
            for org in organizations:
                pending_join_requests.extend(PendingJoinOrg.objects.filter(organization=org))
            serializer = serializers.PendingJoinOrgSerializer(pending_join_requests, many=True)
            return JsonResponse(serializer.data, status=200, safe=False)
        except Exception as error:
            return JsonResponse({"error": str(error)}, status=500)

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

class UserOrganizations(APIView):
    authentication_classes = [TokenAuthentication]
    
    def get(self, request):
        user = request.user
        user_roles = Role.objects.filter(user=user)
        user_organizations = [role.organization for role in user_roles]
        serializer = serializers.OrganizationSerializer(user_organizations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
class ShowOrganization(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        organization_name = request.GET["organization_name"]
        org = Organization.Objects.get(name = organization_name)
        return HttpResponse("Done")


### ********** Crticial Views ************* ###
class Login(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(email=email,password=password)
        if user is not None:
            # Check if the user is a university
            if user.is_university:
                # Generate or retrieve token
                token, created = Token.objects.get_or_create(user=user)
                print("token uni", token)
                # Return token along with user role
                return Response({
                    'token': token.key,
                    'user_role': 'university'
                })
            else:
                # Return token along with user role as student
                token, created = Token.objects.get_or_create(user=user)
                print("token studnet", token)
                return Response({
                    'token': token.key,
                    'user_role': 'student'
                })
        else:
            print("invalid credentials")
            return HttpResponse("Invalid credentials.")

class CreateOrg(APIView):
    authentication_classes = [TokenAuthentication]
    def post(self,request):
        org_name = request.data.get("organization")
        try:
            check_exists = Organization.objects.get(name = org_name)
            return HttpResponse("Organization already exists")
        except:
            university = request.user.university
            new_org = Organization(name = org_name, university = university)
            new_org.save()
            new_org = Organization.objects.get(name = org_name)
            new_role = Role(user = request.user, organization = new_org, is_admin = True)
            new_role.save()
            return HttpResponse("Organization created!")

class DeleteOrg(APIView):
    authentication_classes = [TokenAuthentication]
    def delete(self,request):
        try:
            org_id = request.data.get("org_id")
            deleted_org = Organization.objects.get(id = org_id)
            deleted_org.delete()
        except:
            return HttpResponse("Org Not deleted.")

class AddAccountToOrg(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        org_name = request.data.get("organization")
        
        try:
            organization = Organization.objects.get(name=org_name)
            user = request.user

            if Role.objects.filter(user=user, organization=organization).exists():
                return HttpResponse("User is already a member of this organization.", status=400)
            else:
                new_role = Role(user=user, organization=organization)
                new_role.save()
                return HttpResponse("User added to organization successfully!", status=201)
        
        except Organization.DoesNotExist:
            return HttpResponse("Organization not found.", status=404)
        
class CreateEvent(APIView):
    authentication_classes = [TokenAuthentication]
    def post(self,request):
        print(request.data)
        event_name = request.data.get("event_name")
        event_date_string = request.data.get("event_date")
        event_date = datetime.fromisoformat(event_date_string)
        event_university = request.user.university
        event_plot_id = request.data.get("plot_id")
        event_plot = Plot.objects.get(id = event_plot_id)
        new_event = Event(name = event_name, university = event_university, plot = event_plot, timestamp = event_date)
        new_event.save()
        return HttpResponse("Event Created")
    
    def put(self,request):
        try:
            event_id = request.data.get("event_id")
            event_name = request.data.get("event_name")
            event_date_string = request.data.get("event_date")
            event_date = datetime.datetime.strptime(event_date_string, "%Y-%m-%d")
            event_university = request.user.university
            event_plot_id = request.data.get("plot_id")
            event_plot = Plot.objects.get(id = event_plot_id)
            updated_event = Event.objects.get(id = event_id)
            updated_event.name = event_name
            updated_event.timestamp = event_date
            updated_event.university = event_university
            updated_event.plot = event_plot
            updated_event.save()
            return HttpResponse("Event Updated")
        except:
            return HttpResponse("Event update not successful")
        
class DeleteEvent(APIView):
    authentication_classes = [TokenAuthentication]

    def delete(self, request):
        try:
            event_id = request.query_params.get("event_id")  # Use query_params to get the event_id
            event = Event.objects.get(id=event_id)
            event.delete()
            return Response("Event Deleted", status=status.HTTP_200_OK)  # Use HTTP_200_OK for successful deletion
        except Event.DoesNotExist:
            return Response("Event not found", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

class ShowEvent(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        events = Event.objects.filter(university=request.user.university)
        serializer_context = {'request': request}  # Create serializer context
        event_serializer = serializers.EventSerializer(events, many=True, context=serializer_context)
        return Response(event_serializer.data)

class CreatePlot(APIView):
    authentication_classes = [TokenAuthentication]
    def post(self,request):
        plot_university = request.user.university
        coordinates = request.data.get("coordinates")

        if not coordinates:
            return Response("No coordinates provided.", status=status.HTTP_400_BAD_REQUEST)

        plot_name = request.data.get("plot_name")
        new_plot = Plot(university = plot_university, name = plot_name)
        new_plot.save()
        new_plot = Plot.objects.latest('id')
        for coordinate_pair in coordinates:
            for coordinate in coordinate_pair:
                new_coordinate = Coordinates(plot = new_plot,latitude = coordinate[0], longitude = coordinate[1])
                new_coordinate.save()
        return HttpResponse("Plot created.") 
    
    def put(self,request):
        try:
            plot_id = request.data.get("plot_id")
            plot_university = request.user.university
            coordinates = request.data.get("coordinates")
            plot_name = request.data.get("plot_name")
            updated_plot = Plot.objects.get(id = plot_id)
            updated_plot.university = plot_university
            updated_plot.name = plot_name
            updated_plot.save()
            updated_plot = Plot.objects.get(id = plot_id)
            delete_coordinate = Coordinates.objects.filter(plot = updated_plot).delete()
            for coordinate_pair in coordinates:
                for coordinate in coordinate_pair:
                    new_coordinate = Coordinates(plot = updated_plot,latitude = coordinate[0], longitude = coordinate[1])
                    new_coordinate.save()
            return HttpResponse("Plot Updated") 
        except:
            return HttpResponse("Plot update NOT successful")
    
class DeletePlot(APIView):
    authentication_classes = [TokenAuthentication]
    def delete(self,request):
        try:
            plot_id = request.data.get("plot_id")
            deleted_plot = Plot.objects.get(id = plot_id)
            deleted_plot.delete()
            return HttpResponse("Plot deleted")

        except:
            return HttpResponse("Plot NOT deleted.")

class ShowPlots(APIView):
    authentication_classes = [TokenAuthentication]
    # def get(self,request):
    #     plots = Plot.objects.filter(university = request.user.university)
    #     plots_json = serializers.PlotSerializer(plots, many = True)
    #     return Response(plots_json.data)
    def get(self, request):
        # Check if a specific plot ID is provided in the query parameters
        plot_id = request.query_params.get('plot_id')
        
        # If plot_id is provided, return details of that specific plot
        if plot_id:
            plot = Plot.objects.filter(id=plot_id, university=request.user.university).first()
            if plot:
                plot_json = serializers.PlotSerializer(plot)
                return Response(plot_json.data)
            else:
                return Response({'message': 'Plot not found'}, status=404)

        # If plot_id is not provided, return all plots for the user's university
        else:
            plots = Plot.objects.filter(university=request.user.university)
            plots_json = serializers.PlotSerializer(plots, many=True)
            return Response(plots_json.data)

class ShowCoordinates(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        plot = Plot.objects.get(id = request.GET["plot_id"])   
        coordinates = Coordinates.objects.filter(plot = plot)
        coordinates_json = serializers.CoordinateSerializer(coordinates, many = True)
        print(coordinates_json.data)
        return Response(coordinates_json.data)

class OrgRegisterEvent(APIView):
    authentication_classes = [TokenAuthentication]
    #permission_classes = [?is user admin of org]
    def post(self, request):
        try:
            event_id = request.data.get("event_id")
            organization_id = request.data.get("org_id")
            
            # Check if the organization is already registered for the event
            if OrgRegisteredEvent.objects.filter(organization_id=organization_id, event_id=event_id).exists():
                return Response("Organization is already registered for this event", status=status.HTTP_400_BAD_REQUEST)
            organization = Organization.objects.get(id=organization_id)
            event = Event.objects.get(university=request.user.university, id=event_id)
            register_for_event = OrgRegisteredEvent(organization=organization, event=event)
            register_for_event.save()
            return Response("Organization has registered for event", status=status.HTTP_201_CREATED)
        except:
            return Response("Registration not successful", status=status.HTTP_400_BAD_REQUEST)


class OrgUnregisterEvent(APIView):
    authentication_classes = [TokenAuthentication]
    #permission_classes = [?is user admin of org]
    def post(self, request):
        try:
            event_id = request.data.get("event_id")
            organization_id = request.data.get("org_id")
            organization = Organization.objects.get(id=organization_id)
            event = Event.objects.get(university = request.user.university, id = event_id)
            registration_obj = OrgRegisteredEvent.objects.get(organization = organization, event = event)
            registration_obj.delete()
            return HttpResponse("Organization has unregistered for event")
        except:
            return HttpResponse("Unregistration not successful")
    
class StudentRegisterEvent(APIView):
    authentication_classes = [TokenAuthentication]
    def post(self,request):
        event_id = request.data.get("event_id")
        organization_id = request.data.get("organization_id")
        org = Organization.objects.get(id = organization_id)
        try:
            check_membership = Role.objects.get(organization = org, user = request.user)
        except:
            return HttpResponse("You are not a member of this organization.")
        member = request.user
        event = Event.objects.get(id = event_id)
        try:
            check_other_registration = StudentRegisteredEvent.objects.get(event = event, member = member)
            return HttpResponse("You have already registered for this event with another organization")
        except:
            pass
        new_student_event = StudentRegisteredEvent(event = event, member = member, organization = org)
        new_student_event.save()
        return HttpResponse("Registered for event")

class StudentUnregisterEvent(APIView):
    authentication_classes = [TokenAuthentication]
    def post(self,request):
        event_id = request.data.get("event_id")
        organization_id = request.data.get("organization_id")
        org = Organization.objects.get(id = organization_id)
        try:
            check_membership = Role.objects.get(organization = org, user = request.user)
        except:
            return HttpResponse("You are not a member of this organization.")
        member = request.user
        event = Event.objects.get(id = event_id)
        try:
            check_registration = StudentRegisteredEvent.objects.get(event = event, member = member, organization = org)
            check_registration.delete()
        except:
            return HttpResponse("You are not registered for this event.")

        return HttpResponse("Unregistered for event")

class AverageRegistrationTime(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        event_id = request.GET["event_id"]
        event = Event.objects.get(id = event_id)
        orgs_attending = {}
        registered_students = StudentRegisteredEvent.objects.filter(event = event)
        for registered_student in registered_students: 
            org_id = registered_student.organization.id
            time_registered = registered_student.date_time_registered
            difference = time_registered - event.created
            if(org_id in orgs_attending):
                orgs_attending[org_id] = (orgs_attending[org_id][0] + 1, orgs_attending[org_id][1] + difference.total_seconds() / 60)
            else:
                orgs_attending[org_id] = (1,difference.total_seconds() / 60)
        return Response(orgs_attending)

class RegisterOrgEvent(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        event_id = request.data.get("event_id")
        organization_id = request.data.get("organization_id")
        org = Organization.objects.get(id=organization_id)
        event = Event.objects.get(id=event_id)
        org_registered_event = OrgRegisteredEvent(event=event, organization=org)
        org_registered_event.save()
        return Response("Registered for event", status=status.HTTP_200_OK)

class StudentOrgRegisteredEvent(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        event_id = request.data.get("event_id")
        organization_id = request.data.get("organization_id")
        org = Organization.objects.get(id = organization_id)
        event = Event.objects.get(id = event_id)
        org_registed_event = OrgRegisteredEvent(event = event, organization = org)
        org_registed_event.save()
        return HttpResponse("Registered for event")
class OrgMemberCount(APIView):
    #authentication_classes = [TokenAuthentication]
    def get(self,request):
        org_id = request.data.get("org_id")
        org = Organization.objects.get(id = org_id)
        org_members_query = Role.objects.filter(organization = org)
        org_members = []
        for member in org_members_query:
            org_members.append(member)

        return HttpResponse(len(org_members))

class MembersAttendingEvent(APIView):
    authentication_classes = [TokenAuthentication]
    def get(self,request):
        #try:
        org_id = request.data.get("org_id")
        event_id = request.data.get("event_id")
        print(org_id)
        print(event_id)
        org = Organization.objects.get(id = org_id)
        event = Event.objects.get(id = event_id)
        students_registered_objects = StudentRegisteredEvent.objects.filter(event = event, organization = org)
        members_attending = []
        for student_registered_object in students_registered_objects:
            members_attending.append(student_registered_object.member)
        members_serializer = serializers.UserSerializer(members_attending, many = True)
        return JsonResponse(members_serializer.data, safe = False)
        #except:
       #     return HttpResponse("Oops. Can't get list of members attending.")





# Create the view for running the algorithm
