from django.contrib import admin

from .models import Project, Review, Task


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "status", "progress", "due_date")
    search_fields = ("name", "owner__username", "owner__email")
    list_filter = ("status",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "status", "priority", "has_deadline", "due_date")
    search_fields = ("title", "project__name", "assignee__username")
    list_filter = ("status", "priority", "has_deadline")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("author_name", "role_label", "rating", "created_at")
    search_fields = ("author_name", "role_label", "quote")
