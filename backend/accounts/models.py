from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        MANAGER = "manager", "Project Manager"
        MEMBER = "member", "Członek zespołu"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    display_name = models.CharField(max_length=120, blank=True)
    position = models.CharField(max_length=120, blank=True)

    def save(self, *args, **kwargs):
        if not self.display_name:
            full_name = f"{self.first_name} {self.last_name}".strip()
            self.display_name = full_name or self.username
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.display_name or self.username
