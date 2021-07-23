from django.contrib import admin
from .models import User, Email
# Register your models here.

admin.site.register(User)

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    filter_horizontal = ('recipients',) 