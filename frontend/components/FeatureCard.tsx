type FeatureCardProps = {
  title: string;
  description: string;
  icon: string;
  highlighted?: boolean;
};

export function FeatureCard({ title, description, icon, highlighted }: FeatureCardProps) {
  return (
    <article className={`panel h-full p-6 ${highlighted ? "gradient-accent border-accent/30" : ""}`}>
      <div className="mb-5 text-4xl">{icon}</div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-lg leading-relaxed text-textMuted">{description}</p>
    </article>
  );
}
