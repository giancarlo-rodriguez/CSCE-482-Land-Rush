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
    path('join/org',views.JoinOrg.as_view()),
    path('create/org/response',views.CreateOrgResponse.as_view()),
    path('create/org/show',views.showCreatetOrgPending.as_view()),
]