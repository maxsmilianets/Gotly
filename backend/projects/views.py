from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, Review, Task
from .serializers import ProjectSerializer, ReviewSerializer, TaskSerializer


class IsProjectManagerForWrite(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == "manager"


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectManagerForWrite]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(Q(owner=user) | Q(members=user)).distinct().prefetch_related("members", "tasks")

    def perform_create(self, serializer):
        if self.request.user.role != "manager":
            raise PermissionDenied("Tylko Project Manager może tworzyć projekty.")
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        project = self.get_object()
        if project.owner_id != self.request.user.id:
            raise PermissionDenied("Tylko menedżer tego projektu może go edytować.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner_id != self.request.user.id:
            raise PermissionDenied("Tylko menedżer tego projektu może go usunąć.")
        instance.delete()


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(project__owner=user) | Q(project__members=user) | Q(assignee=user)
        ).distinct().select_related("project", "assignee")

    def _can_manage_task(self, project):
        return self.request.user.role == "manager" and project.owner_id == self.request.user.id

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]
        if not self._can_manage_task(project):
            raise PermissionDenied("Tylko menedżer projektu może dodawać zadania.")
        serializer.save()

    def perform_update(self, serializer):
        project = serializer.validated_data.get("project") or serializer.instance.project
        if not self._can_manage_task(project):
            raise PermissionDenied("Tylko menedżer docelowego projektu może edytować to zadanie.")
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        task = self.get_object()

        if self._can_manage_task(task.project):
            serializer = self.get_serializer(task, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

        allowed_statuses = {choice[0] for choice in Task.Status.choices}
        requested_fields = set(request.data.keys())
        if requested_fields <= {"status"} and request.data.get("status") in allowed_statuses:
            task.status = request.data["status"]
            task.save(update_fields=["status", "completed_at", "updated_at"])
            serializer = self.get_serializer(task)
            return Response(serializer.data)

        raise PermissionDenied("Członek projektu może zmieniać tylko status zadania.")

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if not self._can_manage_task(instance.project):
            raise PermissionDenied("Tylko menedżer projektu może usuwać zadania.")
        instance.delete()


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return Review.objects.all().order_by("-created_at")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DashboardSummaryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        projects = Project.objects.filter(Q(owner=user) | Q(members=user)).distinct()
        tasks = Task.objects.filter(
            Q(project__owner=user) | Q(project__members=user) | Q(assignee=user)
        ).distinct()

        overdue_tasks = tasks.filter(has_deadline=True, due_date__lt=timezone.localdate()).exclude(status=Task.Status.DONE)
        active_projects = projects.filter(status=Project.Status.ACTIVE)

        summary = {
            "total_projects": projects.count(),
            "active_projects": active_projects.count(),
            "my_tasks": tasks.count(),
            "overdue_tasks": overdue_tasks.count(),
            "active_projects_list": ProjectSerializer(active_projects[:6], many=True).data,
            "my_tasks_list": TaskSerializer(tasks[:8], many=True).data,
            "project_status": {
                "active": active_projects.count(),
                "planning": projects.filter(status=Project.Status.PLANNING).count(),
                "done": projects.filter(status=Project.Status.DONE).count(),
            },
        }
        return Response(summary)
