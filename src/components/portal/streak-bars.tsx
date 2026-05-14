import { streakAntall, aktivStreak } from "@/lib/streak";

export function StreakBars({ streak }: { streak: boolean[] }) {
  const antall = streakAntall(streak);
  const aktiv = aktivStreak(streak);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Streak · siste 14 dager
        </span>
        {aktiv > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
            {aktiv} dag{aktiv === 1 ? "" : "er"} aktiv
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-1.5">
        {streak.map((on, i) => (
          <span
            key={i}
            className={`h-8 flex-1 rounded-sm ${
              on ? "bg-primary" : "bg-border/60"
            }`}
            title={on ? "Trent" : "Hvile"}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {antall} av 14 dager med fullført økt.
      </p>
    </div>
  );
}
