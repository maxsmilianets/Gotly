"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting?: boolean;
};

type ToastContextValue = {
  addToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success: "border-accent/25 bg-accent/15 text-accent",
  error: "border-rose-400/25 bg-rose-400/15 text-rose-100",
  info: "border-sky-300/25 bg-sky-300/15 text-sky-100",
};

const variantDots: Record<ToastVariant, string> = {
  success: "bg-accent",
  error: "bg-rose-300",
  info: "bg-sky-300",
};

function simplifyMessage(message: string, variant: ToastVariant) {
  const text = message.trim();

  if (variant === "success") {
    if (text.toLowerCase().includes("opinia")) return "Opinia dodana.";
    if (text.toLowerCase().includes("projekt") && text.toLowerCase().includes("usuni")) return "Projekt usunięty.";
    if (text.toLowerCase().includes("projekt") && text.toLowerCase().includes("zaktual")) return "Projekt zaktualizowany.";
    if (text.toLowerCase().includes("projekt")) return "Projekt zapisany.";
    if (text.toLowerCase().includes("zadanie") && text.toLowerCase().includes("usuni")) return "Zadanie usunięte.";
    if (text.toLowerCase().includes("zadanie") && text.toLowerCase().includes("zaktual")) return "Zadanie zaktualizowane.";
    if (text.toLowerCase().includes("status")) return "Status zmieniony.";
    if (text.toLowerCase().includes("zadanie")) return "Zadanie zapisane.";
    return text || "Zapisano zmiany.";
  }

  if (variant === "info") {
    if (text.toLowerCase().includes("już dodana")) return "Ta osoba jest już w projekcie.";
    return text || "Informacja.";
  }

  if (text.includes("PROJECT_NAME_REQUIRED")) return "Podaj nazwę projektu.";
  if (text.includes("PROJECT_NOTES_REQUIRED")) return "Dodaj uwagi do projektu.";
  if (text.includes("PROJECT_DEADLINE_REQUIRED")) return "Wybierz termin projektu.";
  if (text.toLowerCase().includes("project manager")) return "Tylko manager może to zrobić.";
  if (text.toLowerCase().includes("adres e-mail")) return "Podaj adres e-mail.";
  if (text.toLowerCase().includes("opinii") || text.toLowerCase().includes("opinia")) return "Nie udało się zapisać opinii.";
  if (text.toLowerCase().includes("zalogować")) return "Nie udało się zalogować.";
  if (text.toLowerCase().includes("konto")) return "Nie udało się utworzyć konta.";
  if (text.toLowerCase().includes("projekt")) return "Nie udało się zapisać projektu.";
  if (text.toLowerCase().includes("zadanie") || text.toLowerCase().includes("status")) return "Nie udało się zapisać zadania.";
  if (text.toLowerCase().includes("danych") || text.toLowerCase().includes("pobrać")) return "Nie udało się pobrać danych.";

  return text || "Coś poszło nie tak.";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast)));
      window.setTimeout(() => removeToast(id), 180);
    },
    [removeToast],
  );

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current.slice(-3), { id, message: simplifyMessage(message, variant), variant }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ addToast, dismissToast }), [addToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col items-center gap-3 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-card ${toast.exiting ? "toast-card-exit" : ""} pointer-events-auto w-full overflow-hidden rounded-3xl border px-4 py-3 text-center shadow-[0_18px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl ${variantClasses[toast.variant]}`}
            role="status"
          >
            <div className="flex items-start gap-3 text-left">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${variantDots[toast.variant]}`} />
              <p className="min-w-0 flex-1 text-sm font-semibold leading-6">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full px-2 text-lg leading-none text-current/70 transition hover:bg-white/10 hover:text-current"
                aria-label="Zamknij komunikat"
              >
                ×
              </button>
            </div>
            <div className="toast-progress mt-3 h-1 rounded-full bg-current/20" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast musi być użyty wewnątrz ToastProvider.");
  }
  return context;
}
