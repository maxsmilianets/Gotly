"use client";

import { useToast } from "@/components/ToastProvider";
import { getCurrentUser } from "@/lib/auth";
import { FormEvent, useMemo, useState } from "react";

type NewProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    description: string;
    notes: string;
    deadline: string;
    memberEmails: string[];
  }) => void | Promise<void>;
};

export function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
  const { addToast } = useToast();
  const currentUser = getCurrentUser();
  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setNotes("");
    setDeadline("");
    setMemberEmail("");
    setMemberEmails([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const handleRemoveMember = (email: string) => {
    setMemberEmails((current) => current.filter((item) => item !== email));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await onCreate({ name, description, notes, deadline, memberEmails });
      resetForm();
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Nie udało się utworzyć projektu.";
      addToast(message, "error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
      <div className="panel relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-full border border-white/10 px-3 py-2 text-sm text-textMuted transition hover:border-accent hover:text-accent"
        >
          Zamknij
        </button>

        <div className="pr-20">
          <p className="text-sm uppercase tracking-[0.25em] text-accent">Nowy projekt</p>
          <h2 className="mt-3 text-4xl font-black">Stwórz projekt i zaproś zespół</h2>
          <p className="mt-3 text-lg text-textMuted">
            Dodaj nazwę projektu, uwagi, deadline i członków zespołu po adresie e-mail.
          </p>
          {currentUser ? (
            <p className="mt-3 text-sm text-textMuted">
              Projekt zostanie utworzony na koncie: <span className="text-textMain">{currentUser.email}</span>
            </p>
          ) : null}
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Nazwa projektu</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Np. Aplikacja mobilna dla klienta"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Deadline projektu</span>
              <input
                type="date"
                min={minDate}
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Krótki opis projektu</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Opisz cel projektu i rezultat końcowy."
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-textMuted">Uwagi do projektu</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Np. priorytety, ryzyka, ważne ustalenia z klientem"
              required
            />
          </label>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold">Osoby w projekcie</h3>
                <p className="mt-1 text-sm text-textMuted">Dodawaj członków zespołu na podstawie maila użytkownika.</p>
              </div>
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
                    onClick={() => handleRemoveMember(email)}
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
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-textMuted transition hover:border-white/20 hover:text-textMain"
            >
              Anuluj
            </button>
            <button type="submit" className="rounded-2xl bg-accent px-6 py-3 font-semibold text-background transition hover:scale-[1.01]">
              Utwórz projekt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
