import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "../eyebrow";
import { PulseDot } from "../pulse-dot";

export type PlannerSlot = {
  key: string;
  startHour: number;
  duration: number;
  title: string;
  category: string;
  intensity?: "low" | "medium" | "high";
  participants?: number;
  notes?: string;
  status?: "planned" | "active" | "completed" | "skipped";
};

type DayPlannerProps = {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotHeight?: number;
  slots: PlannerSlot[];
  nowHour?: number;
  className?: string;
};

const statusBg: Record<NonNullable<PlannerSlot["status"]>, string> = {
  planned: "bg-card border-primary",
  active: "bg-accent/20 border-accent",
  completed: "bg-primary/10 border-primary/50",
  skipped: "bg-muted border-border opacity-60",
};

const intensityBar: Record<NonNullable<PlannerSlot["intensity"]>, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-destructive",
};

export function DayPlanner({
  date,
  startHour = 6,
  endHour = 22,
  slotHeight = 56,
  slots,
  nowHour,
  className,
}: DayPlannerProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const dayLabel = date.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <AthleticEyebrow>I dag</AthleticEyebrow>
          <h3 className="font-display mt-1 text-xl font-bold tracking-[-0.015em] capitalize">
            {dayLabel}
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {slots.length} økter planlagt
        </span>
      </div>

      <div className="relative grid" style={{ gridTemplateColumns: "56px 1fr" }}>
        {hours.map((h) => (
          <div key={h} className="contents">
            <div
              className="border-r border-t border-border pr-2 text-right font-mono text-[10px] text-muted-foreground"
              style={{ height: slotHeight, paddingTop: 6 }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
            <div
              className="relative border-t border-border bg-[repeating-linear-gradient(to_right,rgba(229,231,235,0.5)_0_4px,transparent_4px_9px)] bg-[length:100%_1px] bg-[center_50%] bg-no-repeat"
              style={{ height: slotHeight }}
            />
          </div>
        ))}

        {slots.map((s) => {
          const top = (s.startHour - startHour) * slotHeight;
          const height = Math.max(40, (s.duration / 60) * slotHeight - 4);
          return (
            <div
              key={s.key}
              className={cn(
                "absolute left-[60px] right-2 flex gap-3 rounded-lg border-l-[3px] border-l-primary p-3 shadow-sm",
                statusBg[s.status ?? "planned"],
              )}
              style={{ top: top + 2, minHeight: height }}
            >
              {s.intensity && (
                <span
                  aria-hidden
                  className={cn("w-1 self-stretch rounded-full", intensityBar[s.intensity])}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {s.status === "active" && <PulseDot size="sm" />}
                  <span className="truncate text-[13px] font-semibold leading-tight text-foreground">
                    {s.title}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  <span>{s.category}</span>
                  <span>·</span>
                  <span>{s.duration} min</span>
                  {typeof s.participants === "number" && (
                    <>
                      <span>·</span>
                      <span>{s.participants} spiller{s.participants === 1 ? "" : "e"}</span>
                    </>
                  )}
                </div>
                {s.notes && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {s.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {typeof nowHour === "number" && nowHour >= startHour && nowHour <= endHour && (
          <div
            aria-hidden
            className="absolute left-[56px] right-0 z-[5] flex items-center"
            style={{ top: (nowHour - startHour) * slotHeight - 1 }}
          >
            <span className="h-2 w-2 -ml-1 rounded-full bg-accent shadow-[0_0_8px_rgba(209,248,67,0.6)]" />
            <span className="h-[2px] flex-1 bg-accent" />
          </div>
        )}
      </div>
    </div>
  );
}
