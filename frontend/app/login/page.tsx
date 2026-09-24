"use client";

import { AuthBackground } from "@/components/AuthBackground";
import { useToast } from "@/components/ToastProvider";
import { LogoMark } from "@/components/LogoMark";
import { api } from "@/lib/api";
import { createSession, normalizeUserFromApi } from "@/lib/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get("redirect") ?? "/dashboard", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<{ access: string; refresh: string }>("/auth/token/", {
        username: email,
        password,
      });

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      const me = await api.get<{ first_name?: string; last_name?: string; email?: string; role?: "manager" | "member"; username?: string; position?: string }>("/auth/me/");
      createSession(normalizeUserFromApi(me.data));

      router.push(redirectTarget);
    } catch {
      addToast("Nie udało się zalogować.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-2xl">
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

          <h1 className="text-5xl font-black">Witaj z powrotem</h1>
          <p className="mt-3 text-2xl text-textMuted">Zaloguj się do swojego konta</p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-3 block text-xl font-semibold">Adres e-mail</label>
              <input type="email" placeholder="jan@firma.pl" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block text-xl font-semibold">Hasło</label>
                <span className="text-lg text-accent">Nie pamiętasz?</span>
              </div>
              <input type="password" placeholder="Twoje hasło" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 px-6 py-4 text-2xl font-bold transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
          </form>

          <p className="mt-8 text-center text-xl text-textMuted">
            Nie masz konta?{" "}
            <Link href={`/register?redirect=${encodeURIComponent(redirectTarget)}`} className="font-semibold text-accent">
              Zarejestruj się bezpłatnie
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
