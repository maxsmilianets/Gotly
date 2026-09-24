from django.conf import settings
from django.db import models
from django.utils import timezone


class Project(models.Model):
    class Status(models.TextChoices):
        PLANNING = "planning", "Zaplanowany"
        ACTIVE = "active", "Aktywne"
        DONE = "done", "Ukończone"

    name = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_projects",
    )
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="team_projects", blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    progress = models.PositiveIntegerField(default=0)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "todo", "Do zrobienia"
        IN_PROGRESS = "in_progress", "W toku"
        DONE = "done", "Ukończone"
        OVERDUE = "overdue", "Po terminie"

    class Priority(models.TextChoices):
        LOW = "low", "Niski"
        MEDIUM = "medium", "Średni"
        HIGH = "high", "Wysoki"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="assigned_tasks",
        null=True,
        blank=True,
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    has_deadline = models.BooleanField(default=True)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["status", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.has_deadline:
            self.due_date = None
        if self.status == self.Status.DONE and self.completed_at is None:
            self.completed_at = timezone.now()
        elif self.status != self.Status.DONE:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class Review(models.Model):
    author_name = models.CharField(max_length=120)
    role_label = models.CharField(max_length=120, blank=True)
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="reviews",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.author_name}: {self.rating}/5"
