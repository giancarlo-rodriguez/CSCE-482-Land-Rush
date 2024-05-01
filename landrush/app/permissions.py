from rest_framework import permissions
from .models import Organization
from .models import Role


class IsUniversity(permissions.BasePermission):
    def has_permission(self, request, view):
        return(request.user.is_university)


class IsStudent(permissions.BasePermission):
    def has_permission(self,request,view):
        return(not request.user.is_university)


class IsOrgAdmin(permissions.BasePermission):
    def has_permission(self,request,view):
        org_name = request.GET["organization"]
        org = Organization.objects.get(name=org_name)
        org_admins = Role.objects.get(organization = org, is_admin = True)
        for org_admin in org_admins:
            if(org_admin.user.email == request.user.email):
                return True
        return False
