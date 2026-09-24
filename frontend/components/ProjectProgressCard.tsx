import Link from "next/link";
import { DashboardProject } from "@/types";

function getStatusLabel(status: DashboardProject["status"]) {
  if (status === "planning") return "Zaplanowany";
  if (status === "active") return "Aktywny";
  return "Ukończony";
}

export function ProjectProgressCard({ project }: { project: DashboardProject }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">{project.name}</h3>
          <p className="mt-1 text-textMuted">{project.description}</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-textMuted">
          {getStatusLabel(project.status)}
        </span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-textMuted">
        <span>Postęp: {project.progress}%</span>
        <span>Zadania: {project.tasksCount}</span>
        <span>Osoby: {project.membersCount}</span>
        <span>{project.dueDate ? `Deadline: ${project.dueDate}` : "Bez deadline'u"}</span>
      </div>

      <div className="mt-5">
        <Link
          href={`/dashboard/projekty/${project.id}`}
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-textMuted transition hover:border-accent hover:text-accent"
        >
          Otwórz projekt
        </Link>
      </div>
    </article>
  );
}
