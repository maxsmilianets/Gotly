from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DashboardSummaryAPIView, ProjectViewSet, ReviewViewSet, TaskViewSet

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="projects")
router.register("tasks", TaskViewSet, basename="tasks")
router.register("reviews", ReviewViewSet, basename="reviews")

urlpatterns = [
    path("dashboard/summary/", DashboardSummaryAPIView.as_view(), name="dashboard-summary"),
    path("", include(router.urls)),
]
