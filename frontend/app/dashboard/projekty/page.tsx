"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { NewProjectModal } from "@/components/NewProjectModal";
import { ProjectEditModal } from "@/components/ProjectEditModal";
import { useToast } from "@/components/ToastProvider";
import { getCurrentUser, getDisplayName, getRoleLabel, isAuthenticated } from "@/lib/auth";
import { countProjectPeople, createProject, deleteProject, getProjectsForUser, updateProject } from "@/lib/projects";
import { getAllTasks, getTaskProjectName } from "@/lib/tasks";
import { ProjectRecord, TaskRecord } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function statusLabel(status: ProjectRecord["status"]) {
  const labels = {
    planning: "Zaplanowany",
    active: "Aktywny",
    done: "Ukończony",
  } as const;
  return labels[status];
}

function statusClass(status: ProjectRecord["status"]) {
  const classes = {
    planning: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    active: "border-accent/20 bg-accent/10 text-accent",
    done: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  } as const;
  return classes[status];
}

function formatDate(date?: string | null) {
  if (!date) return "Brak daty";
  return new Date(date).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ProjectsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [sessionReady, setSessionReady] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setSessionReady(true);
  }, []);

  const currentUser = sessionReady ? getCurrentUser() : null;
  const userName = currentUser ? getDisplayName(currentUser) : "Gość";
  const roleLabel = currentUser ? getRoleLabel(currentUser.role, currentUser.position) : "Niezalogowany użytkownik";
  const canManageProjects = currentUser?.role === "manager";

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [projectsFromApi, tasksFromApi] = await Promise.all([getProjectsForUser(), getAllTasks()]);
      setProjects(projectsFromApi);
      setTasks(tasksFromApi);
      setSelectedProjectId((previous) => previous ?? projectsFromApi[0]?.id ?? null);
    } catch (error) {
      addToast("Nie udało się pobrać projektów.", "error");
    } finally {
      setLoadingData(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/dashboard/projekty");
      return;
    }
    loadData();
  }, [loadData, router, sessionReady]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null,
    [projects, selectedProjectId],
  );

  const selectedProjectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === selectedProject?.id),
    [tasks, selectedProject?.id],
  );

  const latestTasks = useMemo(
    () => [...selectedProjectTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [selectedProjectTasks],
  );

  const handleCreateProject = async (payload: { name: string; description: string; notes: string; deadline: string; memberEmails: string[] }) => {
    try {
      const created = await createProject(payload);
      await loadData();
      setSelectedProjectId(created.id);
      setIsCreateOpen(false);
      addToast("Projekt zapisany.", "success");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Nie udało się utworzyć projektu.");
    }
  };

  const handleSaveProject = async (payload: {
    name: string;
    description: string;
    notes: string;
    deadline: string;
    memberEmails: string[];
    status: ProjectRecord["status"];
    progress: number;
  }) => {
    if (!editingProject) return;
    try {
      const updated = await updateProject(editingProject.id, payload);
      await loadData();
      setSelectedProjectId(updated.id);
      setEditingProject(null);
      addToast("Projekt zaktualizowany.", "success");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Nie udało się zapisać projektu.");
    }
  };

  const handleDeleteProject = async (project: ProjectRecord) => {
    if (!confirm(`Usunąć projekt „${project.name}” razem z zadaniami?`)) return;

    try {
      await deleteProject(project.id);
      await loadData();
      setSelectedProjectId(null);
      addToast("Projekt usunięty.", "success");
    } catch (error) {
      addToast("Nie udało się usunąć projektu.", "error");
    }
  };

  if (!sessionReady || !currentUser) {
    return (
      <main className="dashboard-shell py-4 md:py-5">
        <div className="panel p-6 text-lg text-textMuted">Ładowanie projektów...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell py-4 md:py-5">
      <div className="dashboard-layout">
        <DashboardSidebar userName={userName} roleLabel={roleLabel} activeItem="Projekty" />

        <section className="dashboard-content">
          <div className="panel p-5 sm:p-6 xl:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-accent sm:text-sm">Centrum projektów</p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl 2xl:text-5xl">Moje projekty</h1>
                <p className="mt-3 max-w-4xl text-sm text-textMuted sm:text-base xl:text-lg">
                  Wybierz projekt z listy.
                </p>
              </div>
              {canManageProjects ? (
                <button onClick={() => setIsCreateOpen(true)} className="w-fit rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-background transition hover:scale-[1.01]">
                  + Nowy projekt
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid min-h-[70vh] gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.8fr)]">
            <section className="panel p-4 sm:p-5 xl:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Lista projektów</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-textMuted">{projects.length}</span>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project) => {
                    const isSelected = selectedProject?.id === project.id;
                    return (
                      <article
                        key={project.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedProjectId(project.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") setSelectedProjectId(project.id);
                        }}
                        className={`grid cursor-pointer gap-4 rounded-3xl border p-4 transition md:grid-cols-[minmax(0,1fr)_130px_120px_110px] md:items-center ${
                          isSelected ? "border-accent bg-accent/10 shadow-glow" : "border-white/10 bg-white/[0.03] hover:border-accent/50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-xl font-bold">{project.name}</h3>
                            <span className={`rounded-full border px-3 py-1 text-xs ${statusClass(project.status)}`}>{statusLabel(project.status)}</span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-textMuted">{project.description || project.notes}</p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Deadline</p>
                          <p className="mt-1 text-sm font-semibold">{formatDate(project.deadline)}</p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Osoby</p>
                          <p className="mt-1 text-sm font-semibold">{countProjectPeople(project)} w zespole</p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Postęp</p>
                          <p className="mt-1 text-sm font-semibold">{project.progress}%</p>
                          <div className="mt-2 h-2 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                  <h3 className="text-2xl font-bold">{loadingData ? "Pobieranie projektów..." : "Nie masz jeszcze projektów"}</h3>
                  {!loadingData ? <p className="mt-3 text-textMuted">Projekty pojawią się tutaj po dodaniu.</p> : null}
                </div>
              )}
            </section>

            <aside className="panel h-fit p-4 sm:p-5 xl:p-6 xl:sticky xl:top-5">
              {selectedProject ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.22em] text-accent">Szczegóły projektu</p>
                      <h2 className="mt-3 min-w-0 text-2xl font-black">{selectedProject.name}</h2>
                      <p className="mt-2 text-sm text-textMuted">{selectedProject.description || "Brak krótkiego opisu."}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-textMuted">Status projektu</p>
                      <span className={`rounded-full border px-3 py-1 text-xs ${statusClass(selectedProject.status)}`}>{statusLabel(selectedProject.status)}</span>
                      {canManageProjects && selectedProject.createdByEmail?.toLowerCase() === currentUser.email.toLowerCase() ? (
                        <button onClick={() => setEditingProject(selectedProject)} className="mt-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-textMuted transition hover:border-accent hover:text-accent">
                          Edytuj projekt
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Deadline</p>
                      <p className="mt-2 font-semibold">{formatDate(selectedProject.deadline)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-textMuted">Uwagi</p>
                      <p className="mt-2 text-sm text-textMuted">{selectedProject.notes || "Brak uwag."}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="font-bold">Zespół projektu ({countProjectPeople(selectedProject)})</h3>
                    <div className="mt-3 space-y-2">
                      {(selectedProject.teamMembers ?? []).map((member) => (
                        <div key={member.email} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{member.displayName}</p>
                            <p className="truncate text-textMuted">{member.email}</p>
                          </div>
                          <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-textMuted">
                            {member.role === "manager" ? member.position || "Manager" : "Członek"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">Zadania projektu</h3>
                      <Link href={`/dashboard/projekty/${selectedProject.id}`} className="text-sm font-semibold text-accent">Otwórz</Link>
                    </div>
                    {latestTasks.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {latestTasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-white/10 bg-background/30 p-3 text-sm">
                            <p className="font-semibold">{task.title}</p>
                            <p className="mt-1 text-textMuted">{getTaskProjectName(task, projects)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-textMuted">Ten projekt nie ma jeszcze zadań.</p>
                    )}
                  </div>

                  {canManageProjects && selectedProject.createdByEmail?.toLowerCase() === currentUser.email.toLowerCase() ? (
                    <div className="mt-5">
                      <button onClick={() => handleDeleteProject(selectedProject)} className="w-full rounded-2xl border border-rose-400/20 px-4 py-3 font-semibold text-rose-200 transition hover:bg-rose-400/10">
                        Usuń projekt
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-textMuted">Wybierz projekt z listy.</div>
              )}
            </aside>
          </div>
        </section>
      </div>

      <NewProjectModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateProject} />
      <ProjectEditModal open={Boolean(editingProject)} project={editingProject} onClose={() => setEditingProject(null)} onSave={handleSaveProject} />
    </main>
  );
}
