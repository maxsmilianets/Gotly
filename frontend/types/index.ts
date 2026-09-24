export type UserRole = "manager" | "member";

export type ProjectStatus = "planning" | "active" | "done";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "overdue";
export type TaskPriority = "low" | "medium" | "high";

export type TeamMember = {
  id?: number | string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  position?: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  description: string;
  notes: string;
  deadline: string;
  memberEmails: string[];
  createdByEmail?: string;
  createdByName?: string;
  createdAt: string;
  status: ProjectStatus;
  progress: number;
  tasksCount: number;
  membersCount: number;
  teamMembers: TeamMember[];
};

export type TaskRecord = {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  notes: string;
  deadline: string | null;
  hasDeadline: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeEmail?: string | null;
  assigneeName?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

export type DashboardProject = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string | null;
  tasksCount: number;
  membersCount: number;
};

export type ReviewItem = {
  id: string;
  quote: string;
  name: string;
  role: string;
  initial: string;
  rating: number;
  createdAt: string;
};
