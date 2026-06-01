/**
 * PlayerHQ · Runder — rundeliste (queue-mønster).
 *
 * Port av design-fasit (public/design-handover/playerhq/components-sg-waterfall.html
 * + components-course-heatmap.html, runde-liste fra SKJERMER-RUNDE-2-prompten):
 * klikkbare rader → dato + bane + score + vs-par + SG + ★ for beste runde.
 * Hver rad lenker til runde-detalj (/portal/mal/runder/[id]).
 *
 * Mobile-first (430px): rad-grid kollapser til to linjer på smal skjerm.
 * DS-tokens kun — ingen hardkodet hex, ingen emoji (kun lucide).
 */
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RundeRow } from "@/lib/portal-runder/runder-list-data";

function formatSg(v: number | null): string {
  if (v == null) return "—";
  const formatted = v.toFixed(1).replace(".", ",");
  return v > 0 ? `+${formatted}` : formatted;
}

function vsParPillClass(vsPar: number): string {
  if (vsPar < 0) return "bg-primary/12 text-primary";
  if (vsPar === 0) return "bg-secondary text-muted-foreground";
  if (vsPar <= 5) return "bg-accent/30 text-accent-foreground";
  return "bg-destructive/15 text-destructive";
}

function sgClass(v: number | null): string {
  if (v == null) return "text-muted-foreground";
  if (v > 0) return "text-success";
  if (v < 0) return "text-destructive";
  return "text-muted-foreground";
}

function dateParts(d: Date): { day: string; rest: string } {
  const day = d.toLocaleDateString("nb-NO", { day: "numeric" });
  const rest = d.toLocaleDateString("nb-NO", { month: "short", year: "numeric" });
  return { day, rest };
}

export function RundeQueueList({ rows }: { rows: RundeRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Kolonne-header — kun fra sm og opp (mobil bruker rad-layout) */}
      <div
        className="hidden border-b border-border px-4 py-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground sm:grid sm:items-center"
        style={{ gridTemplateColumns: "84px 1fr 64px 60px 64px 20px", gap: "12px" }}
      >
        <span>Dato</span>
        <span>Bane</span>
        <span className="text-right">Score</span>
        <span className="text-right">Vs par</span>
        <span className="text-right">SG</span>
        <span aria-hidden />
      </div>

      <ul>
        {rows.map((r, idx) => {
          const { day, rest } = dateParts(r.playedAt);
          return (
            <li key={r.id} className={cn(idx > 0 && "border-t border-border")}>
              <Link
                href={`/portal/mal/runder/${r.id}`}
                className={cn(
                  "group grid items-center gap-x-3 gap-y-1.5 px-4 py-3.5 transition-colors hover:bg-secondary",
                  // Mobil: dato | bane+score (2 linjer). sm+: full kolonne-grid.
                  "grid-cols-[44px_1fr_auto]",
                  "sm:grid-cols-[84px_1fr_64px_60px_64px_20px]",
                  // Subtil lime-glød til venstre på beste runde
                  r.isBest && "bg-accent/[0.06]",
                )}
              >
                {/* Dato */}
                <div className="font-mono leading-tight text-foreground">
                  <span className="block text-base font-extrabold tabular-nums sm:text-sm">
                    {day}
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    {rest}
                  </span>
                </div>

                {/* Bane + meta (+ ★beste på mobil) */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold tracking-[-0.005em] text-foreground">
                      {r.courseName}
                    </span>
                    {r.isBest && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-[2px] font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary shadow-[0_0_8px_hsl(var(--accent)/0.7)]">
                        <Star className="h-[10px] w-[10px] fill-current" strokeWidth={2} aria-hidden />
                        Beste
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    Par {r.par}
                  </div>
                  {/* Mobil-rad: score + vs-par + SG inline (skjult fra sm) */}
                  <div className="mt-1.5 flex items-center gap-2 sm:hidden">
                    <span className="font-mono text-base font-bold tabular-nums text-foreground">
                      {r.score}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums",
                        vsParPillClass(r.vsPar),
                      )}
                    >
                      {r.vsPar > 0 ? "+" : ""}
                      {r.vsPar}
                    </span>
                    <span className={cn("font-mono text-xs font-semibold tabular-nums", sgClass(r.sgTotal))}>
                      SG {formatSg(r.sgTotal)}
                    </span>
                  </div>
                </div>

                {/* Score — sm+ */}
                <span className="hidden text-right font-mono text-base font-bold tabular-nums text-foreground sm:block">
                  {r.score}
                </span>

                {/* Vs par — sm+ */}
                <span className="hidden justify-self-end sm:block">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-sm px-2 py-1 font-mono text-xs font-semibold tabular-nums",
                      vsParPillClass(r.vsPar),
                    )}
                  >
                    {r.vsPar > 0 ? "+" : ""}
                    {r.vsPar}
                  </span>
                </span>

                {/* SG — sm+ */}
                <span
                  className={cn(
                    "hidden text-right font-mono text-sm font-semibold tabular-nums sm:block",
                    sgClass(r.sgTotal),
                  )}
                >
                  {formatSg(r.sgTotal)}
                </span>

                {/* Chevron */}
                <ChevronRight
                  className="h-4 w-4 shrink-0 justify-self-end text-muted-foreground transition-colors group-hover:text-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
