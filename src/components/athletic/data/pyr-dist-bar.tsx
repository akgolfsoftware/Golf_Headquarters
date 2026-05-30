import { cn } from "@/lib/utils";

export type PyrDist = { fys: number; tek: number; slag: number; spill: number; turn: number };

const segs: { key: keyof PyrDist; cls: string; label: string }[] = [
  { key: "fys", cls: "bg-pyr-fys", label: "Fys" },
  { key: "tek", cls: "bg-pyr-tek", label: "Tek" },
  { key: "slag", cls: "bg-pyr-slag", label: "Slag" },
  { key: "spill", cls: "bg-pyr-spill", label: "Spill" },
  { key: "turn", cls: "bg-pyr-turn", label: "Turn" },
];

/**
 * Horisontal 5-segment pyramide-fordelingsbar (% per akse). Enkel CSS-bar — ikke
 * chart. Sum bør være ~100.
 */
export function PyrDistBar({
  dist,
  showLegend = false,
  className,
}: {
  dist: PyrDist;
  showLegend?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary" role="img" aria-label="Pyramide-fordeling">
        {segs.map((s) =>
          dist[s.key] > 0 ? (
            <span key={s.key} className={cn("h-full", s.cls)} style={{ width: `${dist[s.key]}%` }} />
          ) : null,
        )}
      </div>
      {showLegend && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {segs.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              <span className={cn("h-1.5 w-1.5 rounded-[2px]", s.cls)} />
              {s.label} {dist[s.key]}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
