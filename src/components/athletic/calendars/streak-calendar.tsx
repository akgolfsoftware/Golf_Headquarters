import { cn } from "@/lib/utils";
import { Check, Minus, X } from "lucide-react";

export type StreakDay = {
  date: Date;
  status: "done" | "missed" | "rest" | "future";
};

type StreakCalendarProps = {
  days: StreakDay[];
  endDate?: Date;
  totalDays?: number;
  goalLabel?: string;
  className?: string;
};

export function StreakCalendar({
  days,
  endDate,
  totalDays = 30,
  goalLabel = "Treningsstreak",
  className,
}: StreakCalendarProps) {
  const end = endDate ?? new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - totalDays + 1);

  const map = new Map<string, StreakDay["status"]>();
  days.forEach((d) => map.set(d.date.toDateString(), d.status));

  const cells: { date: Date; status: StreakDay["status"] }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const isFuture = d > end;
    cells.push({
      date: d,
      status: isFuture ? "future" : map.get(d.toDateString()) ?? "missed",
    });
  }

  let currentStreak = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].status === "future") continue;
    if (cells[i].status === "done" || cells[i].status === "rest") currentStreak++;
    else break;
  }

  const doneCount = cells.filter((c) => c.status === "done").length;
  const completedDays = cells.filter((c) => c.status !== "future").length;
  const consistency = completedDays > 0 ? Math.round((doneCount / completedDays) * 100) : 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{goalLabel}</h3>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Streak:
            <span className="ml-1 text-lg font-bold text-primary">{currentStreak}</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Konsistens:
            <span className="ml-1 text-lg font-bold text-foreground">{consistency}%</span>
          </span>
        </div>
      </div>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(15, totalDays)}, minmax(0, 1fr))` }}>
        {cells.map((c, idx) => (
          <div
            key={idx}
            title={`${c.date.toLocaleDateString("nb-NO")} — ${c.status}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md border text-[10px]",
              c.status === "done" && "border-primary bg-primary text-primary-foreground",
              c.status === "missed" && "border-destructive/40 bg-destructive/10 text-destructive",
              c.status === "rest" && "border-border bg-muted text-muted-foreground",
              c.status === "future" && "border-dashed border-border bg-background/50 text-muted-foreground/40",
            )}
          >
            {c.status === "done" && <Check className="h-3 w-3" strokeWidth={2.5} />}
            {c.status === "missed" && <X className="h-3 w-3" strokeWidth={2.5} />}
            {c.status === "rest" && <Minus className="h-3 w-3" strokeWidth={2.5} />}
            {c.status === "future" && (
              <span className="font-mono text-[8px]">{c.date.getDate()}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Gjennomført
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted" /> Hviledag
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive/20 border border-destructive/40" /> Mistet
        </span>
      </div>
    </div>
  );
}
