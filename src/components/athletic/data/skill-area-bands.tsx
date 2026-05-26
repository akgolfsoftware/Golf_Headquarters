import { cn } from "@/lib/utils";

export type SkillBand = {
  key: string;
  label: string;
  sg: number;
  volume: number;
  area: "TEE" | "APP" | "ARG" | "PUTT";
};

type SkillAreaBandsProps = {
  bands: SkillBand[];
  title?: string;
  className?: string;
};

const areaTone: Record<SkillBand["area"], string> = {
  TEE: "bg-emerald-700/15 text-emerald-700",
  APP: "bg-primary/10 text-primary",
  ARG: "bg-amber-500/15 text-amber-700",
  PUTT: "bg-accent/20 text-primary",
};

const AREA_LABEL: Record<SkillBand["area"], string> = {
  TEE: "TEE",
  APP: "APP",
  ARG: "ARG",
  PUTT: "PUTT",
};

export function SkillAreaBands({
  bands,
  title = "Treningsområder",
  className,
}: SkillAreaBandsProps) {
  const maxAbs = Math.max(0.5, ...bands.map((b) => Math.abs(b.sg)));
  const totalVolume = bands.reduce((acc, b) => acc + b.volume, 0);

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {totalVolume} slag · {bands.length} bånd
        </span>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            <th className="py-2 font-medium">Bånd</th>
            <th className="py-2 font-medium text-right">SG</th>
            <th className="py-2 px-2 font-medium">Indikator</th>
            <th className="py-2 font-medium text-right">Volum</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((b) => {
            const pct = (b.sg / maxAbs) * 50; // signert prosent fra midten
            const isPos = b.sg >= 0;
            return (
              <tr key={b.key} className="border-b border-border/60 last:border-b-0">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.04em]",
                        areaTone[b.area],
                      )}
                    >
                      {AREA_LABEL[b.area]}
                    </span>
                    <span className="text-[13px] font-medium text-foreground">{b.label}</span>
                  </div>
                </td>
                <td
                  className={cn(
                    "py-2.5 text-right font-mono text-[12px] font-semibold tabular-nums",
                    isPos ? "text-primary" : "text-destructive",
                  )}
                >
                  {b.sg > 0 ? "+" : ""}
                  {b.sg.toFixed(2)}
                </td>
                <td className="py-2.5 px-2">
                  <div className="relative h-1.5 rounded-full bg-muted/40">
                    <span className="absolute left-1/2 top-0 h-full w-px bg-border" />
                    <span
                      className={cn(
                        "absolute top-0 h-full rounded-full",
                        isPos ? "bg-primary" : "bg-destructive",
                      )}
                      style={{
                        left: isPos ? "50%" : `${50 + pct}%`,
                        width: `${Math.abs(pct)}%`,
                      }}
                    />
                  </div>
                </td>
                <td className="py-2.5 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                  {b.volume}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
