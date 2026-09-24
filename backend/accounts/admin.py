from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Gotly", {"fields": ("display_name", "role", "position")}),
    )
    list_display = ("username", "email", "display_name", "role", "position", "is_staff")
