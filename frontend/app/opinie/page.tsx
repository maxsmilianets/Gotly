"use client";

import { Navbar } from "@/components/Navbar";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ReviewItem } from "@/types";
import { getReviews } from "@/lib/reviews";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getReviews()
      .then((items) => {
        if (!active) return;
        setReviews(items);
      })
      .catch(() => {
        if (!active) return;
        setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-36">
        <div className="panel p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent">Opinie</p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="max-w-4xl text-5xl font-black md:text-7xl">Historie osób, które testują Gotly</h1>
            </div>
            <Link href="/opinie/dodaj?source=opinie" className="w-fit rounded-2xl bg-accent px-6 py-4 text-lg font-bold text-background transition hover:scale-[1.02]">
              Dodaj opinię
            </Link>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <TestimonialCard key={review.id} {...review} />
            ))}
          </div>
        ) : !loading ? (
          <div className="mt-10 panel p-8 text-center">
            <h2 className="text-2xl font-bold">Nie ma jeszcze opinii</h2>
            <p className="mt-3 text-textMuted">Dodaj pierwszą opinię i pomóż rozwijać Gotly.</p>
          </div>
        ) : null}

        {loading ? <p className="mt-8 text-center text-textMuted">Ładowanie opinii...</p> : null}
      </section>
    </main>
  );
}
