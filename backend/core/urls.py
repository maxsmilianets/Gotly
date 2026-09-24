from django.contrib import admin
from django.urls import include, path
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthcheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "gotly-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", HealthcheckView.as_view(), name="healthcheck"),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("projects.urls")),
]
