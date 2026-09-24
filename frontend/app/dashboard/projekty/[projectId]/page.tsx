"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { NewTaskModal } from "@/components/NewTaskModal";
import { TaskItemCard } from "@/components/TaskItemCard";
import { useToast } from "@/components/ToastProvider";
import { getCurrentUser, getDisplayName, getRoleLabel, isAuthenticated } from "@/lib/auth";
import { countProjectPeople, getProjectAccessibleBy } from "@/lib/projects";
import { createTask, deleteTask, getTasksForProject, updateTask, updateTaskStatus } from "@/lib/tasks";
import { ProjectRecord, TaskRecord, TaskStatus } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatDate(date?: string | null) {
  if (!date) return "Brak daty";
  return new Date(date).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [sessionReady, setSessionReady] = useState(false);
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setSessionReady(true);
  }, []);

  const currentUser = sessionReady ? getCurrentUser() : null;
  const userName = currentUser ? getDisplayName(currentUser) : "Gość";
  const roleLabel = currentUser ? getRoleLabel(currentUser.role, currentUser.position) : "Niezalogowany użytkownik";
  const canManageProject = Boolean(currentUser && project?.createdByEmail?.toLowerCase() === currentUser.email.toLowerCase() && currentUser.role === "manager");

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [projectFromApi, tasksFromApi] = await Promise.all([getProjectAccessibleBy(projectId), getTasksForProject(projectId)]);
      setProject(projectFromApi);
      setTasks(tasksFromApi);
      if (!projectFromApi) addToast("Nie masz dostępu do tego projektu.", "error");
    } catch (error) {
      addToast("Nie udało się pobrać projektu.", "error");
    } finally {
      setLoadingData(false);
    }
  }, [projectId, addToast]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/dashboard/projekty/${projectId}`);
      return;
    }
    loadData();
  }, [loadData, projectId, router, sessionReady]);

  const taskStats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length,
    }),
    [tasks],
  );

  const handleCreateTask = async (payload: {
    projectId: string;
    title: string;
    notes: string;
    hasDeadline: boolean;
    deadline?: string | null;
    status: TaskStatus;
    priority: TaskRecord["priority"];
    assigneeEmail?: string | null;
  }) => {
    try {
      await createTask(payload);
      await loadData();
      setIsTaskModalOpen(false);
      addToast("Zadanie zapisane.", "success");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Nie udało się utworzyć zadania.");
    }
  };

  const handleUpdateTask = async (payload: {
    projectId: string;
    title: string;
    notes: string;
    hasDeadline: boolean;
    deadline?: string | null;
    status: TaskStatus;
    priority: TaskRecord["priority"];
    assigneeEmail?: string | null;
  }) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, payload);
      await loadData();
      setEditingTask(null);
      addToast("Zadanie zaktualizowane.", "success");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Nie udało się zapisać zadania.");
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      await loadData();
      addToast("Status zmieniony.", "success");
    } catch (error) {
      addToast("Nie udało się zmienić statusu.", "error");
    }
  };

  const handleDeleteTask = async (task: TaskRecord) => {
    if (!confirm(`Usunąć zadanie „${task.title}”?`)) return;
    try {
      await deleteTask(task.id);
      await loadData();
      addToast("Zadanie usunięte.", "success");
    } catch (error) {
      addToast("Nie udało się usunąć zadania.", "error");
    }
  };

  if (!sessionReady || !currentUser) {
    return (
      <main className="dashboard-shell py-4 md:py-5">
        <div className="panel p-6 text-lg text-textMuted">Ładowanie projektu...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell py-4 md:py-5">
      <div className="dashboard-layout">
        <DashboardSidebar userName={userName} roleLabel={roleLabel} activeItem="Projekty" />

        <section className="dashboard-content">
          <div className="panel p-5 sm:p-6 xl:p-7">
            <Link href="/dashboard/projekty" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
              ← Wróć do listy projektów
            </Link>

            {project ? (
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-accent sm:text-sm">Szczegóły projektu</p>
                  <h1 className="mt-3 text-3xl font-black sm:text-4xl 2xl:text-5xl">{project.name}</h1>
                  <p className="mt-3 max-w-4xl text-sm text-textMuted sm:text-base xl:text-lg">{project.description || project.notes}</p>
                </div>
                {canManageProject ? (
                  <button onClick={() => setIsTaskModalOpen(true)} className="w-fit rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-background transition hover:scale-[1.01]">
                    + Dodaj zadanie
                  </button>
                ) : null}
              </div>
            ) : (
              <h1 className="text-3xl font-black">{loadingData ? "Pobieranie projektu..." : "Projekt niedostępny"}</h1>
            )}
          </div>

          {project ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.7fr)]">
              <section className="panel p-4 sm:p-5 xl:p-6">
                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Wszystkie</p>
                    <p className="mt-2 text-3xl font-black">{taskStats.total}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Do zrobienia</p>
                    <p className="mt-2 text-3xl font-black">{taskStats.todo}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-textMuted">W trakcie</p>
                    <p className="mt-2 text-3xl font-black">{taskStats.inProgress}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Ukończone</p>
                    <p className="mt-2 text-3xl font-black">{taskStats.done}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {tasks.map((task) => (
                    <TaskItemCard
                      key={task.id}
                      task={task}
                      canManage={canManageProject}
                      canChangeStatus
                      onEdit={() => setEditingTask(task)}
                      onDelete={() => handleDeleteTask(task)}
                      onStatusChange={(status) => handleStatusChange(task.id, status)}
                    />
                  ))}
                </div>

                {tasks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-textMuted">
                    {loadingData ? "Pobieranie zadań..." : canManageProject ? "Dodaj pierwsze zadanie do tego projektu." : "Ten projekt nie ma jeszcze zadań."}
                  </div>
                ) : null}
              </section>

              <aside className="panel h-fit p-4 sm:p-5 xl:p-6 xl:sticky xl:top-5">
                <h2 className="text-2xl font-bold">Informacje</h2>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Deadline projektu</p>
                    <p className="mt-2 font-semibold">{formatDate(project.deadline)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Postęp</p>
                    <p className="mt-2 font-semibold">{project.progress}%</p>
                    <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} /></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Uwagi</p>
                    <p className="mt-2 text-sm text-textMuted">{project.notes || "Brak uwag."}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="font-bold">Zespół projektu ({countProjectPeople(project)})</h3>
                  <div className="mt-3 space-y-2">
                    {(project.teamMembers ?? []).map((member) => (
                      <div key={member.email} className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                        <p className="font-semibold">{member.displayName}</p>
                        <p className="text-textMuted">{member.email}</p>
                        <p className="mt-1 text-xs text-accent">{member.role === "manager" ? member.position || "Project Manager" : "Członek zespołu"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          ) : null}
        </section>
      </div>

      <NewTaskModal open={isTaskModalOpen} projects={project ? [project] : []} onClose={() => setIsTaskModalOpen(false)} onSubmit={handleCreateTask} />
      <NewTaskModal open={Boolean(editingTask)} mode="edit" task={editingTask} projects={project ? [project] : []} onClose={() => setEditingTask(null)} onSubmit={handleUpdateTask} />
    </main>
  );
}
