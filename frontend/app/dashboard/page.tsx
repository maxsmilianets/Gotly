"use client";

import Link from "next/link";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { NewProjectModal } from "@/components/NewProjectModal";
import { ProjectProgressCard } from "@/components/ProjectProgressCard";
import { StatCard } from "@/components/StatCard";
import { useToast } from "@/components/ToastProvider";
import { getCurrentUser, getDisplayName, getRoleLabel, isAuthenticated } from "@/lib/auth";
import { createProject, getProjectsForUser, mapProjectsToDashboardCards } from "@/lib/projects";
import { countOverdueTasks, getAllTasks, getTaskProjectName } from "@/lib/tasks";
import { ProjectRecord, TaskRecord } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatDate(date?: string | null) {
  if (!date) return "Brak daty";
  return new Date(date).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [sessionReady, setSessionReady] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setSessionReady(true);
  }, []);

  const currentUser = sessionReady ? getCurrentUser() : null;
  const canManageProjects = currentUser?.role === "manager";
  const userName = useMemo(() => (currentUser ? getDisplayName(currentUser) : "Gość"), [currentUser]);
  const roleLabel = currentUser ? getRoleLabel(currentUser.role, currentUser.position) : "Niezalogowany użytkownik";

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [projectsFromApi, tasksFromApi] = await Promise.all([getProjectsForUser(), getAllTasks()]);
      setProjects(projectsFromApi);
      setTasks(tasksFromApi);
    } catch (error) {
      addToast("Nie udało się pobrać danych.", "error");
    } finally {
      setLoadingData(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    loadDashboardData();
  }, [loadDashboardData, router, sessionReady]);

  const visibleProjects = useMemo(() => mapProjectsToDashboardCards(projects), [projects]);
  const recentCompletedTasks = useMemo(
    () =>
      [...tasks]
        .filter((task) => task.status === "done")
        .sort((a, b) => new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime())
        .slice(0, 8),
    [tasks],
  );

  const computedStats = useMemo(() => {
    const projectStatus = visibleProjects.reduce(
      (accumulator, project) => {
        accumulator.total += 1;
        if (project.status === "active") accumulator.active += 1;
        if (project.status === "planning") accumulator.planning += 1;
        if (project.status === "done") accumulator.done += 1;
        return accumulator;
      },
      { total: 0, active: 0, planning: 0, done: 0 },
    );

    return {
      totalProjects: projectStatus.total,
      activeProjects: projectStatus.active,
      planningProjects: projectStatus.planning,
      doneProjects: projectStatus.done,
      myTasks: tasks.length,
      overdueTasks: countOverdueTasks(tasks),
    };
  }, [visibleProjects, tasks]);

  const openNewProjectModal = () => {
    if (!isAuthenticated()) {
      router.push("/login?redirect=/dashboard");
      return;
    }

    if (!canManageProjects) {
      addToast("Tylko manager może tworzyć projekty.", "error");
      return;
    }

    setIsProjectModalOpen(true);
  };

  const handleCreateProject = async (payload: { name: string; description: string; notes: string; deadline: string; memberEmails: string[] }) => {
    if (!canManageProjects) {
      throw new Error("Tylko Project Manager może tworzyć projekty.");
    }

    try {
      await createProject(payload);
      await loadDashboardData();
      addToast("Projekt zapisany.", "success");
      setIsProjectModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PROJECT_NAME_REQUIRED") throw new Error("Podaj nazwę projektu.");
        if (error.message === "PROJECT_NOTES_REQUIRED") throw new Error("Dodaj uwagi do projektu.");
        if (error.message === "PROJECT_DEADLINE_REQUIRED") throw new Error("Wybierz deadline projektu.");
      }
      throw error;
    }
  };

  if (!sessionReady || !currentUser) {
    return (
      <main className="dashboard-shell py-4 md:py-5">
        <div className="panel p-6 text-lg text-textMuted">Ładowanie dashboardu...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell py-4 md:py-5">
      <div className="dashboard-layout">
        <DashboardSidebar userName={userName} roleLabel={roleLabel} activeItem="Dashboard" />
        <section className="dashboard-content">
          <div className="panel p-5 sm:p-6 xl:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-accent sm:text-sm">Panel główny</p>
                <h1 className="mt-3 text-3xl font-black sm:text-4xl 2xl:text-5xl">Główna strona zarządzania projektami</h1>
                <p className="mt-3 max-w-4xl text-sm text-textMuted sm:text-base xl:text-lg">
                  Zobacz swoje projekty.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/projekty" className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-textMuted transition hover:border-accent hover:text-accent sm:px-5">
                  Otwórz projekty
                </Link>
                {canManageProjects ? (
                  <button onClick={openNewProjectModal} className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-background transition hover:scale-[1.01] sm:px-5">
                    + Nowy projekt
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <StatCard value={loadingData ? "..." : String(computedStats.totalProjects)} label="Wszystkich projektów" accent />
            <StatCard value={loadingData ? "..." : String(computedStats.activeProjects)} label="Aktywnych projektów" />
            <StatCard value={loadingData ? "..." : String(computedStats.myTasks)} label="Zadań w projektach" />
            <StatCard value={loadingData ? "..." : String(computedStats.overdueTasks)} label="Po terminie" />
          </div>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
            <div className="panel p-5 sm:p-6 xl:p-7">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">Informacje o projektach</h2>
                  <p className="mt-2 text-sm text-textMuted">Centralna część dashboardu pokazuje projekty, do których masz dostęp.</p>
                </div>
                <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-sm text-textMuted">Ukończone projekty: {computedStats.doneProjects}</span>
              </div>

              {visibleProjects.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {visibleProjects.slice(0, 6).map((project) => (
                    <ProjectProgressCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <h3 className="text-2xl font-bold">{loadingData ? "Pobieranie projektów..." : "Brak projektów do wyświetlenia"}</h3>
                  {!loadingData ? (
                    <p className="mx-auto mt-3 max-w-2xl text-textMuted">
                      {canManageProjects
                        ? "Utwórz pierwszy projekt, aby zobaczyć go na dashboardzie."
                        : "Gdy Project Manager przypisze Cię do projektu, zobaczysz go tutaj."}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="panel p-5 sm:p-6 xl:p-7">
              <h2 className="text-2xl font-bold sm:text-3xl">Ostatnie wykonane zadania</h2>
              <p className="mt-2 text-sm text-textMuted">Lista ostatnio ukończonych zadań w Twoich projektach.</p>

              {recentCompletedTasks.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                  {recentCompletedTasks.map((task) => (
                    <article key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-textMain">{task.title}</h3>
                          <p className="mt-1 text-sm text-textMuted">{getTaskProjectName(task, projects)}</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">Ukończone</span>
                      </div>
                      <p className="mt-2 text-sm text-textMuted">{task.notes}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-textMuted">{formatDate(task.completedAt ?? task.createdAt)}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-textMuted">
                  {loadingData ? "Pobieranie zadań..." : "Brak ukończonych zadań do pokazania."}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <NewProjectModal open={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onCreate={handleCreateProject} />
    </main>
  );
}
