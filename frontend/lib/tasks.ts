import { api } from "@/lib/api";
import { ProjectRecord, TaskPriority, TaskRecord, TaskStatus } from "@/types";

export type ApiTask = {
  id: number | string;
  project: number | string;
  project_name?: string;
  title: string;
  description?: string;
  notes?: string;
  assignee_email_read?: string | null;
  assignee_name?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  has_deadline: boolean;
  due_date: string | null;
  completed_at?: string | null;
  created_at?: string | null;
};

export function mapApiTask(task: ApiTask): TaskRecord {
  return {
    id: String(task.id),
    projectId: String(task.project),
    projectName: task.project_name,
    title: task.title,
    notes: task.notes || task.description || "",
    deadline: task.due_date,
    hasDeadline: task.has_deadline,
    status: task.status,
    priority: task.priority,
    assigneeEmail: task.assignee_email_read,
    assigneeName: task.assignee_name,
    createdAt: task.created_at ?? new Date().toISOString(),
    completedAt: task.completed_at,
  };
}

export async function getAllTasks(): Promise<TaskRecord[]> {
  const response = await api.get<ApiTask[]>("/tasks/");
  return response.data.map(mapApiTask);
}

export async function getTasksForProject(projectId: string): Promise<TaskRecord[]> {
  const tasks = await getAllTasks();
  return tasks.filter((task) => task.projectId === String(projectId));
}

export async function createTask(payload: {
  projectId: string;
  title: string;
  notes: string;
  hasDeadline: boolean;
  deadline?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeEmail?: string | null;
}) {
  if (!payload.projectId) throw new Error("TASK_PROJECT_REQUIRED");
  if (!payload.title.trim()) throw new Error("TASK_TITLE_REQUIRED");
  if (!payload.notes.trim()) throw new Error("TASK_NOTES_REQUIRED");
  if (payload.hasDeadline && !payload.deadline) throw new Error("TASK_DEADLINE_REQUIRED");

  const response = await api.post<ApiTask>("/tasks/", {
    project: payload.projectId,
    title: payload.title.trim(),
    description: payload.notes.trim(),
    notes: payload.notes.trim(),
    has_deadline: payload.hasDeadline,
    due_date: payload.hasDeadline ? payload.deadline : null,
    status: payload.status,
    priority: payload.priority,
    assignee_email: payload.assigneeEmail || null,
  });

  return mapApiTask(response.data);
}

export async function updateTask(
  taskId: string,
  payload: {
    projectId: string;
    title: string;
    notes: string;
    hasDeadline: boolean;
    deadline?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeEmail?: string | null;
  },
) {
  if (!payload.projectId) throw new Error("TASK_PROJECT_REQUIRED");
  if (!payload.title.trim()) throw new Error("TASK_TITLE_REQUIRED");
  if (!payload.notes.trim()) throw new Error("TASK_NOTES_REQUIRED");
  if (payload.hasDeadline && !payload.deadline) throw new Error("TASK_DEADLINE_REQUIRED");

  const response = await api.patch<ApiTask>(`/tasks/${taskId}/`, {
    project: payload.projectId,
    title: payload.title.trim(),
    description: payload.notes.trim(),
    notes: payload.notes.trim(),
    has_deadline: payload.hasDeadline,
    due_date: payload.hasDeadline ? payload.deadline : null,
    status: payload.status,
    priority: payload.priority,
    assignee_email: payload.assigneeEmail || null,
  });

  return mapApiTask(response.data);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const response = await api.patch<ApiTask>(`/tasks/${taskId}/`, { status });
  return mapApiTask(response.data);
}

export async function deleteTask(taskId: string) {
  await api.delete(`/tasks/${taskId}/`);
}

export function countOverdueTasks(tasks: TaskRecord[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks.filter((task) => task.hasDeadline && task.deadline && new Date(task.deadline) < today && task.status !== "done").length;
}

export function getTaskProjectName(task: TaskRecord, projects: ProjectRecord[] = []) {
  return task.projectName || projects.find((project) => project.id === task.projectId)?.name || "Projekt";
}
