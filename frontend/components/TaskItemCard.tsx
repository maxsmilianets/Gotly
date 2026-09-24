"use client";

import { getTaskProjectName } from "@/lib/tasks";
import { TaskRecord } from "@/types";

function getStatusLabel(status: TaskRecord["status"]) {
  if (status === "todo") return "Do zrobienia";
  if (status === "in_progress") return "W trakcie";
  if (status === "review") return "Do review";
  if (status === "done") return "Ukończone";
  return "Po terminie";
}

function getPriorityLabel(priority: TaskRecord["priority"]) {
  if (priority === "low") return "Niski";
  if (priority === "medium") return "Średni";
  return "Wysoki";
}

function getPriorityClasses(priority: TaskRecord["priority"]) {
  if (priority === "low") return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  if (priority === "medium") return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  return "border-rose-400/20 bg-rose-400/10 text-rose-200";
}

export function TaskItemCard({
  task,
  onEdit,
  onDelete,
  onQuickStatus,
  onStatusChange,
  canManage = true,
  canChangeStatus = true,
  assigneeLabel,
}: {
  task: TaskRecord;
  onEdit?: () => void;
  onDelete?: () => void;
  onQuickStatus?: (status: TaskRecord["status"]) => void;
  onStatusChange?: (status: TaskRecord["status"]) => void;
  canManage?: boolean;
  canChangeStatus?: boolean;
  assigneeLabel?: string;
}) {
  const handleStatusChange = onStatusChange ?? onQuickStatus;
  const person = assigneeLabel || task.assigneeName || task.assigneeEmail || "Nie przypisano";

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold">{task.title}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${getPriorityClasses(task.priority)}`}>{getPriorityLabel(task.priority)}</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-textMuted">{getStatusLabel(task.status)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-textMuted">
            <span>Projekt: {getTaskProjectName(task)}</span>
            <span>Osoba: {person}</span>
            <span>{task.deadline ? `Deadline: ${task.deadline}` : "Bez deadline'u"}</span>
          </div>
        </div>

        {canManage ? (
          <div className="flex flex-wrap gap-2">
            {onEdit ? (
              <button onClick={onEdit} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-textMuted hover:border-accent hover:text-accent">
                Edytuj
              </button>
            ) : null}
            {onDelete ? (
              <button onClick={onDelete} className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/10">
                Usuń
              </button>
            ) : null}
          </div>
        ) : (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-textMuted">Tylko status</span>
        )}
      </div>

      <p className="mt-3 text-sm text-textMuted">{task.notes}</p>

      {canChangeStatus && handleStatusChange ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => handleStatusChange("todo")} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-textMuted hover:border-white/20 hover:text-textMain">
            Do zrobienia
          </button>
          <button onClick={() => handleStatusChange("in_progress")} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-textMuted hover:border-accent hover:text-accent">
            W trakcie
          </button>
          <button onClick={() => handleStatusChange("done")} className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-background hover:scale-[1.01]">
            Ukończone
          </button>
        </div>
      ) : null}
    </article>
  );
}
