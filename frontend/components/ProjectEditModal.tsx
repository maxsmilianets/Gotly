"use client";

import { useToast } from "@/components/ToastProvider";
import { ProjectRecord } from "@/types";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ProjectEditModalProps = {
  open: boolean;
  project: ProjectRecord | null;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    description: string;
    notes: string;
    deadline: string;
    memberEmails: string[];
    status: ProjectRecord["status"];
    progress: number;
  }) => void | Promise<void>;
};

export function ProjectEditModal({ open, project, onClose, onSave }: ProjectEditModalProps) {
  const { addToast } = useToast();
  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [notes, setNotes] = useState(project?.notes ?? "");
  const [deadline, setDeadline] = useState(project?.deadline ?? "");
  const [status, setStatus] = useState<ProjectRecord["status"]>(project?.status ?? "planning");
  const [progress, setProgress] = useState(project?.progress ?? 0);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>(project?.memberEmails ?? []);

  useEffect(() => {
    if (!open || !project) return;
    setName(project.name);
    setDescription(project.description ?? "");
    setNotes(project.notes);
    setDeadline(project.deadline);
    setStatus(project.status);
    setProgress(project.progress);
    setMemberEmail("");
    setMemberEmails(project.memberEmails ?? []);
  }, [open, project]);

  if (!open || !project) return null;

  const handleAddMember = () => {
    const normalized = memberEmail.trim().toLowerCase();
    if (!normalized) {
      addToast("Podaj adres e-mail.", "error");
      return;
    }
    if (memberEmails.includes(normalized)) {
      addToast("Ta osoba jest już w projekcie.", "info");
      return;
    }
    setMemberEmails((current) => [...current, normalized]);
    setMemberEmail("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await onSave({
        name,
        description,
        notes,
        deadline,
        memberEmails,
        status,
        progress: Number(progress),
      });
      } catch (submissionError) {
      addToast("Nie udało się zapisać zmian.", "error");
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
          <p className="text-sm uppercase tracking-[0.25em] text-accent">Edycja projektu</p>
          <h2 className="mt-3 text-4xl font-black">{project.name}</h2>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Nazwa projektu</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Deadline projektu</span>
              <input type="date" min={minDate} value={deadline} onChange={(event) => setDeadline(event.target.value)} required />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as ProjectRecord["status"])}>
                <option value="planning">Zaplanowany</option>
                <option value="active">Aktywny</option>
                <option value="done">Ukończony</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Postęp (%)</span>
              <input type="number" min={0} max={100} value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Opis</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Uwagi</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} required />
          </label>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-bold">Członkowie projektu</h3>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-sm text-accent">
                {memberEmails.length} osób
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="np. anna@gotly.dev"
                className="md:flex-1"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="rounded-2xl bg-accent px-5 py-3 font-semibold text-background transition hover:scale-[1.01]"
              >
                Dodaj osobę
              </button>
            </div>

            {memberEmails.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {memberEmails.map((email) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => setMemberEmails((current) => current.filter((item) => item !== email))}
                    className="rounded-full border border-white/10 bg-background/70 px-4 py-2 text-sm text-textMuted transition hover:border-rose-400/30 hover:text-rose-300"
                  >
                    {email} ×
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-textMuted">Nie dodano jeszcze żadnej osoby do projektu.</p>
            )}
          </div>


          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-textMuted transition hover:border-white/20 hover:text-textMain">
              Anuluj
            </button>
            <button type="submit" className="rounded-2xl bg-accent px-6 py-3 font-semibold text-background transition hover:scale-[1.01]">
              Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
