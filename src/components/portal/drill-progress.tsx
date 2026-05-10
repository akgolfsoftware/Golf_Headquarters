export function DrillProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <span>
          Drill {Math.min(current + 1, total)} av {total}
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
