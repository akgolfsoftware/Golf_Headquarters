import { cn } from "@/lib/utils";

export type DayCalEvent = {
  key: string;
  startHour: number;
  endHour: number;
  title: string;
  meta?: string;
  tone?: "primary" | "accent" | "destructive";
};

type DayCalProps = {
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
  events: DayCalEvent[];
  nowHour?: number;
  className?: string;
};

const toneClass: Record<NonNullable<DayCalEvent["tone"]>, string> = {
  primary: "border-l-primary",
  accent: "border-l-accent",
  destructive: "border-l-destructive",
};

export function DayCal({
  startHour = 7,
  endHour = 18,
  hourHeight = 40,
  events,
  nowHour,
  className,
}: DayCalProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className={cn("relative grid", className)} style={{ gridTemplateColumns: "40px 1fr" }}>
      {hours.map((h) => (
        <div key={`label-${h}`} className="contents">
          <div
            className="border-r border-t border-border px-2 text-right font-mono text-[9px] leading-none text-muted-foreground"
            style={{ height: hourHeight, paddingTop: 4 }}
          >
            {String(h).padStart(2, "0")}:00
          </div>
          <div
            className="relative border-t border-border bg-[repeating-linear-gradient(to_right,rgba(229,231,235,0.6)_0_3px,transparent_3px_7px)] bg-[length:100%_1px] bg-[position:0_50%] bg-no-repeat"
            style={{ height: hourHeight }}
          />
        </div>
      ))}

      {events.map((ev) => {
        const top = (ev.startHour - startHour) * hourHeight;
        const height = Math.max(20, (ev.endHour - ev.startHour) * hourHeight - 2);
        return (
          <div
            key={ev.key}
            className={cn(
              "absolute left-[44px] right-1 flex items-center gap-2 overflow-hidden rounded-md border border-border border-l-[3px] bg-card px-2 py-1 text-[11px] shadow-sm",
              toneClass[ev.tone ?? "primary"],
            )}
            style={{ top, height }}
          >
            <span className="truncate font-semibold text-foreground">{ev.title}</span>
            {ev.meta && (
              <span className="ml-auto shrink-0 font-mono text-[9px] text-muted-foreground">
                {ev.meta}
              </span>
            )}
          </div>
        );
      })}

      {typeof nowHour === "number" && nowHour >= startHour && nowHour <= endHour && (
        <div
          aria-hidden
          className="absolute left-[40px] right-0 z-[5] h-[2px] bg-accent shadow-[0_0_8px_rgba(209,248,67,0.6)]"
          style={{ top: (nowHour - startHour) * hourHeight }}
        />
      )}
    </div>
  );
}
