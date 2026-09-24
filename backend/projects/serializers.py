from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Project, Review, Task

User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "display_name", "role", "position"]


class ProjectSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    member_emails = serializers.ListField(child=serializers.EmailField(), write_only=True, required=False)
    members_details = serializers.SerializerMethodField()
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    owner_name = serializers.CharField(source="owner.display_name", read_only=True)
    owner_role = serializers.CharField(source="owner.role", read_only=True)
    owner_position = serializers.CharField(source="owner.position", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "notes",
            "owner",
            "owner_email",
            "owner_name",
            "owner_role",
            "owner_position",
            "members",
            "member_emails",
            "members_details",
            "status",
            "progress",
            "due_date",
            "created_at",
            "updated_at",
            "tasks_count",
            "members_count",
        ]
        read_only_fields = [
            "owner",
            "members",
            "owner_email",
            "owner_name",
            "owner_role",
            "owner_position",
            "members_details",
            "created_at",
            "updated_at",
            "tasks_count",
            "members_count",
        ]

    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Postęp projektu musi być liczbą od 0 do 100.")
        return value

    def _resolve_member_emails(self, member_emails):
        users = []
        unknown = []
        seen = set()
        for raw_email in member_emails or []:
            email = raw_email.strip().lower()
            if not email or email in seen:
                continue
            seen.add(email)
            user = User.objects.filter(email__iexact=email).first()
            if user is None:
                unknown.append(email)
            else:
                users.append(user)

        if unknown:
            raise serializers.ValidationError({"member_emails": f"Nie znaleziono użytkownika: {', '.join(unknown)}"})
        return users

    def create(self, validated_data):
        member_emails = validated_data.pop("member_emails", [])
        project = Project.objects.create(**validated_data)
        users = self._resolve_member_emails(member_emails)
        project.members.set([project.owner, *users])
        return project

    def update(self, instance, validated_data):
        member_emails = validated_data.pop("member_emails", None)
        project = super().update(instance, validated_data)
        if member_emails is not None:
            users = self._resolve_member_emails(member_emails)
            project.members.set([project.owner, *users])
        return project

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def get_members_count(self, obj):
        ids = set(obj.members.values_list("id", flat=True))
        ids.add(obj.owner_id)
        return len(ids)

    def get_members_details(self, obj):
        members = list(obj.members.all())
        if obj.owner_id and all(member.id != obj.owner_id for member in members):
            members.append(obj.owner)
        members.sort(key=lambda user: ((user.first_name or "").lower(), (user.last_name or "").lower(), user.email.lower()))
        return ProjectMemberSerializer(members, many=True).data


class TaskSerializer(serializers.ModelSerializer):
    assignee_email = serializers.EmailField(write_only=True, required=False, allow_null=True, allow_blank=True)
    assignee_name = serializers.SerializerMethodField()
    assignee_email_read = serializers.EmailField(source="assignee.email", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "description",
            "notes",
            "assignee",
            "assignee_email",
            "assignee_email_read",
            "assignee_name",
            "status",
            "priority",
            "has_deadline",
            "due_date",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["assignee", "completed_at", "created_at", "updated_at", "assignee_name", "assignee_email_read", "project_name"]

    def validate(self, attrs):
        project = attrs.get("project") or getattr(self.instance, "project", None)
        has_deadline = attrs.get("has_deadline", getattr(self.instance, "has_deadline", True))
        due_date = attrs.get("due_date", getattr(self.instance, "due_date", None))

        if has_deadline and due_date is None:
            raise serializers.ValidationError({"due_date": "Wybierz deadline albo ustaw zadanie bez deadline'u."})

        return attrs

    def _resolve_assignee(self, project, raw_email):
        if raw_email in (None, ""):
            return None

        email = str(raw_email).strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            raise serializers.ValidationError({"assignee_email": "Nie znaleziono użytkownika o podanym e-mailu."})

        if not project.members.filter(pk=user.pk).exists() and project.owner_id != user.pk:
            raise serializers.ValidationError({"assignee_email": "Wybrana osoba nie należy do tego projektu."})

        return user

    def create(self, validated_data):
        raw_assignee_email = validated_data.pop("assignee_email", None)
        project = validated_data["project"]
        validated_data["assignee"] = self._resolve_assignee(project, raw_assignee_email)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        raw_assignee_email = validated_data.pop("assignee_email", serializers.empty)
        if raw_assignee_email is not serializers.empty:
            project = validated_data.get("project") or instance.project
            validated_data["assignee"] = self._resolve_assignee(project, raw_assignee_email)
        return super().update(instance, validated_data)

    def get_assignee_name(self, obj):
        return obj.assignee.display_name if obj.assignee else None


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "author_name", "role_label", "quote", "rating", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Ocena musi być od 1 do 5.")
        return value
