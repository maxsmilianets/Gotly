import { ReviewItem } from "@/types";

export function TestimonialCard({ quote, name, role, initial, rating }: ReviewItem) {
  return (
    <article className="panel h-full p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">
            {initial}
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-textMuted">{role}</p>
          </div>
        </div>
        <span className="text-amber-300">{Array.from({ length: rating }).map(() => "★")}</span>
      </div>
      <p className="text-lg leading-relaxed text-textMuted">“{quote}”</p>
    </article>
  );
}
