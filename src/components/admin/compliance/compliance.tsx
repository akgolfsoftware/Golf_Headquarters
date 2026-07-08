/**
 * Compliance-oversikt (AgencyOS · §5 Compliance) — presentasjonell, props-drevet.
 *
 * Pixel-port av fasit [historisk fasit, fjernet 2026-07-03] _screens/ag-compliance.png
 * (som er den rendrede compliance-skjermen) + design-HTML
 * [historisk fasit, fjernet 2026-07-03] agencyos/components-compliance.html.
 *
 * Tre nivåer i samme språk:
 *   1) Spillerpanel-modul — plan-fullføring for ÉN spiller
 *      (donut + uke-strip + akse-barometer + coach-lesbar diagnose)
 *   2) Stall-tabell — compliance% per spiller (ring + bar + sparkline),
 *      sortert "bak plan først"
 *   3) Drill-fullføring — planlagte drills i siste loggede økt
 *
 * Bygget kun med DS-tokens + athletic Sparkline. Ingen hardkodet hex, ingen emoji,
 * ingen Prisma/DB. Alle tall kommer inn via props (ComplianceData).
 */

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Dot,
  Lightbulb,
  MessageCircle,
  Minus,
  Plus,
  X,
} from "lucide-react";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { Sparkline } from "@/components/athletic/sparkline";
import { cn } from "@/lib/utils";

// ── Typer (selvstendige — ingen lib-import) ───────────────────────
export type ComplianceAxis = "fys" | "tek" | "slag" | "spill" | "turn";

/** Status-bånd for compliance% mot mål (100%). */
export type ComplianceBand = "bad" | "warn" | "ok" | "over";

export type AxisBar = {
  axis: ComplianceAxis;
  label: string;
  done: number;
  planned: number;
  pct: number;
  band: ComplianceBand;
  /** delta = done − planlagt antall økter (negativ = bak plan). */
  delta: number;
};

export type WeekBar = {
  label: string;
  done: number;
  planned: number;
  /** Fyllingshøyde 0–1 (done/planned, kappet på 1). */
  fill: number;
  band: ComplianceBand;
  isNow: boolean;
};

export type PlayerPanel = {
  playerId: string;
  playerName: string;
  totalPlanned: number;
  totalDone: number;
  pct: number;
  band: ComplianceBand;
  axes: AxisBar[];
  weeks: WeekBar[];
  /** Coach-lesbar diagnose utledet fra aksene — null hvis ingen plan. */
  diagnosis: string | null;
};

export type StallRow = {
  playerId: string;
  playerName: string;
  initials: string;
  hcp: number | null;
  homeClub: string | null;
  planned: number;
  done: number;
  pct: number;
  band: ComplianceBand;
  lastLog: string;
  lastLogBand: "ok" | "warn" | "bad";
  /** Uke-for-uke fullføringsgrad (0–1) til sparkline. */
  spark: number[];
  /** Antall dager siden siste logg. null = aldri. */
  staleDays: number | null;
};

export type DrillRow = {
  id: string;
  name: string;
  axis: ComplianceAxis | null;
  axisLabel: string | null;
  planned: string;
  done: boolean;
};

export type DrillSession = {
  sessionId: string;
  title: string;
  playerName: string;
  dateLabel: string;
  durationMin: number;
  plannedCount: number;
  doneCount: number;
  drills: DrillRow[];
} | null;

export type ComplianceData = {
  periodLabel: string;
  windowDays: number;
  panel: PlayerPanel | null;
  players: { id: string; name: string }[];
  selectedPlayerId: string | null;
  stall: StallRow[];
  cohortAvg: number | null;
  cohortMedian: number | null;
  staleCount: number;
  drillSession: DrillSession;
};

// ── Token-kart ────────────────────────────────────────────────────
const axisSwatch: Record<ComplianceAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

/** Fyll-farge for compliance-bånd (bar/ring/akse-fyll). */
const bandFill: Record<ComplianceBand, string> = {
  bad: "bg-destructive",
  warn: "bg-warning",
  ok: "bg-primary",
  over: "bg-success",
};

const bandStroke: Record<ComplianceBand, string> = {
  bad: "stroke-destructive",
  warn: "stroke-warning",
  ok: "stroke-primary",
  over: "stroke-success",
};

const bandTagClass: Record<ComplianceBand, string> = {
  bad: "bg-destructive/10 text-destructive",
  warn: "bg-warning/15 text-warning",
  ok: "bg-primary/10 text-primary",
  over: "bg-success/10 text-success",
};

const bandTagLabel: Record<ComplianceBand, string> = {
  bad: "BAK PLAN",
  warn: "UNDER",
  ok: "PÅ SPORET",
  over: "UTFORDRE",
};

// ── Små byggeklosser ──────────────────────────────────────────────
function SectionHead({
  index,
  title,
  sub,
  count,
}: {
  index: number;
  title: string;
  sub: string;
  count: string;
}) {
  return (
    <div className="mb-3.5 mt-8 flex items-center gap-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground first:mt-0">
      <span className="shrink-0">
        {index} · {title}
      </span>
      <span className="hidden shrink-0 font-bold tracking-[0.04em] text-muted-foreground sm:inline">
        {sub}
      </span>
      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] tracking-[0.06em] text-muted-foreground">
        {count}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

function PanelTitle({
  title,
  eyebrow,
  metaLead,
  metaValue,
}: {
  title: string;
  eyebrow: string;
  metaLead: string;
  metaValue: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1 px-5 pb-3 pt-4">
      <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-foreground">{title}</h2>
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {eyebrow}
      </span>
      <span className="ml-auto font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
        {metaLead} <b className="font-extrabold text-foreground">{metaValue}</b>
      </span>
    </div>
  );
}

function FootRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border bg-background px-5 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}

function EmptyPanelNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-16 text-center">
      <p className="text-[13px] text-muted-foreground">{children}</p>
    </div>
  );
}

// ── Spillervelger (presentasjonell — peker til ?player=) ──────────
function PlayerSelect({
  players,
  selectedId,
}: {
  players: { id: string; name: string }[];
  selectedId: string | null;
}) {
  const selected = players.find((p) => p.id === selectedId);
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        SPILLER
      </span>
      <span className="inline-flex h-9 items-center gap-3 rounded-lg border border-border bg-card px-3.5 font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
        {selected?.name ?? "—"}
        <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={2} aria-hidden />
      </span>
    </div>
  );
}

// ── Donut (Section 1) ─────────────────────────────────────────────
function Donut({
  pct,
  band,
  done,
  planned,
}: {
  pct: number;
  band: ComplianceBand;
  done: number;
  planned: number;
}) {
  const r = 85;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(1, pct / 100) * circ;
  return (
    <div className="relative h-[184px] w-[184px]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="100" cy="100" r={r} strokeWidth="20" fill="none" className="stroke-secondary" />
        <circle
          cx="100"
          cy="100"
          r={r}
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          className={bandStroke[band]}
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[50px] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-foreground">
          {pct}
          <span className="ml-px text-[22px] font-bold text-muted-foreground">%</span>
        </div>
        <div className="mt-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          FULLFØRT
        </div>
        <div className="mt-1.5 font-mono text-[11px] font-bold tabular-nums text-foreground">
          <b className="font-extrabold">{done}</b> av <b className="font-extrabold">{planned}</b> økter
        </div>
      </div>
    </div>
  );
}

// ── Uke-strip (Section 1) ─────────────────────────────────────────
function WeekStrip({ weeks }: { weeks: WeekBar[] }) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="mb-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        UKE-FOR-UKE
      </div>
      <div
        className="grid h-[60px] items-end gap-1"
        style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
      >
        {weeks.map((w, i) => (
          <div
            key={i}
            className={cn(
              "relative min-h-[6px] rounded-t bg-secondary",
              w.isNow && "outline outline-2 outline-offset-1 outline-accent",
            )}
            style={{ height: `${Math.max(w.planned === 0 ? 8 : w.fill * 100, 8)}%` }}
            title={`${w.label}: ${w.done}/${w.planned} økter`}
          >
            {w.planned > 0 && (
              <div
                className={cn("absolute inset-x-0 bottom-0 rounded-t", bandFill[w.band])}
                style={{ height: `${w.fill * 100}%` }}
              />
            )}
          </div>
        ))}
      </div>
      <div
        className="mt-1.5 grid gap-1 text-center font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
      >
        {weeks.map((w, i) => (
          <span key={i}>{w.label}</span>
        ))}
      </div>
    </div>
  );
}

// ── Akse-barometer (Section 1) ────────────────────────────────────
function AxisBarRow({ bar }: { bar: AxisBar }) {
  const deltaClass =
    bar.delta > 0
      ? "text-success"
      : bar.delta < 0
        ? bar.pct >= 60
          ? "text-warning"
          : "text-destructive"
        : "text-success";
  const deltaText =
    bar.delta > 0
      ? `+${bar.delta} over plan`
      : bar.delta < 0
        ? `${bar.delta} mot plan`
        : "på sporet";
  const fillW = Math.min(100, bar.pct);
  return (
    <div className="grid grid-cols-[86px_1fr_104px] items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-[3px]", axisSwatch[bar.axis])} aria-hidden />
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground">
          {bar.label}
        </span>
      </div>
      <div className="relative h-6 overflow-hidden rounded-md bg-secondary">
        {/* planlagt-skygge (mål 100%) */}
        <div
          className="absolute inset-y-0 left-0 bg-border"
          style={{ width: "100%" }}
        />
        {/* mål-strek 100% */}
        <div className="absolute -top-0.5 bottom-[-2px] right-0 w-0.5 bg-foreground" aria-hidden />
        {/* faktisk */}
        <div
          className={cn("absolute inset-y-0 left-0 rounded-l-md", bandFill[bar.band])}
          style={{ width: `${fillW}%` }}
        >
          {bar.pct > 0 && (
            <span
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] font-extrabold tabular-nums",
                bar.band === "ok" ? "text-accent" : "text-background",
              )}
            >
              {bar.pct}%
            </span>
          )}
        </div>
      </div>
      <div className="text-right font-mono text-[11px] font-bold tabular-nums text-muted-foreground">
        <b className="font-extrabold text-foreground">{bar.done}</b> / {bar.planned} økter
        <span className={cn("mt-0.5 block", deltaClass)}>{deltaText}</span>
      </div>
    </div>
  );
}

function PanelLegend() {
  const items: { sw: string; label: string }[] = [
    { sw: "bg-border", label: "planlagt" },
    { sw: "bg-primary", label: "på sporet" },
    { sw: "bg-warning", label: "under" },
    { sw: "bg-destructive", label: "bak plan" },
    { sw: "bg-success", label: "over plan" },
  ];
  return (
    <div className="mt-4 flex flex-wrap gap-x-4.5 gap-y-2 rounded-lg bg-background px-3 py-2.5 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-[2px]", it.sw)} aria-hidden />
          {it.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-0.5 bg-foreground" aria-hidden />
        mål 100 %
      </span>
    </div>
  );
}

// ── SECTION 1 — Spillerpanel-modul ────────────────────────────────
function PlayerPanelSection({ data }: { data: ComplianceData }) {
  const panel = data.panel;
  const onTrack = panel ? panel.band === "ok" || panel.band === "over" : false;
  return (
    <>
      <SectionHead
        index={1}
        title="Spillerpanel-modul"
        sub={`én spiller · ${data.periodLabel.toLowerCase()}`}
        count={panel ? `${panel.totalPlanned} ØKTER` : "INGEN DATA"}
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-4">
          <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-foreground">
            Plan-fullføring
          </h2>
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            {data.periodLabel} · {(panel?.playerName ?? "—").toUpperCase()}
          </span>
          <div className="ml-auto">
            <PlayerSelect players={data.players} selectedId={data.selectedPlayerId} />
          </div>
        </div>

        {!panel || panel.totalPlanned === 0 ? (
          <EmptyPanelNote>
            {data.players.length === 0
              ? "Ingen spillere registrert ennå."
              : "Ingen planlagte økter i perioden for denne spilleren."}
          </EmptyPanelNote>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
              {/* venstre — donut + uke-strip */}
              <div className="border-b border-border px-6 py-5 lg:border-b-0 lg:border-r">
                <div className="mb-4 flex flex-col items-center gap-1.5">
                  <Donut
                    pct={panel.pct}
                    band={panel.band}
                    done={panel.totalDone}
                    planned={panel.totalPlanned}
                  />
                </div>
                <div className="text-center">
                  <div className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
                    {onTrack ? "På sporet" : "Under nivå"} — {panel.totalDone} av {panel.totalPlanned}
                  </div>
                  <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                    Mål <b className="text-foreground">100 %</b> ·{" "}
                    <b className="text-foreground">
                      {Math.max(0, panel.totalPlanned - panel.totalDone)} økter
                    </b>{" "}
                    igjen
                  </div>
                </div>
                <WeekStrip weeks={panel.weeks} />
              </div>

              {/* høyre — akse-barometer */}
              <div className="px-6 py-5">
                <div className="flex flex-col gap-3">
                  {panel.axes.map((bar) => (
                    <AxisBarRow key={bar.axis} bar={bar} />
                  ))}
                </div>
                <PanelLegend />
                {panel.diagnosis && (
                  <div className="mt-4 grid grid-cols-[24px_1fr] items-start gap-3 rounded-xl bg-primary px-4 py-3.5 text-primary-foreground">
                    <Lightbulb
                      className="mt-0.5 h-[18px] w-[18px] text-accent"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <div>
                      <div className="mb-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-accent">
                        COACH-LESBAR DIAGNOSE
                      </div>
                      <div className="text-[13px] leading-relaxed">{panel.diagnosis}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <FootRule>
              <b className="font-bold text-foreground">Prinsipp.</b> Compliance er ikke vurdering — det er
              observasjon. <b className="font-bold text-foreground">Bak plan</b> er ofte et signal om at planen
              er feil, ikke at spilleren er lat.
            </FootRule>
          </>
        )}
      </div>
    </>
  );
}

// ── Stall-rad: ring-mini ──────────────────────────────────────────
function RingMini({ pct, band }: { pct: number; band: ComplianceBand }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(1, pct / 100) * circ;
  return (
    <div className="relative h-9 w-9">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="5" className="stroke-secondary" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className={bandStroke[band]}
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-extrabold tabular-nums tracking-[-0.02em] text-foreground">
        {pct}%
      </span>
    </div>
  );
}

function StallSparkline({ values, band }: { values: number[]; band: ComplianceBand }) {
  const color =
    band === "bad"
      ? "hsl(var(--destructive))"
      : band === "warn"
        ? "hsl(var(--warning))"
        : "hsl(var(--primary))";
  if (values.length === 0 || values.every((v) => v === 0)) {
    return <span className="font-mono text-[10px] text-muted-foreground">—</span>;
  }
  return (
    <Sparkline
      values={values.map((v) => v * 100)}
      width={64}
      height={22}
      color={color}
      className="h-[22px] w-16"
    />
  );
}

// ── SECTION 2 — Stall-tabell ──────────────────────────────────────
function lastLogTone(tone: StallRow["lastLogBand"]): string {
  return tone === "bad" ? "text-destructive" : tone === "warn" ? "text-warning" : "text-foreground";
}

function StallPill({ label, count, active }: { label: string; count: number; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 font-mono text-[10px] font-bold tracking-[0.04em]",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[9px] font-extrabold",
          active ? "bg-accent/30 text-primary-foreground" : "bg-primary/10 text-primary",
        )}
      >
        {count}
      </span>
    </span>
  );
}

function StallTableRow({ row, alt }: { row: StallRow; alt: boolean }) {
  const td = "border-b border-border px-3 py-2.5 align-middle text-[13px] tracking-[-0.005em] text-foreground";
  const noPlan = row.planned === 0;
  return (
    <tr className="hover:bg-primary/[0.025]">
      <td className={td}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold",
              alt ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground",
            )}
          >
            {row.initials}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <b className="truncate text-[13px] font-bold text-foreground">{row.playerName}</b>
            <small className="mt-px truncate font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
              {(row.homeClub ?? "—").toUpperCase()}
            </small>
          </span>
        </div>
      </td>
      <td className={td}>
        <span className="font-mono text-[11px] font-extrabold tabular-nums text-foreground">
          {row.hcp != null ? `HCP ${row.hcp.toLocaleString("nb-NO")}` : "—"}
        </span>
      </td>
      <td className={td}>
        <span className="font-mono text-[11px] font-extrabold tabular-nums text-foreground">
          {noPlan ? "—" : `${row.done}/${row.planned}`}
        </span>
      </td>
      <td className={td}>
        {noPlan ? (
          <span className="font-mono text-[10px] text-muted-foreground">Ingen plan i perioden</span>
        ) : (
          <div className="grid grid-cols-[44px_1fr_70px] items-center gap-2.5">
            <RingMini pct={row.pct} band={row.band} />
            <div className="relative h-2 rounded bg-border" style={{ overflow: "visible" }}>
              <div
                className={cn("absolute inset-y-0 left-0 overflow-hidden rounded", bandFill[row.band])}
                style={{ width: `${Math.min(100, row.pct)}%` }}
              />
              {/* mål-strek 100% */}
              <div
                className="absolute -top-0.5 bottom-[-2px] right-0 w-0.5 bg-foreground"
                aria-hidden
              />
            </div>
            <span
              className={cn(
                "rounded px-1.5 py-1 text-center font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                bandTagClass[row.band],
              )}
            >
              {bandTagLabel[row.band]}
            </span>
          </div>
        )}
      </td>
      <td className={td}>
        <span className={cn("font-mono text-[11px] font-bold tabular-nums", lastLogTone(row.lastLogBand))}>
          {row.lastLog}
        </span>
      </td>
      <td className={td}>
        <StallSparkline values={row.spark} band={row.band} />
      </td>
      <td className={cn(td, "text-right")}>
        <div className="inline-flex gap-1">
          <Link
            href={`/admin/spillere/${row.playerId}`}
            aria-label={`Profil for ${row.playerName}`}
            className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronRight className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function StallSection({ data }: { data: ComplianceData }) {
  const behind = data.stall.filter((s) => s.planned > 0 && s.pct < 75).length;
  const onTrack = data.stall.filter((s) => s.planned > 0 && s.pct >= 75 && s.pct < 100).length;
  const over = data.stall.filter((s) => s.planned > 0 && s.pct >= 100).length;

  return (
    <>
      <SectionHead
        index={2}
        title="Stallen · compliance-kolonne"
        sub='hele spillerlisten · sortert på "bak plan"'
        count={`${data.stall.length} SPILLERE`}
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <PanelTitle
          title="Min stall · plan vs reps"
          eyebrow={data.periodLabel}
          metaLead="SNITT KOHORT"
          metaValue={data.cohortAvg != null ? `${data.cohortAvg} %` : "—"}
        />

        <div className="flex flex-wrap items-center gap-2.5 border-y border-border bg-background px-5 py-3">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            SORTERT
          </span>
          <StallPill label="Bak plan" count={behind} active />
          <StallPill label="På sporet" count={onTrack} />
          <StallPill label="Over plan" count={over} />
          <span className="ml-auto font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            <b className="font-extrabold text-foreground">{data.staleCount}</b> spillere over{" "}
            <b className="font-extrabold text-foreground">14 d</b> uten økt-logg
            {data.cohortMedian != null && (
              <>
                {" "}
                · median <b className="font-extrabold text-foreground">{data.cohortMedian} %</b>
              </>
            )}
          </span>
        </div>

        {data.stall.length === 0 ? (
          <EmptyPanelNote>Ingen spillere å vise.</EmptyPanelNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] table-fixed border-collapse">
              <thead>
                <tr>
                  {[
                    ["Spiller", "w-[220px]"],
                    ["Nivå", "w-[88px]"],
                    ["Plan", "w-[80px]"],
                    [`Compliance · ${data.windowDays} d`, "w-auto"],
                    ["Sist logget", "w-[96px]"],
                    ["Trend", "w-[72px]"],
                    ["", "w-[56px]"],
                  ].map(([label, w], i) => (
                    <th
                      key={i}
                      className={cn(
                        "border-b border-border bg-background px-3 py-2.5 text-left align-middle font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground",
                        w,
                      )}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.stall.map((row, idx) => (
                  <StallTableRow key={row.playerId} row={row} alt={idx % 2 === 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <FootRule>
          <b className="font-bold text-foreground">Prinsipp.</b> Coach scanner én kolonne — fargete tag og sparkline
          forteller på 200 ms. Sorter <b className="font-bold text-foreground">bak plan først</b> for å løfte
          risikoen til topp. Over-planere merkes{" "}
          <b className="font-bold text-foreground">UTFORDRE</b> — planen er for lett.
        </FootRule>
      </div>
    </>
  );
}

// ── SECTION 3 — Drill-fullføring ──────────────────────────────────
function DrillStatusPill({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full",
        done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
      )}
    >
      {done ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      ) : (
        <Dot className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      )}
    </span>
  );
}

function DrillRowItem({ drill }: { drill: DrillRow }) {
  return (
    <div className="grid grid-cols-[32px_1fr_180px] items-center gap-3 border-b border-border px-5 py-3 last:border-b-0 sm:grid-cols-[32px_1fr_180px_96px]">
      <DrillStatusPill done={drill.done} />
      <div className="min-w-0">
        <b className="block truncate text-sm font-bold tracking-[-0.005em] text-foreground">{drill.name}</b>
        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.02em] text-muted-foreground">
          {drill.axis && (
            <span className="inline-flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-[2px]", axisSwatch[drill.axis])} aria-hidden />
              {drill.axisLabel?.toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          PLANLAGT
        </span>
        <span className="font-mono text-xs font-bold tabular-nums tracking-[0.02em] text-foreground">
          {drill.planned}
        </span>
      </div>
      <div className="hidden sm:block">
        <span
          className={cn(
            "block rounded px-2 py-1 text-center font-mono text-[10px] font-extrabold uppercase tracking-[0.02em]",
            drill.done ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
          )}
        >
          {drill.done ? "Gjennomført" : "Åpen"}
        </span>
      </div>
    </div>
  );
}

function MiniKpi({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="flex min-w-[100px] flex-col gap-0.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[18px] font-extrabold leading-none tracking-[-0.02em] tabular-nums",
          tone === "warn" ? "text-warning" : tone === "ok" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DrillSection({ data }: { data: ComplianceData }) {
  const ds = data.drillSession;
  return (
    <>
      <SectionHead
        index={3}
        title="Drill-fullføring i økt-detalj"
        sub="faktiske reps vs planlagt · per drill"
        count={ds ? `ØKT · ${ds.dateLabel.toUpperCase()}` : "INGEN LOGG"}
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {!ds ? (
          <EmptyPanelNote>Ingen loggede økter med drills for valgt spiller ennå.</EmptyPanelNote>
        ) : (
          <>
            <div className="grid grid-cols-1 items-center gap-4 border-b border-border bg-background px-5 py-4 sm:grid-cols-[1fr_auto_auto_auto]">
              <div className="font-display text-[18px] font-bold tracking-[-0.02em] text-foreground">
                {ds.title}
                <small className="mt-0.5 block font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                  {ds.playerName.toUpperCase()} · {ds.dateLabel.toUpperCase()} · {ds.durationMin} MIN
                </small>
              </div>
              <MiniKpi label="PLANLAGT" value={`${ds.plannedCount} drills`} />
              <MiniKpi
                label="LOGGET"
                value={`${ds.doneCount} av ${ds.plannedCount}`}
                tone={ds.doneCount === ds.plannedCount ? "ok" : "warn"}
              />
              <MiniKpi label="VARIGHET" value={`${ds.durationMin} min`} />
            </div>

            <div className="py-1">
              {ds.drills.map((d) => (
                <DrillRowItem key={d.id} drill={d} />
              ))}
            </div>

            <div className="grid grid-cols-[22px_1fr_auto] items-center gap-3 border-t border-border bg-accent/15 px-5 py-3.5">
              <MessageCircle className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} aria-hidden />
              <div className="font-display text-sm font-bold tracking-[-0.005em] text-foreground">
                Coachens åpningsspørsmål på neste økt
                <small className="mt-0.5 block font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                  Bygges fra droppede drills når per-drill-logg er på plass.
                </small>
              </div>
              <Link
                href="/admin/innboks"
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Send som notat
                <ArrowRight className="h-3 w-3 text-accent" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </>
        )}
        <FootRule>
          <b className="font-bold text-foreground">Prinsipp.</b> Droppede drills er ikke nødvendigvis problemer
          — men de blir åpningsspørsmålet til neste økt. Per-drill-reps logges når live-økt-modulen utvides.
        </FootRule>
      </div>
    </>
  );
}

// ── Hovedkomponent ────────────────────────────────────────────────
export function Compliance({ data }: { data: ComplianceData }) {
  return (
    <div className="space-y-1">
      {/* header */}
      <div className="mb-2">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          B6 · COMPLIANCE-SPORING
        </span>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-[30px]">
          Plan møter <em className="font-normal italic text-primary">virkelighet</em>. Hver akse, hver økt, hver
          drill.
        </h1>
        <p className="mt-1.5 max-w-[780px] text-sm leading-relaxed text-muted-foreground">
          Hvor mye av planen ble faktisk gjennomført? Tre nivåer i samme språk — spillerens panel, hele stallen,
          og den enkelte økten.
        </p>
      </div>

      <PlayerPanelSection data={data} />
      <StallSection data={data} />
      <DrillSection data={data} />

      {/* prinsipp-footer */}
      <div className="mt-7 space-y-2 rounded-xl bg-secondary px-5 py-4.5 font-mono text-xs leading-relaxed text-muted-foreground">
        <p>
          <b className="font-bold text-foreground">Tre nivåer, samme språk.</b> Spillerens panel viser egen
          plan-fullføring. Stallen viser hvem som henger etter. Økt-detalj viser hvilken drill som ble droppet.
        </p>
        <p>
          <b className="font-bold text-foreground">Compliance måler etterlevelse, ikke verdi.</b> Over-planere er
          ikke flinkest — planen var kanskje for lett. Bak-plan-spillere får diagnose, ikke pisk.
        </p>
        <p className="flex items-center gap-2">
          <Minus className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
          <span>
            <b className="font-bold text-foreground">Over 14 d uten kontakt</b> løftes som passivt varsel — aldri
            en sak i innboksen.
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Plus className="h-3 w-3 shrink-0 text-success" strokeWidth={2} aria-hidden />
          <span>
            <b className="font-bold text-foreground">Bonus-drills loggføres som «+».</b> Det spilleren la til selv
            er signal om hva hen følte behov for.
          </span>
        </p>
        <p className="flex items-center gap-2">
          <X className="h-3 w-3 shrink-0 text-destructive" strokeWidth={2} aria-hidden />
          <span>
            <b className="font-bold text-foreground">Droppet drill</b> blir åpningsspørsmål, ikke en anmerkning.
          </span>
        </p>
      </div>
    </div>
  );
}
