export function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 mb-1 font-mono text-[24px] font-semibold tabular-nums leading-none text-foreground">
        {value}
      </div>
      <div className="text-[11px] leading-[1.3] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}
