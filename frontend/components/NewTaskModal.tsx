"use client";

import { useToast } from "@/components/ToastProvider";
import { ProjectRecord, TaskRecord, TaskPriority, TaskStatus } from "@/types";
import { FormEvent, useEffect, useMemo, useState } from "react";

type TaskModalProps = {
  open: boolean;
  mode?: "create" | "edit";
  task?: TaskRecord | null;
  projects: ProjectRecord[];
  onClose: () => void;
  onSubmit: (payload: {
    projectId: string;
    title: string;
    notes: string;
    hasDeadline: boolean;
    deadline?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeEmail?: string | null;
  }) => void | Promise<void>;
};

export function NewTaskModal({
  open,
  mode = "create",
  task,
  projects,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const { addToast } = useToast();
  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [projectId, setProjectId] = useState(task?.projectId ?? projects[0]?.id ?? "");
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [hasDeadline, setHasDeadline] = useState(task?.hasDeadline ?? true);
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [assigneeEmail, setAssigneeEmail] = useState(task?.assigneeEmail ?? "");

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId) ?? projects[0] ?? null,
    [projectId, projects],
  );

  const assignablePeople = useMemo(() => {
    const items = (selectedProject?.teamMembers ?? []).map((member) => {
      const roleLabel = member.role === "manager" ? member.position || "Project Manager" : "Członek zespołu";
      return {
        email: member.email,
        label: `${member.displayName} — ${roleLabel}`,
      };
    });

    if (task?.assigneeEmail && !items.some((item) => item.email === task.assigneeEmail)) {
      items.push({ email: task.assigneeEmail, label: task.assigneeName || task.assigneeEmail });
    }

    return items;
  }, [selectedProject, task?.assigneeEmail, task?.assigneeName]);

  useEffect(() => {
    if (!open) return;
    setProjectId(task?.projectId ?? projects[0]?.id ?? "");
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setHasDeadline(task?.hasDeadline ?? true);
    setDeadline(task?.deadline ?? "");
    setStatus(task?.status ?? "todo");
    setPriority(task?.priority ?? "medium");
    setAssigneeEmail(task?.assigneeEmail ?? "");
  }, [open, task, projects]);

  useEffect(() => {
    if (!open) return;
    if (assigneeEmail && assignablePeople.some((person) => person.email === assigneeEmail)) return;
    setAssigneeEmail("");
  }, [assignablePeople, assigneeEmail, open]);

  if (!open) return null;

  const submitLabel = mode === "edit" ? "Zapisz zadanie" : "Dodaj zadanie";
  const titleLabel = mode === "edit" ? "Edytuj zadanie" : "Nowe zadanie";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await onSubmit({
        projectId,
        title,
        notes,
        hasDeadline,
        deadline: hasDeadline ? deadline : null,
        status,
        priority,
        assigneeEmail: assigneeEmail || null,
      });
    } catch (submissionError) {
      addToast("Nie udało się zapisać zadania.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="panel relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-white/10 px-3 py-2 text-sm text-textMuted transition hover:border-accent hover:text-accent"
        >
          Zamknij
        </button>

        <div className="pr-20">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">{mode === "edit" ? "Edycja" : "Moje zadania"}</p>
          <h2 className="mt-3 text-4xl font-black">{titleLabel}</h2>
          <p className="mt-3 text-lg text-textMuted">
            Dodaj zadanie do projektu, uwagi oraz deadline.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Projekt</span>
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} required disabled={mode === "edit"}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Osoba przypisana do zadania</span>
            <select value={assigneeEmail} onChange={(event) => setAssigneeEmail(event.target.value)}>
              <option value="">Bez przypisanej osoby</option>
              {assignablePeople.map((person) => (
                <option key={person.email} value={person.email}>
                  {person.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Nazwa zadania</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="wpisz nazwę zadania" required />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Uwagi do zadania</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="wpisz uwagi do zadania" required />
          </label>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
                <option value="todo">Do zrobienia</option>
                <option value="in_progress">W trakcie</option>
                <option value="done">Ukończone</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Priorytet</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                <option value="low">Niski</option>
                <option value="medium">Średni</option>
                <option value="high">Wysoki</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Deadline</span>
              <input type="date" min={minDate} value={deadline} onChange={(event) => setDeadline(event.target.value)} disabled={!hasDeadline} required={hasDeadline} />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-textMuted">
            <input type="checkbox" checked={!hasDeadline} onChange={(event) => setHasDeadline(!event.target.checked)} className="h-4 w-4" />
            Zadanie bez deadline'u
          </label>


          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-textMuted transition hover:border-accent hover:text-accent">
              Anuluj
            </button>
            <button type="submit" className="rounded-2xl bg-accent px-5 py-3 font-semibold text-background transition hover:scale-[1.01]">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
