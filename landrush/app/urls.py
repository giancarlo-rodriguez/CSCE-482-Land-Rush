from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login',views.Login.as_view(), name='login'),
    path('logout',views.Logout.as_view()),
    path('register',views.Register.as_view()),
    path('print/user',views.RequestUser.as_view()),
    path('make/uni',views.MakeUserUni.as_view()),
    path('choose/uni',views.ChooseUniversity.as_view()),
    path('create/org/request',views.CreateOrg.as_view()),
    path('join/org/request',views.JoinOrg.as_view()),
    path('create/org/response',views.CreateOrgResponse.as_view()),
    path('create/org/show',views.showCreatetOrgPending.as_view()),
    path('join/org/response',views.JoinOrgResponse.as_view()),
    path('create/event',views.CreateEvent.as_view()),
    path('event/org/register',views.RegisterForEvent.as_view()),
    path('show/profile',views.ShowProfile.as_view()),
    path('show/user/orgs',views.ShowUserOrganizations.as_view()),
    path('show/event',views.ShowEvent.as_view()),
    path('show/join/org/',views.showJoinOrgPending.as_view()),
]