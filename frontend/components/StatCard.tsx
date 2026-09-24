type StatCardProps = {
  value: string;
  label: string;
  accent?: boolean;
};

export function StatCard({ value, label, accent }: StatCardProps) {
  return (
    <div className={`panel p-6 ${accent ? "gradient-accent border-accent/30" : ""}`}>
      <p className="text-sm uppercase tracking-[0.18em] text-textMuted">{label}</p>
      <p className="mt-4 text-5xl font-black">{value}</p>
    </div>
  );
}
