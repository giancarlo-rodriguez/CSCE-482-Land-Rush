from django.contrib import admin
from .models import University
from .models import User
from .models import Organization
from .models import Role
from .models import Event
from .models import Plot
from .models import PendingCreateOrg
from .models import PendingJoinOrg
from .models import OrgRegisteredEvent
from .models import Coordinates

# Register your models here.
admin.site.register(University)
admin.site.register(User)
admin.site.register(Organization)
admin.site.register(Role)
admin.site.register(Event)
admin.site.register(Plot)
admin.site.register(PendingCreateOrg)
admin.site.register(PendingJoinOrg)
admin.site.register(OrgRegisteredEvent)
admin.site.register(Coordinates)

