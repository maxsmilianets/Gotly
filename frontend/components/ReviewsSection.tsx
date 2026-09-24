"use client";

import { TestimonialCard } from "@/components/TestimonialCard";
import { getReviews } from "@/lib/reviews";
import { ReviewItem } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    let active = true;

    getReviews()
      .then((items) => {
        if (active) setReviews(items.slice(0, 3));
      })
      .catch(() => {
        if (active) setReviews([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden px-4 py-24" id="opinie">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-accent">Opinie użytkowników</p>
            <h2 className="max-w-3xl text-4xl font-black md:text-6xl">Co mówią osoby korzystające z Gotly?</h2>
          </div>
          <Link href="/opinie/dodaj?source=home" className="w-fit rounded-2xl bg-accent px-6 py-4 text-lg font-bold text-background transition hover:scale-[1.02]">
            Dodaj opinię
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <TestimonialCard key={review.id} {...review} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-textMuted">
            Nie ma jeszcze opinii. Możesz dodać pierwszą.
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/opinie" className="inline-flex items-center gap-2 text-lg font-semibold text-accent hover:underline">
            Zobacz wszystkie opinie →
          </Link>
        </div>
      </div>
    </section>
  );
}
