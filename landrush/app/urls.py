from django.urls import path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from . import views

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
    path('show/profile',views.ShowProfile.as_view()), #Done in frontend

    path('register/university',views.UniversityRegister.as_view()),
    path('create/event',views.CreateEvent.as_view()), #Needs to be done in frontend
    path('delete/event',views.DeleteEvent.as_view()),
    path('create/plot',views.CreatePlot.as_view()),
    path('show/plots',views.ShowPlots.as_view()),
    path('show/coordinates', views.ShowCoordinates.as_view()),
    path('update/plot', views.CreatePlot.as_view()),    
    path('fill-plot', views.FillPlot.as_view()),
    path('get-filled-plot', views.GetFilledPlot.as_view()),
    path('get-all-filled-plots', views.GetAllFilledPlots.as_view()),
    path('delete/plot',views.DeletePlot.as_view()),

    path('register/student',views.StudentRegister.as_view()), #Done in frontend
    path('choose/uni',views.ChooseUniversity.as_view()),
    path('create/org/request',views.CreateOrg.as_view()), #needs to be created in frontend
    path('join/org',views.JoinOrg.as_view()), #Done in frontend
    path('join/org/response',views.JoinOrgResponse.as_view()), #Needs to be done in frontend
    path('drop/org',views.DropOrg.as_view()),
    path('show/orgs',views.OrganizationList.as_view()),
    path('delete/org',views.DeleteOrg.as_view()),
    path('event/org/register',views.OrgRegisterEvent.as_view()), #Needs to be done in frontend
    path('event/org/unregister',views.OrgUnregisterEvent.as_view()), #Needs to be done in frontend
    path('show/org/attending',views.MembersAttendingEvent.as_view()),
    path('event/student/register',views.StudentRegisterEvent.as_view()),
    path('event/student/unregister',views.StudentUnregisterEvent.as_view()),
    path('show/registered/students',views.AverageRegistrationTime.as_view()),
    path('show/user/orgs',views.UserOrganizations.as_view()), #Done in frontend
    path('show/event',views.ShowEvent.as_view()), #Done in frontend
    path('show/join/org',views.ShowJoinOrgPending.as_view()), #Done in the frontend
    path('org/count',views.OrgMemberCount.as_view()),
    path('which/events/member/attending',views.UserAttendanceView.as_view()),
#StudentAvaibleEvents
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
