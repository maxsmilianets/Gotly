"use client";

import { AuthBackground } from "@/components/AuthBackground";
import { useToast } from "@/components/ToastProvider";
import { LogoMark } from "@/components/LogoMark";
import { api } from "@/lib/api";
import { createSession, getRoleLabel, normalizeUserFromApi } from "@/lib/auth";
import { UserRole } from "@/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get("redirect") ?? "/dashboard", [searchParams]);

  const [role, setRole] = useState<UserRole>("manager");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (role === "manager" && !position.trim()) {
      addToast("Dodaj stanowisko managera.", "error");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register/", {
        username: email,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        position: role === "manager" ? position.trim() : "",
      });

      const tokenResponse = await api.post<{ access: string; refresh: string }>("/auth/token/", {
        username: email,
        password,
      });

      localStorage.setItem("accessToken", tokenResponse.data.access);
      localStorage.setItem("refreshToken", tokenResponse.data.refresh);

      const me = await api.get<{ first_name?: string; last_name?: string; email?: string; role?: "manager" | "member"; username?: string; position?: string }>("/auth/me/");
      createSession(normalizeUserFromApi(me.data));
      router.push(redirectTarget);
    } catch (error) {
      addToast("Nie udało się utworzyć konta.", "error");
    } finally {
      setLoading(false);
    }
  };

  const roleCard = (value: UserRole, title: string, subtitle: string) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={`rounded-2xl border p-5 text-left transition ${
        role === value ? "border-accent bg-accent/10 shadow-glow" : "border-white/10 hover:border-accent/40"
      }`}
    >
      <div className="mb-4 text-3xl">{value === "manager" ? "📊" : "👥"}</div>
      <div className="text-2xl font-bold">{title}</div>
      <div className="mt-2 text-lg text-textMuted">{subtitle}</div>
    </button>
  );

  return (
    <main className="auth-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-3xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-textMuted transition hover:border-accent hover:text-accent"
        >
          ← Wróć na stronę główną
        </Link>

        <div className="panel auth-card w-full p-8 md:p-12">
          <div className="mb-10 flex items-center gap-4 text-2xl font-bold">
            <LogoMark size="lg" showText />
          </div>

          <h1 className="text-5xl font-black">Utwórz konto</h1>
          <p className="mt-3 text-2xl text-textMuted">Bezpłatnie, bez karty kredytowej</p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              {roleCard("manager", "Project Manager", "Zarządzam projektami")}
              {roleCard("member", "Członek zespołu", "Wykonuję zadania")}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-xl font-semibold">Imię</label>
                <input placeholder="Jan" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </div>
              <div>
                <label className="mb-3 block text-xl font-semibold">Nazwisko</label>
                <input placeholder="Kowalski" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
              </div>
            </div>

            {role === "manager" ? (
              <div>
                <label className="mb-3 block text-xl font-semibold">Stanowisko</label>
                <input placeholder="np. Product Manager" value={position} onChange={(event) => setPosition(event.target.value)} required />
                <p className="mt-2 text-sm text-textMuted">
                  Będzie widoczne w dashboardzie zamiast ogólnego opisu roli: {getRoleLabel(role, position)}
                </p>
              </div>
            ) : null}

            <div>
              <label className="mb-3 block text-xl font-semibold">E-mail</label>
              <input type="email" placeholder="jan@firma.pl" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div>
              <label className="mb-3 block text-xl font-semibold">Hasło</label>
              <input type="password" placeholder="Min. 8 znaków" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 px-6 py-4 text-2xl font-bold transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Tworzenie..." : "Utwórz konto bezpłatnie"}
            </button>
          </form>

          <p className="mt-8 text-center text-xl text-textMuted">
            Masz już konto?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTarget)}`} className="font-semibold text-accent">
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
