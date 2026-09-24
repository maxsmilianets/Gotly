import { api } from "@/lib/api";
import { DashboardProject, ProjectRecord, ProjectStatus, TeamMember } from "@/types";

export type ApiProject = {
  id: number | string;
  name: string;
  description?: string;
  notes?: string;
  owner_email?: string;
  owner_name?: string;
  members_details?: Array<{
    id?: number | string;
    email: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    role?: "manager" | "member";
    position?: string;
  }>;
  status: ProjectStatus;
  progress: number;
  due_date: string | null;
  created_at: string;
  tasks_count?: number;
  members_count?: number;
};

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function mapMember(member: NonNullable<ApiProject["members_details"]>[number]): TeamMember {
  const firstName = member.first_name ?? "";
  const lastName = member.last_name ?? "";
  const displayName = member.display_name || [firstName, lastName].filter(Boolean).join(" ").trim() || member.email;

  return {
    id: member.id,
    email: member.email,
    firstName,
    lastName,
    displayName,
    role: member.role ?? "member",
    position: member.position ?? "",
  };
}

export function mapApiProject(project: ApiProject): ProjectRecord {
  const teamMembers = (project.members_details ?? []).map(mapMember);
  const ownerEmail = normalizeEmail(project.owner_email);
  const memberEmails = teamMembers
    .map((member) => normalizeEmail(member.email))
    .filter((email) => email && email !== ownerEmail);

  return {
    id: String(project.id),
    name: project.name,
    description: project.description ?? "",
    notes: project.notes ?? "",
    deadline: project.due_date ?? "",
    memberEmails,
    createdByEmail: project.owner_email,
    createdByName: project.owner_name,
    createdAt: project.created_at,
    status: project.status,
    progress: project.progress,
    tasksCount: project.tasks_count ?? 0,
    membersCount: project.members_count ?? teamMembers.length,
    teamMembers,
  };
}

export async function getProjectsForUser(): Promise<ProjectRecord[]> {
  const response = await api.get<ApiProject[]>("/projects/");
  return response.data.map(mapApiProject);
}

export async function getProjectAccessibleBy(projectId: string): Promise<ProjectRecord | null> {
  try {
    const response = await api.get<ApiProject>(`/projects/${projectId}/`);
    return mapApiProject(response.data);
  } catch {
    return null;
  }
}

export async function createProject(payload: {
  name: string;
  description: string;
  notes: string;
  deadline: string;
  memberEmails: string[];
}) {
  if (!payload.name.trim()) throw new Error("PROJECT_NAME_REQUIRED");
  if (!payload.notes.trim()) throw new Error("PROJECT_NOTES_REQUIRED");
  if (!payload.deadline) throw new Error("PROJECT_DEADLINE_REQUIRED");

  const response = await api.post<ApiProject>("/projects/", {
    name: payload.name.trim(),
    description: payload.description.trim(),
    notes: payload.notes.trim(),
    due_date: payload.deadline,
    member_emails: payload.memberEmails.map(normalizeEmail).filter(Boolean),
  });

  return mapApiProject(response.data);
}

export async function updateProject(
  projectId: string,
  payload: {
    name: string;
    description: string;
    notes: string;
    deadline: string;
    memberEmails: string[];
    status: ProjectStatus;
    progress: number;
  },
) {
  if (!payload.name.trim()) throw new Error("PROJECT_NAME_REQUIRED");
  if (!payload.notes.trim()) throw new Error("PROJECT_NOTES_REQUIRED");
  if (!payload.deadline) throw new Error("PROJECT_DEADLINE_REQUIRED");
  if (Number.isNaN(payload.progress) || payload.progress < 0 || payload.progress > 100) throw new Error("PROJECT_PROGRESS_INVALID");

  const response = await api.patch<ApiProject>(`/projects/${projectId}/`, {
    name: payload.name.trim(),
    description: payload.description.trim(),
    notes: payload.notes.trim(),
    due_date: payload.deadline,
    member_emails: payload.memberEmails.map(normalizeEmail).filter(Boolean),
    status: payload.status,
    progress: payload.progress,
  });

  return mapApiProject(response.data);
}

export async function deleteProject(projectId: string) {
  await api.delete(`/projects/${projectId}/`);
}

export function countProjectPeople(project: ProjectRecord) {
  return project.membersCount || new Set([project.createdByEmail, ...project.memberEmails].map(normalizeEmail).filter(Boolean)).size;
}

export function mapProjectsToDashboardCards(projects: ProjectRecord[]): DashboardProject[] {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description || project.notes,
    status: project.status,
    progress: project.progress,
    dueDate: project.deadline || null,
    tasksCount: project.tasksCount,
    membersCount: countProjectPeople(project),
  }));
}
