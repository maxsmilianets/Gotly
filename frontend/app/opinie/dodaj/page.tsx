"use client";

import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ToastProvider";
import { getCurrentUser, getDisplayName, getRoleLabel, isAuthenticated } from "@/lib/auth";
import { createReview } from "@/lib/reviews";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function AddReviewPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const returnPath = source === "opinie" ? "/opinie" : "/";

  const [sessionReady, setSessionReady] = useState(false);
  const currentUser = sessionReady ? getCurrentUser() : null;
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const suggestedName = useMemo(() => (currentUser ? getDisplayName(currentUser) : ""), [currentUser]);
  const suggestedRole = useMemo(() => (currentUser ? getRoleLabel(currentUser.role, currentUser.position) : ""), [currentUser]);

  useEffect(() => {
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/opinie/dodaj?source=${source ?? "home"}`);
      return;
    }
    setName(suggestedName);
    setRole(suggestedRole);
  }, [router, sessionReady, source, suggestedName, suggestedRole]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!name.trim() || !role.trim() || !quote.trim()) {
      addToast("Uzupełnij wszystkie pola.", "error");
      setLoading(false);
      return;
    }

    try {
      await createReview({ name: name.trim(), role: role.trim(), quote: quote.trim(), rating });
      addToast("Opinia dodana.", "success");
      setQuote("");
    } catch (error) {
      addToast("Nie udało się zapisać opinii.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady || !currentUser) {
    return (
      <main>
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 py-36">
          <div className="panel p-8 text-textMuted">Ładowanie formularza opinii...</div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-36">
        <Link href={returnPath} className="mb-5 inline-flex text-sm font-semibold text-accent hover:underline">
          ← Wróć
        </Link>

        <div className="panel p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent">Dodaj opinię</p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">Podziel się opinią o Gotly</h1>
          <p className="mt-4 text-lg text-textMuted">Twoja opinia pojawi się na stronie opinii.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-textMuted">Imię i nazwisko</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jan Kowalski" required />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-textMuted">Rola / stanowisko</span>
                <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Project Manager" required />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Ocena</span>
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                <option value={5}>5 gwiazdek</option>
                <option value={4}>4 gwiazdki</option>
                <option value={3}>3 gwiazdki</option>
                <option value={2}>2 gwiazdki</option>
                <option value={1}>1 gwiazdka</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-textMuted">Treść opinii</span>
              <textarea value={quote} onChange={(event) => setQuote(event.target.value)} placeholder="Co najbardziej pomaga Ci w Gotly?" required />
            </label>


            <button disabled={loading} type="submit" className="w-full rounded-2xl bg-accent px-6 py-4 text-lg font-bold text-background transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Zapisywanie..." : "Zapisz opinię"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
