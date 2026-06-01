"use client";

/**
 * TrackMan sesjonsanalyse — interaktiv Bag-view (klient).
 * Pixel-port av public/design-handover/playerhq/components-trackman.html.
 *
 * Holder valgt-kølle state. Bag-strip (venstre/topp) styrer dispersjons-plott +
 * parameter-panel. All data kommer ferdig-aggregert fra serveren
 * (lib/portal-trackman/session-analysis). Ingen falske tall: køller uten data
 * vises som "is-off", parametere uten verdi som "—".
 *
 * DS-tokens og lucide-ikoner gjennomgående; plot-fargene bruker hsl(var(--*)).
 */

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  ClubAnalysis,
  ParamRow,
  Stability,
  Confidence,
} from "@/lib/portal-trackman/session-analysis";

// ── Farge-mapping (DS-tokens) ────────────────────────────────────────────────
const stabFill: Record<Stability, string> = {
  good: "hsl(var(--success))",
  warn: "hsl(var(--warning))",
  bad: "hsl(var(--destructive))",
};

const confDot: Record<Confidence, string> = {
  high: "hsl(var(--success))",
  medium: "hsl(var(--warning))",
  low: "hsl(var(--destructive))",
  off: "transparent",
};

const catLabel: Record<ClubAnalysis["category"], string> = {
  wood: "W",
  long: "L",
  mid: "M",
  short: "S",
  wedge: "K",
  putter: "P",
};

export function SessionAnalysisClient({ clubs }: { clubs: ClubAnalysis[] }) {
  // Velg første kølle med data og høyest slag-antall som default
  const defaultClub = useMemo(() => {
    const withData = clubs.filter((c) => c.shotCount > 0);
    if (withData.length === 0) return null;
    return [...withData].sort((a, b) => b.shotCount - a.shotCount)[0].club;
  }, [clubs]);

  const [selected, setSelected] = useState<string | null>(defaultClub);
  const active = clubs.find((c) => c.club === selected) ?? null;

  const registered = clubs.filter((c) => c.shotCount > 0).length;

  return (
    <div className="space-y-4">
      {/* ── BAG STRIP ── */}
      <section className="rounded-[14px] border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Min bag · <b className="text-foreground">{registered}</b> registrert · klikk for å analysere
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            <Legend color="hsl(var(--success))" label="Stødig" />
            <Legend color="hsl(var(--warning))" label="Inkonsistent" />
            <Legend color="hsl(var(--destructive))" label="Trenger jobbing" />
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
          {clubs.map((club) => (
            <BagClub
              key={club.club}
              club={club}
              active={club.club === selected}
              onSelect={() => club.shotCount > 0 && setSelected(club.club)}
            />
          ))}
        </div>
      </section>

      {/* ── DISPERSION + PARAMETERS ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        {active ? (
          <>
            <DispersionPanel club={active} />
            <ParamsPanel club={active} />
          </>
        ) : (
          <div className="lg:col-span-2 rounded-[14px] border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="text-[14px] text-muted-foreground">
              Ingen kølle valgt — velg en kølle med data i baggen over.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bag-kølle-kort ────────────────────────────────────────────────────────────
function BagClub({
  club,
  active,
  onSelect,
}: {
  club: ClubAnalysis;
  active: boolean;
  onSelect: () => void;
}) {
  const isOff = club.shotCount === 0;
  const stabPct = club.stability !== null ? club.stability * 10 : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isOff}
      aria-pressed={active}
      className={cn(
        "relative flex flex-col gap-1 rounded-[10px] border px-2.5 pb-2.5 pt-2.5 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active
          ? "border-primary bg-primary shadow-[0_8px_18px_rgba(10,31,23,0.16)]"
          : isOff
            ? "border-border bg-background opacity-50"
            : "border-border bg-secondary hover:-translate-y-px hover:border-input hover:bg-secondary/70",
      )}
    >
      {/* Konfidens-prikk */}
      {!isOff && (
        <span
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
          style={{ background: confDot[club.confidence] }}
          aria-hidden
        />
      )}
      <span className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "font-mono text-[10.5px] font-bold uppercase tracking-[0.06em]",
            active ? "text-background" : "text-foreground",
          )}
        >
          {club.club}
        </span>
        <span
          className={cn(
            "font-mono text-[8.5px] font-semibold",
            active ? "text-background/60" : "text-muted-foreground/70",
          )}
        >
          {catLabel[club.category]}
        </span>
      </span>

      <span
        className={cn(
          "font-mono text-[22px] font-bold leading-none tracking-[-0.025em] tabular-nums",
          active ? "text-background" : "text-foreground",
        )}
      >
        {club.carry ?? "—"}
        {club.carry !== null && (
          <span className={cn("ml-0.5 text-[11px] font-semibold", active ? "text-background/60" : "text-muted-foreground")}>
            yd
          </span>
        )}
      </span>

      <span
        className={cn(
          "font-mono text-[10px] font-medium tabular-nums tracking-[0.02em]",
          active ? "text-background/70" : "text-muted-foreground",
        )}
      >
        {isOff
          ? "ingen data"
          : `${club.spread95 != null ? `±${club.spread95} yd · ` : ""}${club.shotCount} slag`}
      </span>

      {/* Stabilitets-bar */}
      {!isOff && (
        <span className="mt-0.5 flex items-center gap-1.5">
          <span
            className={cn(
              "h-1 flex-1 overflow-hidden rounded-full",
              active ? "bg-white/20" : "bg-secondary",
            )}
            style={!active ? { background: "hsl(var(--border))" } : undefined}
          >
            <span
              className="block h-full rounded-full"
              style={{
                width: `${stabPct}%`,
                background: active ? "hsl(var(--accent))" : stabFill[club.stabilityTone],
              }}
            />
          </span>
          <span
            className={cn(
              "font-mono text-[10px] font-bold tabular-nums",
              active ? "text-accent" : "text-muted-foreground",
            )}
          >
            {club.stability !== null ? club.stability.toFixed(1) : "—"}
          </span>
        </span>
      )}
    </button>
  );
}

// ── Dispersjons-panel ───────────────────────────────────────────────────────
function DispersionPanel({ club }: { club: ClubAnalysis }) {
  return (
    <section className="rounded-[14px] border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display text-[15px] font-bold tracking-[-0.015em] text-foreground">
            {club.club} · spredning
          </div>
          <div className="font-mono text-[10.5px] tabular-nums tracking-[0.02em] text-muted-foreground">
            {club.shotCount} slag · sett ovenfra
          </div>
        </div>
      </div>

      <DispersionPlot club={club} />

      {/* Footer-statistikk */}
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-4">
        <FootCell label="Snitt-distanse" value={club.carry} unit="yd" />
        <FootCell label="Spread (95 %)" value={club.spread95} unit="yd" prefix="±" />
        <FootCell
          label="Sidemiss snitt"
          value={club.sideMean}
          unit={club.sideMean != null ? (club.sideMean >= 0 ? "yd høyre" : "yd venstre") : "yd"}
          signedAbs
        />
        <FootCell label="Innenfor pin" value={club.withinPinPct} unit="%" />
      </div>
    </section>
  );
}

function FootCell({
  label,
  value,
  unit,
  prefix,
  signedAbs,
}: {
  label: string;
  value: number | null;
  unit: string;
  prefix?: string;
  signedAbs?: boolean;
}) {
  let display: string;
  if (value === null) {
    display = "—";
  } else if (signedAbs) {
    display = `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value)}`;
  } else {
    display = `${prefix ?? ""}${value}`;
  }
  return (
    <div className="bg-card px-3 py-2.5">
      <span className="block font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 block font-mono text-[18px] font-bold leading-none tabular-nums tracking-[-0.02em] text-foreground">
        {display}
        {value !== null && (
          <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{unit}</span>
        )}
      </span>
    </div>
  );
}

// ── Dispersjons-plott (top-down, ekte punkter) ────────────────────────────────
const PLOT_W = 620;
const PLOT_H = 440;

function DispersionPlot({ club }: { club: ClubAnalysis }) {
  const pts = club.dispersion;

  // Plot-skala: bruk maks-utstrekning, minimum ±20 yd side / ±20 yd dybde
  const maxSide = Math.max(20, ...pts.map((p) => Math.abs(p.side)));
  const maxDepth = Math.max(20, ...pts.map((p) => Math.abs(p.depth)));

  const cx = PLOT_W / 2;
  const cy = PLOT_H / 2;
  const padX = 60;
  const padY = 50;
  const spanX = (PLOT_W / 2 - padX);
  const spanY = (PLOT_H / 2 - padY);

  const toX = (side: number) => cx + (side / maxSide) * spanX;
  const toY = (depth: number) => cy - (depth / maxDepth) * spanY;

  // Snitt-punkt + 1σ ellipse (i yd → px)
  const meanSide = pts.length ? pts.reduce((a, p) => a + p.side, 0) / pts.length : 0;
  const meanDepth = pts.length ? pts.reduce((a, p) => a + p.depth, 0) / pts.length : 0;
  const sdSide = stdOf(pts.map((p) => p.side));
  const sdDepth = stdOf(pts.map((p) => p.depth));
  const ellRx = (sdSide / maxSide) * spanX;
  const ellRy = (sdDepth / maxDepth) * spanY;

  // Pin-radius = 5 % av snitt carry
  const pinR = club.carry != null ? club.carry * 0.05 : maxSide * 0.3;
  const pinRpx = (pinR / maxSide) * spanX;

  return (
    <div
      className="relative overflow-hidden rounded-[14px] border border-border"
      style={{
        background:
          "radial-gradient(ellipse 60% 75% at 50% 40%, hsl(var(--success)/0.10) 0%, hsl(var(--success)/0.03) 55%, transparent 100%), hsl(var(--background))",
      }}
    >
      <svg
        viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-auto w-full"
        aria-label={`Spredningsplott ${club.club}, ${club.shotCount} slag`}
      >
        {/* Grid */}
        {[-0.66, -0.33, 0.33, 0.66].map((f, i) => (
          <line
            key={`v${i}`}
            x1={cx + f * spanX} y1={padY} x2={cx + f * spanX} y2={PLOT_H - padY}
            stroke="hsl(var(--border))" strokeWidth={1}
          />
        ))}
        {[-0.66, -0.33, 0.33, 0.66].map((f, i) => (
          <line
            key={`h${i}`}
            x1={padX} y1={cy + f * spanY} x2={PLOT_W - padX} y2={cy + f * spanY}
            stroke="hsl(var(--border))" strokeWidth={1}
          />
        ))}
        {/* Mål-akser */}
        <line x1={cx} y1={padY} x2={cx} y2={PLOT_H - padY} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 4" opacity={0.45} strokeWidth={1} />
        <line x1={padX} y1={cy} x2={PLOT_W - padX} y2={cy} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 4" opacity={0.45} strokeWidth={1} />

        {/* Pin-radius (5 %) */}
        {pinRpx > 0 && (
          <>
            <circle
              cx={cx} cy={cy} r={pinRpx}
              fill="hsl(var(--success)/0.08)"
              stroke="hsl(var(--success))" strokeWidth={1.5} strokeDasharray="4 3"
            />
            <text x={cx} y={cy - pinRpx - 6} textAnchor="middle" fill="hsl(var(--success))" fontSize={9.5} fontWeight={700}
              style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)", letterSpacing: "0.04em" }}>
              pin-radius · ±{pinR.toFixed(0)} yd
            </text>
          </>
        )}

        {/* 1σ konfidens-ellipse */}
        {pts.length >= 3 && ellRx > 0 && ellRy > 0 && (
          <ellipse
            cx={toX(meanSide)} cy={toY(meanDepth)}
            rx={ellRx} ry={ellRy}
            fill="hsl(var(--primary)/0.07)"
            stroke="hsl(var(--primary))" strokeWidth={1.5} strokeDasharray="2 3"
          />
        )}

        {/* Mål-kryss */}
        <line x1={cx - 11} y1={cy} x2={cx + 11} y2={cy} stroke="hsl(var(--primary))" strokeWidth={1.5} />
        <line x1={cx} y1={cy - 11} x2={cx} y2={cy + 11} stroke="hsl(var(--primary))" strokeWidth={1.5} />

        {/* Slag-punkter */}
        {pts.map((p, i) => {
          const r = Math.sqrt(p.side ** 2 + p.depth ** 2);
          const fill =
            r <= pinR
              ? "hsl(var(--success))"
              : r <= pinR * 2
                ? "hsl(var(--warning))"
                : "hsl(var(--destructive))";
          return (
            <circle
              key={i}
              cx={toX(p.side)} cy={toY(p.depth)} r={4}
              fill={fill}
              stroke="hsl(var(--card))" strokeWidth={0.8}
              opacity={r > pinR * 2 ? 0.85 : 1}
            />
          );
        })}

        {/* Snitt-punkt */}
        {pts.length > 0 && (
          <circle
            cx={toX(meanSide)} cy={toY(meanDepth)} r={5}
            fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth={2}
          />
        )}

        {/* Akse-etiketter */}
        <text x={cx} y={PLOT_H - 14} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10} fontWeight={600}
          style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Side-avvik · yd
        </text>
        <text x={padX - 8} y={padY - 14} textAnchor="start" fill="hsl(var(--muted-foreground))" fontSize={10} fontWeight={600}
          style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Carry-avvik · yd
        </text>
        <text x={cx + 4} y={cy - 6} fill="hsl(var(--primary))" fontSize={9.5} fontWeight={700}
          style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
          MÅL
        </text>
      </svg>

      {/* Tom-tilstand når ingen punkter har side+carry */}
      {pts.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-md bg-card/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
            Mangler side-/carry-data for spredning
          </span>
        </div>
      )}
    </div>
  );
}

function stdOf(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
}

// ── Parameter-panel ───────────────────────────────────────────────────────────
function ParamsPanel({ club }: { club: ClubAnalysis }) {
  return (
    <aside className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <header className="border-b border-border pb-3">
        <div className="font-display text-[16px] font-bold tracking-[-0.015em] text-foreground">
          {club.club}
        </div>
        <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
          {club.shotCount} slag
          {club.stability !== null && ` · stabilitet ${club.stability.toFixed(1)}/10`}
        </div>
      </header>

      <ParamGroup label="Resultat" rows={club.params.resultat} />
      <ParamGroup label="Ball" rows={club.params.ball} />
      <ParamGroup label="Klubblevering" rows={club.params.klubb} />
    </aside>
  );
}

function ParamGroup({ label, rows }: { label: string; rows: ParamRow[] }) {
  return (
    <div>
      <span className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <div className="space-y-0.5">
        {rows.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-[1fr_auto_auto] items-baseline gap-2 border-b border-border/50 py-1 last:border-b-0"
          >
            <span className="text-[12px] text-foreground">{row.name}</span>
            <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
              {row.value ?? "—"}
              {row.value !== null && row.unit && (
                <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{row.unit}</span>
              )}
            </span>
            <span
              className={cn(
                "inline-flex min-w-[42px] justify-center rounded-[5px] px-1.5 py-px font-mono text-[10px] font-semibold tabular-nums",
                row.sd === null
                  ? "text-transparent"
                  : row.sdTone === "warn"
                    ? "bg-warning/15 text-warning"
                    : "bg-success/12 text-success",
              )}
            >
              {row.sd === null ? "—" : `±${row.sd}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Småkomponenter ─────────────────────────────────────────────────────────────
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className="inline-block h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}
