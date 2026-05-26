import { cn } from "@/lib/utils";

export type ShotMapPoint = {
  key: string;
  lateral: number; // -50 to 50 yards left/right of target line
  distance: number; // distance from target in yards (positive = beyond, negative = short)
  club?: string;
  shotType?: "DRIVE" | "APPROACH" | "CHIP" | "PITCH" | "PUTT" | "BUNKER";
};

type ShotMapProps = {
  shots: ShotMapPoint[];
  title?: string;
  targetLabel?: string;
  className?: string;
};

const typeColor: Record<NonNullable<ShotMapPoint["shotType"]>, string> = {
  DRIVE: "hsl(var(--primary))",
  APPROACH: "hsl(var(--success))",
  CHIP: "hsl(var(--warning))",
  PITCH: "hsl(var(--accent))",
  PUTT: "hsl(var(--foreground))",
  BUNKER: "#9CA3AF",
};

export function ShotMap({ shots, title = "Shot dispersion", targetLabel = "Mål", className }: ShotMapProps) {
  // Find chart bounds
  const maxLateral = Math.max(50, ...shots.map((s) => Math.abs(s.lateral)));
  const maxDistance = Math.max(20, ...shots.map((s) => Math.abs(s.distance)));

  const total = shots.length;
  const avgLateral = total > 0 ? shots.reduce((acc, s) => acc + s.lateral, 0) / total : 0;
  const avgDistance = total > 0 ? shots.reduce((acc, s) => acc + s.distance, 0) / total : 0;
  const stdLateral =
    total > 0
      ? Math.sqrt(shots.reduce((acc, s) => acc + Math.pow(s.lateral - avgLateral, 2), 0) / total)
      : 0;
  const stdDistance =
    total > 0
      ? Math.sqrt(shots.reduce((acc, s) => acc + Math.pow(s.distance - avgDistance, 2), 0) / total)
      : 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {total} slag · σ lat {stdLateral.toFixed(1)}y
        </span>
      </div>

      <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-lg bg-gradient-to-b from-emerald-100/40 to-emerald-200/60 overflow-hidden">
        {/* Distance markers */}
        {[0.25, 0.5, 0.75].map((y) => (
          <div
            key={y}
            className="absolute inset-x-0 border-t border-dashed border-emerald-700/20"
            style={{ top: `${y * 100}%` }}
          />
        ))}
        {/* Target line vertical */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-700/40" />

        {/* Target */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="block h-4 w-4 rounded-full border-2 border-primary bg-accent shadow-[0_0_10px_rgba(209,248,67,0.6)]" />
          <span className="absolute left-1/2 top-5 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.08em] text-primary">
            {targetLabel}
          </span>
        </div>

        {/* Shots */}
        {shots.map((s) => {
          const left = 50 + (s.lateral / maxLateral) * 45;
          const top = 50 - (s.distance / maxDistance) * 45;
          return (
            <span
              key={s.key}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white opacity-80"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                backgroundColor: typeColor[s.shotType ?? "APPROACH"],
              }}
              title={`${s.club ?? ""} · ${s.lateral}y · ${s.distance}y`}
            />
          );
        })}

        {/* Axis labels */}
        <span className="absolute bottom-1 left-2 font-mono text-[8px] text-emerald-900/70">
          -{maxLateral}y
        </span>
        <span className="absolute bottom-1 right-2 font-mono text-[8px] text-emerald-900/70">
          +{maxLateral}y
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(typeColor) as Array<keyof typeof typeColor>).map((t) => {
            const used = shots.some((s) => s.shotType === t);
            if (!used) return null;
            return (
              <span key={t} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeColor[t] }} />
                {t}
              </span>
            );
          })}
        </div>
        <span>σ dist {stdDistance.toFixed(1)}y</span>
      </div>
    </div>
  );
}
