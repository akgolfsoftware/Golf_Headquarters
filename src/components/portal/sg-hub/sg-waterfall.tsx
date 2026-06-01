/**
 * SG Waterfall — PlayerHQ /portal/mal/sg-hub
 *
 * Pixel-tro port av public/design-handover/playerhq/components-sg-waterfall.html,
 * tilpasset mobil-først (430px) og ekte data.
 *
 * Datagrunnlag: skjemaet lagrer SG kun på runde-nivå, ikke per hull. Waterfall-
 * barene viser derfor score-mot-par per hull (det datagrunnlaget faktisk har):
 * stolpe opp = under par, stolpe ned = over par. Kumulativ-linja viser løpende
 * score-mot-par. SG-kategori-kortene leses fra runde-aggregatet mot Tour-nullinjen.
 *
 * Kun lucide-ikoner, kun DS-tokens. Server component.
 */

import {
  ArrowRight,
  Database,
  Flag,
  Info,
  Lightbulb,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { formatSg } from "@/lib/sg";
import { cn } from "@/lib/utils";
import type {
  NineSummary,
  SgCategory,
  WaterfallData,
  WaterfallHole,
} from "@/lib/portal-sghub/sg-waterfall-data";

/** Format score-mot-par: "−2", "E", "+3". */
function fmtToPar(v: number): string {
  if (v === 0) return "E";
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

/** Plott-høyde i px (over og under nullinja). Holder grafen på én skjerm. */
const PLOT_HALF = 96;

function scoreBadgeClass(toPar: number): string {
  if (toPar <= -2) return "bg-primary text-accent"; // eagle+
  if (toPar === -1) return "bg-accent text-primary"; // birdie
  if (toPar === 0) return "border border-border text-foreground"; // par
  if (toPar === 1) return "bg-secondary text-foreground"; // bogey
  return "bg-destructive/15 text-destructive"; // dobbel+
}

export function SgWaterfall({ data }: { data: WaterfallData }) {
  if (data.state === "empty") return <EmptyState />;

  const { holes } = data;

  // Symmetrisk vertikal skala basert på største avvik (min ±2 slag).
  const maxAbs = Math.max(2, ...holes.map((h) => Math.abs(h.toPar)));
  const pxPerStroke = PLOT_HALF / maxAbs;

  // Kumulativ-linja: symmetrisk skala for kumulativ score-mot-par.
  const cumMaxAbs = Math.max(3, ...holes.map((h) => Math.abs(h.cumToPar)));

  const dateLabel = data.playedAt
    ? data.playedAt
        .toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })
        .toUpperCase()
    : "";

  return (
    <div className="space-y-4">
      {/* SG-kategori-kort (OTT/APP/ARG/PUTT vs PGA Tour 0-linje) */}
      <CategoryCards categories={data.categories} sgTotal={data.sgTotal} />

      {/* Waterfall-panel */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Panel-tittel */}
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3.5 md:px-6">
          <div>
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
              SG mot Tour-snitt
              <span className="font-normal italic text-primary"> · runde-detalj</span>
            </h2>
            <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
              {data.courseName?.toUpperCase()}
              <span className="mx-1.5 text-border">·</span>
              {dateLabel}
              <span className="mx-1.5 text-border">·</span>
              <span className="text-foreground">PAR {data.coursePar}</span>
              <span className="mx-1.5 text-border">·</span>
              SCORE <span className="text-foreground">{data.roundScore}</span>
            </div>
          </div>
          <div className="font-mono text-right">
            <div className="text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              SG Total
            </div>
            <div
              className={cn(
                "text-2xl font-bold leading-none tabular-nums",
                data.sgTotal == null
                  ? "text-muted-foreground"
                  : data.sgTotal >= 0
                    ? "text-success"
                    : "text-destructive",
              )}
            >
              {formatSg(data.sgTotal)}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border bg-background px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground md:px-6">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-accent" /> UNDER PAR
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-destructive/70" /> OVER PAR
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="22" height="6" aria-hidden>
              <line x1="0" y1="3" x2="22" y2="3" stroke="hsl(var(--primary))" strokeWidth="2" />
            </svg>
            KUMULATIV
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 tracking-[0.06em]">
            <Database className="h-2.5 w-2.5 opacity-70" strokeWidth={1.75} aria-hidden />
            SCORE-MOT-PAR · {data.holesLogged} HULL
          </span>
        </div>

        {/* Lav konfidens-stripe */}
        {data.state === "low" && (
          <div className="flex items-start gap-2 border-b border-border bg-warning/10 px-4 py-2.5 md:px-6">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
            <p className="text-[11px] leading-snug text-foreground">
              <b className="font-semibold">{data.holesLogged} hull logget.</b> Visningen gir{" "}
              <em className="italic text-primary">retning</em>, ikke konklusjon. Fullfør runden for full
              waterfall.
            </p>
          </div>
        )}

        {/* Waterfall-canvas — horisontal scroll på mobil */}
        <div className="overflow-x-auto px-2 py-4 md:px-4">
          <WaterfallPlot
            holes={holes}
            pxPerStroke={pxPerStroke}
            cumMaxAbs={cumMaxAbs}
            bestHoleIdx={data.bestHoleIdx}
            worstHoleIdx={data.worstHoleIdx}
          />
        </div>

        {/* Front / Back-summering */}
        {(data.front || data.back) && (
          <div className="grid grid-cols-1 border-t border-border sm:grid-cols-2">
            {data.front && <NineCol nine={data.front} />}
            {data.back && (
              <NineCol nine={data.back} className="border-t border-border sm:border-l sm:border-t-0" />
            )}
          </div>
        )}

        {/* Lesebar / narrativ */}
        <ReadingBar data={data} />
      </section>
    </div>
  );
}

/* ───────────────────── SG-kategori-kort ───────────────────── */

const categoryAccent: Record<SgCategory["key"], string> = {
  ott: "border-t-primary",
  app: "border-t-warning",
  arg: "border-t-[color:var(--muted-foreground)]",
  putt: "border-t-accent",
};

function CategoryCards({
  categories,
  sgTotal,
}: {
  categories: SgCategory[];
  sgTotal: number | null;
}) {
  const harData = categories.some((c) => c.value != null) || sgTotal != null;
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {categories.map((c) => {
        const positiv = c.value != null && c.value >= 0;
        return (
          <div
            key={c.key}
            className={cn(
              "rounded-xl border border-t-[3px] border-border bg-card p-4",
              categoryAccent[c.key],
            )}
          >
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              SG · {c.short}
            </div>
            <div
              className={cn(
                "mt-2 font-mono text-2xl font-bold leading-none tabular-nums",
                c.value == null
                  ? "text-muted-foreground"
                  : positiv
                    ? "text-success"
                    : "text-destructive",
              )}
            >
              {formatSg(c.value)}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              {c.label}
            </div>
          </div>
        );
      })}
      {!harData && (
        <p className="col-span-2 font-mono text-[10px] text-muted-foreground lg:col-span-4">
          SG-kategorier vises når runden har registrert SG mot Tour-snitt.
        </p>
      )}
    </div>
  );
}

/* ───────────────────── Waterfall-plott ───────────────────── */

function WaterfallPlot({
  holes,
  pxPerStroke,
  cumMaxAbs,
  bestHoleIdx,
  worstHoleIdx,
}: {
  holes: WaterfallHole[];
  pxPerStroke: number;
  cumMaxAbs: number;
  bestHoleIdx: number | null;
  worstHoleIdx: number | null;
}) {
  const colW = 40; // px pr. hull
  const plotH = PLOT_HALF * 2;
  const totalW = holes.length * colW;

  // Kumulativ-linje: y=midt er 0; cumToPar skaleres mot cumMaxAbs.
  const cumPts = holes.map((h, i) => ({
    x: i * colW + colW / 2,
    y: PLOT_HALF - (h.cumToPar / cumMaxAbs) * (PLOT_HALF - 6),
  }));
  const cumPath = cumPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="flex gap-2">
      {/* Y-akse-etiketter */}
      <div
        className="relative w-7 shrink-0 font-mono text-[8px] font-bold tabular-nums text-muted-foreground"
        style={{ height: plotH }}
        aria-hidden
      >
        <span className="absolute right-1 top-0 -translate-y-1/2">+{Math.round(cumMaxAbs)}</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-foreground">0</span>
        <span className="absolute bottom-0 right-1 translate-y-1/2">
          {"−"}
          {Math.round(cumMaxAbs)}
        </span>
      </div>

      <div className="min-w-0">
        {/* Plott */}
        <div className="relative" style={{ width: totalW, height: plotH }}>
          {/* Gridlinjer */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 right-0 border-t border-dashed border-border" style={{ top: 0 }} />
            <div
              className="absolute left-0 right-0 border-t-2 border-primary"
              style={{ top: PLOT_HALF }}
            />
            <div className="absolute left-0 right-0 border-t border-dashed border-border" style={{ top: plotH - 1 }} />
          </div>

          {/* Stolper */}
          {holes.map((h, i) => {
            const mag = Math.abs(h.toPar) * pxPerStroke;
            const under = h.toPar < 0; // under par = bra = opp
            const isBest = i === bestHoleIdx;
            const isWorst = i === worstHoleIdx;
            return (
              <div
                key={h.hole}
                className="absolute top-0 flex h-full justify-center"
                style={{ left: i * colW, width: colW }}
              >
                {h.toPar !== 0 && (
                  <div
                    className={cn(
                      "absolute w-[16px] rounded-[2px]",
                      under ? "bg-accent" : "bg-destructive/70",
                    )}
                    style={
                      under
                        ? { bottom: PLOT_HALF, height: mag }
                        : { top: PLOT_HALF, height: mag }
                    }
                  />
                )}
                {(isBest || isWorst) && (
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 rounded-[3px] px-1 py-px font-mono text-[7px] font-extrabold uppercase tracking-[0.06em]",
                      isBest ? "bg-accent text-primary" : "bg-destructive text-background",
                    )}
                    style={{ top: under ? PLOT_HALF - mag - 14 : PLOT_HALF + mag + 4 }}
                  >
                    {isBest ? "BESTE" : "VERSTE"}
                  </span>
                )}
              </div>
            );
          })}

          {/* Kumulativ-linje */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={totalW}
            height={plotH}
            viewBox={`0 0 ${totalW} ${plotH}`}
            aria-hidden
          >
            <path d={cumPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
            {cumPts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="hsl(var(--primary))" />
            ))}
          </svg>
        </div>

        {/* Hull-etiketter */}
        <div className="mt-2 flex border-t border-border pt-1.5" style={{ width: totalW }}>
          {holes.map((h) => (
            <div key={h.hole} className="flex flex-col items-center" style={{ width: colW }}>
              <span className="font-mono text-[9px] font-extrabold tabular-nums text-foreground">
                {h.hole}
              </span>
              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                P{h.par}
              </span>
              <span
                className={cn(
                  "mt-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-extrabold tabular-nums",
                  scoreBadgeClass(h.toPar),
                )}
              >
                {h.strokes}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Front/Back-kolonne ───────────────────── */

function NineCol({ nine, className }: { nine: NineSummary; className?: string }) {
  const positiv = nine.toPar <= 0;
  return (
    <div className={cn("bg-background px-4 py-4 md:px-6", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="font-display text-base font-bold tracking-[-0.02em]">{nine.label}</div>
          <div className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            {nine.holes} HULL · PAR {nine.parsumm} · SCORE {nine.score}
          </div>
        </div>
        <div
          className={cn(
            "font-mono text-xl font-bold leading-none tabular-nums",
            positiv ? "text-success" : "text-destructive",
          )}
        >
          {fmtToPar(nine.toPar)}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Lesebar / narrativ ───────────────────── */

function ReadingBar({ data }: { data: WaterfallData }) {
  const worst =
    data.worstHoleIdx != null ? data.holes[data.worstHoleIdx] : null;
  const best = data.bestHoleIdx != null ? data.holes[data.bestHoleIdx] : null;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center md:px-6">
      <Lightbulb className="hidden h-4 w-4 shrink-0 text-primary sm:block" strokeWidth={1.75} aria-hidden />
      <p className="flex-1 text-[13px] leading-relaxed text-foreground">
        {worst ? (
          <>
            <b className="font-semibold">Hull {worst.hole}</b> kostet mest ({fmtToPar(worst.toPar)} mot par).
            {best ? (
              <>
                {" "}
                Lyspunktet var <em className="italic text-primary">hull {best.hole}</em> ({fmtToPar(best.toPar)}).
              </>
            ) : null}{" "}
            Knytt svakhetene til neste plan for målrettet trening.
          </>
        ) : (
          <>Jevn runde uten store utslag. Knytt SG-kategoriene over til neste plan.</>
        )}
      </p>
      <Link
        href="/portal/tren/teknisk-plan"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full bg-primary px-4 font-sans text-xs font-bold text-accent hover:opacity-90 sm:self-auto"
      >
        Knytt til neste plan
        <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}

/* ───────────────────── Tom tilstand ───────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted-foreground">
        <Flag className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="font-display text-base font-bold tracking-[-0.015em]">Ingen runde-data ennå</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        SG-waterfall vises etter første loggførte runde med{" "}
        <b className="font-semibold text-foreground">slag-for-slag-data</b>.
      </p>
      <Link
        href="/portal/mal/runder/ny"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 font-sans text-sm font-bold text-accent hover:opacity-90"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Logg runde
      </Link>
    </div>
  );
}
