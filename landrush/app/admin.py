from django.contrib import admin
from .models import University
from .models import User
from .models import Organization
from .models import Role
from .models import Event
from .models import Section
from .models import Plot

# Register your models here.
admin.site.register(University)
admin.site.register(User)
admin.site.register(Organization)
admin.site.register(Role)
admin.site.register(Event)
admin.site.register(Section)
admin.site.register(Plot)