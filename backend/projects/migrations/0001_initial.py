from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Project",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=180)),
                ("description", models.TextField(blank=True)),
                ("notes", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("planning", "Zaplanowany"), ("active", "Aktywne"), ("done", "Ukończone")], default="planning", max_length=20)),
                ("progress", models.PositiveIntegerField(default=0)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("members", models.ManyToManyField(blank=True, related_name="team_projects", to=settings.AUTH_USER_MODEL)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="owned_projects", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Review",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("author_name", models.CharField(max_length=120)),
                ("role_label", models.CharField(blank=True, max_length=120)),
                ("quote", models.TextField()),
                ("rating", models.PositiveSmallIntegerField(default=5)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="reviews", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=180)),
                ("description", models.TextField(blank=True)),
                ("notes", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("todo", "Do zrobienia"), ("in_progress", "W toku"), ("review", "Do review"), ("done", "Ukończone"), ("overdue", "Po terminie")], default="todo", max_length=20)),
                ("priority", models.CharField(choices=[("low", "Niski"), ("medium", "Średni"), ("high", "Wysoki")], default="medium", max_length=20)),
                ("has_deadline", models.BooleanField(default=True)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("assignee", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assigned_tasks", to=settings.AUTH_USER_MODEL)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks", to="projects.project")),
            ],
            options={"ordering": ["status", "-created_at"]},
        ),
    ]
