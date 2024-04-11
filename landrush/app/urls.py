from django.urls import path
from . import views
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="My API",
        default_version='v1',
        description="My API description",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="Awesome License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)



urlpatterns = [
    path('', views.home, name='home'),
    path('login',views.Login.as_view(), name='login'), #Done frontend
    path('logout',views.Logout.as_view()), #Done in frontend
    path('register/student',views.StudentRegister.as_view()), #Done in frontend
    path('register/university',views.UniversityRegister.as_view()),
    path('print/user',views.RequestUser.as_view()), #Nott needed
    path('make/uni',views.MakeUserUni.as_view()), #Needs to go in University register
    path('choose/uni',views.ChooseUniversity.as_view()),#Needs go to Student Register 
    path('create/org/request',views.CreateOrg.as_view()), #needs to be created in frontend
    path('join/org/request',views.JoinOrg.as_view()), #Done in frontend
    path('create/org/response',views.CreateOrgResponse.as_view()), #Needs to be done in frontend
   # path('create/org/show',views.showCreateOrgPending.as_view()), #Needs to be done in frontend
    path('join/org/response',views.JoinOrgResponse.as_view()), #Needs to be done in frontend
    path('create/event',views.CreateEvent.as_view()), #Needs to be done in frontend
    path('delete/event',views.DeleteEvent.as_view()),
    path('event/org/register',views.RegisterForEvent.as_view()), #Needs to be done in frontend
    path('show/profile',views.ShowProfile.as_view()), #Done in frontend
    path('show/user/orgs',views.ShowUserOrganizations.as_view()), #Done in frontend
    path('show/event',views.ShowEvent.as_view()), #Done in frontend
    path('show/join/org/',views.showJoinOrgPending.as_view()), #Done in the frontend
    path('create/plot',views.CreatePlot.as_view()),
    path('show/plots',views.ShowPlots.as_view()),
    path('show/coordinates', views.ShowCoordinates.as_view()),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('update/plot', views.CreatePlot.as_view()),
    path('event/student/register',views.StudentRegisterEvent.as_view()),
    path('show/registered/students',views.AverageRegistrationTime.as_view()),
]