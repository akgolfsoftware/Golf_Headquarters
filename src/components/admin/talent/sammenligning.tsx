/**
 * AgencyOS — Sammenlign flere spillere (B10 sammenlignings-flate).
 *
 * Pixel-port FRA design-fasit:
 *   - Visuell fasit: public/design-handover/_screens/ag-compare.png (desktop ~1280px)
 *   - HTML/CSS-referanse: public/design-handover/agencyos/components-multi-compare.html
 *
 * Fasiten viser den ekte tom-tilstanden: 3 valgte spillere uten registrert SG.
 * Tre nivåer:
 *   1) Side om side — METRIKK-akse | N spiller-kolonner | PGA Tour-baseline.
 *   2) Pyramide-fordeling — tom-tilstand (ingen treningsplaner).
 *   3) Kohort-rangering — hele stallen sortert på SG total, senterlinje = baseline,
 *      lime-merkede rader = med i side-om-side over.
 *   4) Region-fordeling — geografisk fordeling som horisontale søyler.
 *
 * Presentasjonell + props-drevet (CompareData). Ingen Prisma/DB/auth her.
 * Token-only farger (ingen hardkodet hex), kun lucide-ikoner, norsk bokmål.
 *
 * Responsivt:
 *   Desktop (≥1024px): side-om-side-grid + full kohort-skala — primær-fasit.
 *   Mobil (≤640px): kolonnene stables, kohort-skala forenkles.
 */

import Link from "next/link";
import {
  ChevronDown,
  MapPin,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Typer ───────────────────────────────────────────────────────
type AxisTone = "sg" | "slag" | "tek" | "spill" | "turn";

/** Én valgt spiller i side-om-side-sammenligningen. */
export type ComparePlayer = {
  id: string;
  initials: string;
  name: string;
  /** Mono under-linje under navnet: «nivå · klubb» (f.eks. "U18 · GFGK" eller "— · —"). */
  meta: string;
  /** HCP-chip-pill under meta-linjen, f.eks. "HCP —". */
  sub: string;
  /** Avatar-tone: forest (default) eller sand. */
  avatarTone?: "pri" | "alt";
  href?: string;
};

/** Én metrikk-rad i side-om-side (tom-tilstand i fasiten). */
export type CompareMetricRow = {
  id: string;
  axisTone: AxisTone;
  name: string;
  sub: string;
  /** Referanse-kolonnen helt til høyre. */
  refLabel: string;
  refValue: string;
};

/** Én rad i kohort-rangeringen. */
export type CohortRow = {
  id: string;
  rank: number;
  initials: string;
  name: string;
  sub: string;
  avatarTone?: "pri" | "alt";
  /** True = med i side-om-side over (lime-ring + lime rad-tint). */
  tagged?: boolean;
  href?: string;
};

/** Én region-søyle i geografi-panelet. */
export type RegionBar = {
  id: string;
  name: string;
  count: number;
  pct: number;
};

export type CompareData = {
  eyebrow: string;
  title: { lead: string; rest: string };
  helper: string;
  backHref: string;

  /** Panel 1 — side om side. */
  sideBySide: {
    heading: { lead: string; rest: string };
    sub: string;
    editHref: string;
    players: ComparePlayer[];
    refTop: { label: string; value: string; valueSub: string };
    metrics: CompareMetricRow[];
    frule: string;
  };

  /** Panel 2 — pyramide-fordeling (tom-tilstand). */
  pyramid: {
    heading: { lead: string; rest: string };
    sub: string;
    emptyText: string;
  };

  /** Panel 3 — kohort-rangering. */
  cohort: {
    count: number;
    heading: { lead: string; rest: string };
    sub: string;
    rows: CohortRow[];
    frule: string;
  };

  /** Panel 4 — region-fordeling. */
  region: {
    count: number;
    heading: { lead: string; rest: string };
    sub: string;
    bars: RegionBar[];
    frule: string;
  };
};

// ── Token-kart for akse-swatch ──────────────────────────────────
const AXIS_SWATCH: Record<AxisTone, string> = {
  sg: "bg-foreground",
  slag: "bg-[var(--pyr-slag)]",
  tek: "bg-[var(--pyr-tek)]",
  spill: "bg-accent",
  turn: "bg-[var(--pyr-turn)]",
};

// ── Delte små byggeklosser ──────────────────────────────────────
function SectionDivider({
  num,
  label,
  sub,
  count,
}: {
  num: string;
  label: string;
  sub: string;
  count: string;
}) {
  return (
    <div className="mt-8 mb-3.5 flex items-center gap-3">
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground">
        {num} · {label}
      </span>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
        {sub}
      </span>
      <span className="h-px flex-1 bg-border" />
      <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

/** Card-tittel i display-font med italic-grønn ledd + bold-mørk ledd. */
function PanelTitle({
  lead,
  rest,
  size = "lg",
}: {
  lead: string;
  rest: string;
  size?: "lg" | "xl";
}) {
  return (
    <div
      className={cn(
        "font-display font-bold tracking-[-0.02em] text-foreground",
        size === "xl" ? "text-2xl" : "text-[22px]",
      )}
    >
      <span className="italic font-normal text-primary">{lead}</span>
      {rest}
    </div>
  );
}

function Frule({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border bg-secondary/40 px-5 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}

function Avatar({
  initials,
  tone = "pri",
  size = 36,
  tagged = false,
}: {
  initials: string;
  tone?: "pri" | "alt";
  size?: number;
  tagged?: boolean;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        size <= 26 ? "text-[11px]" : "text-sm",
        tone === "alt"
          ? "bg-secondary text-foreground"
          : "bg-primary text-accent",
        tagged && "ring-2 ring-accent",
      )}
    >
      {initials}
    </span>
  );
}

// ── Panel 1 — Side om side ──────────────────────────────────────
function SideBySidePanel({ data }: { data: CompareData["sideBySide"] }) {
  const n = data.players.length;
  // Desktop-grid: METRIKK (220px) | N kolonner (1fr) | REFERANSE (96px).
  const gridCols = `220px repeat(${n}, minmax(0, 1fr)) 96px`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Panel-header */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PanelTitle lead={data.heading.lead} rest={data.heading.rest} />
          <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {data.sub}
          </p>
        </div>
        <Link
          href={data.editHref}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-secondary"
        >
          <UserPlus className="h-3 w-3" strokeWidth={2} aria-hidden />
          Endre utvalg
        </Link>
      </div>

      {/* Desktop-tabell (grid) ----------------------------------- */}
      <div className="hidden lg:block">
        {/* Spiller-kolonner */}
        <div
          className="grid border-b border-border bg-secondary/40"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="flex items-end border-r border-border px-4 py-4 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            METRIKK
          </div>
          {data.players.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2 border-r border-border bg-card px-3.5 py-4"
            >
              <div className="flex items-center gap-2.5">
                <Avatar initials={p.initials} tone={p.avatarTone} size={36} />
                <div className="min-w-0 flex-1 leading-tight">
                  <Link
                    href={p.href ?? "#"}
                    className="block truncate font-display text-[15px] font-bold tracking-[-0.02em] text-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <span className="block truncate font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                    {p.meta}
                  </span>
                </div>
                <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
                  <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground">
                  {p.sub}
                </span>
              </div>
            </div>
          ))}
          <div className="flex flex-col items-start gap-1 bg-secondary/40 px-3.5 py-4">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              {data.refTop.label}
            </span>
            <span className="font-display text-[15px] font-bold tracking-[-0.02em] leading-tight text-foreground">
              {data.refTop.value}
              <span className="mt-0.5 block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                {data.refTop.valueSub}
              </span>
            </span>
          </div>
        </div>

        {/* Metrikk-rader (tom-tilstand) */}
        {data.metrics.map((m, idx) => (
          <div
            key={m.id}
            className={cn(
              "grid",
              idx < data.metrics.length - 1 && "border-b border-border",
            )}
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="flex flex-col justify-center gap-1 border-r border-border bg-secondary/40 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className={cn("h-4 w-1 shrink-0 rounded-sm", AXIS_SWATCH[m.axisTone])} />
                <span className="font-display text-sm font-bold tracking-[-0.015em] leading-tight text-foreground">
                  {m.name}
                </span>
              </div>
              <span className="ml-3 font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                {m.sub}
              </span>
            </div>
            {data.players.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-center gap-1.5 border-r border-border px-3.5 py-3.5"
              >
                <span className="font-mono text-[22px] font-extrabold leading-none tracking-[-0.02em] text-muted-foreground/50">
                  —
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                  ingen data
                </span>
              </div>
            ))}
            <div className="flex flex-col justify-center gap-1 bg-secondary/40 px-3.5 py-3.5">
              <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                {m.refLabel}
              </span>
              <span className="font-mono text-base font-extrabold leading-none tracking-[-0.015em] text-foreground">
                {m.refValue}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobil-stabling (kort per spiller) ----------------------- */}
      <div className="lg:hidden">
        <div className="divide-y divide-border">
          {data.players.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar initials={p.initials} tone={p.avatarTone} size={36} />
              <div className="min-w-0 flex-1 leading-tight">
                <Link
                  href={p.href ?? "#"}
                  className="block truncate font-display text-[15px] font-bold tracking-[-0.02em] text-foreground"
                >
                  {p.name}
                </Link>
                <span className="block truncate font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                  {p.meta}
                </span>
                <span className="mt-1 inline-block rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground">
                  {p.sub}
                </span>
              </div>
              <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
                <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </span>
            </div>
          ))}
        </div>
        <div className="divide-y divide-border border-t border-border">
          {data.metrics.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <span className={cn("h-8 w-1 shrink-0 rounded-sm", AXIS_SWATCH[m.axisTone])} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-bold tracking-[-0.015em] text-foreground">
                  {m.name}
                </div>
                <span className="font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                  {m.sub}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-extrabold leading-none text-muted-foreground/50">
                  —
                </span>
                <span className="mt-0.5 block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                  ingen data
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Frule>
        <b className="font-bold text-foreground">Prinsipp.</b> {data.frule}
      </Frule>
    </div>
  );
}

// ── Panel 2 — Pyramide-fordeling (tom-tilstand) ─────────────────
function PyramidPanel({ data }: { data: CompareData["pyramid"] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <PanelTitle lead={data.heading.lead} rest={data.heading.rest} />
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {data.sub}
        </p>
      </div>
      <div className="px-6 py-10 text-center font-mono text-[13px] text-muted-foreground">
        {data.emptyText}
      </div>
    </div>
  );
}

// ── Panel 3 — Kohort-rangering ──────────────────────────────────
const TICKS = ["−2,0", "−1,0", "0", "+1,0", "+2,0"];

function CohortPanel({ data }: { data: CompareData["cohort"] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-border px-6 py-4">
        <div>
          <PanelTitle lead={data.heading.lead} rest={data.heading.rest} />
          <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {data.sub}
          </p>
        </div>
        <div className="hidden items-stretch gap-0 sm:flex">
          <div className="flex flex-col items-center gap-1.5 px-4">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Beste
            </span>
            <span className="h-[3px] w-6 rounded-full bg-success" />
          </div>
          <div className="flex flex-col items-center gap-1.5 border-l border-border px-4">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Svakeste
            </span>
            <span className="h-[3px] w-6 rounded-full bg-destructive" />
          </div>
        </div>
      </div>

      {/* Skala-legend + ticks (desktop) */}
      <div className="hidden px-6 pt-3.5 lg:block">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0 w-3.5 border-t-[1.5px] border-dashed border-foreground" />
            TOUR-BASELINE <b className="font-extrabold text-foreground">0,0</b> · senterlinje
          </span>
          <span className="inline-flex items-center gap-3.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              over
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              under
            </span>
          </span>
        </div>
        <div className="grid items-end" style={{ gridTemplateColumns: "200px 1fr 100px" }}>
          <div />
          <div className="flex justify-between font-mono text-[9px] font-extrabold tracking-[0.04em] text-muted-foreground tabular-nums">
            {TICKS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div />
        </div>
      </div>

      {/* Rader */}
      <div className="divide-y divide-border border-t border-border lg:border-t-0">
        {data.rows.map((r) => (
          <CohortRowItem key={r.id} row={r} />
        ))}
      </div>

      <Frule>
        <b className="font-bold text-foreground">Prinsipp.</b> {data.frule}
      </Frule>
    </div>
  );
}

function CohortRowItem({ row }: { row: CohortRow }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-center gap-3 px-6 py-3 lg:grid-cols-[200px_1fr_100px] lg:gap-0",
        row.tagged && "border-l-[3px] border-accent bg-accent/10 pl-[21px] lg:pl-[21px]",
      )}
    >
      {/* Spiller */}
      <div className="flex items-center gap-2.5 pr-3.5">
        <span
          className={cn(
            "w-[18px] text-center font-mono text-[11px] font-extrabold tracking-[0.04em] tabular-nums",
            row.rank === 1 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {row.rank}
        </span>
        <Avatar
          initials={row.initials}
          tone={row.avatarTone}
          size={26}
          tagged={row.tagged}
        />
        <div className="min-w-0 leading-tight">
          <Link
            href={row.href ?? "#"}
            className="block truncate text-[13px] font-bold text-foreground hover:text-primary"
          >
            {row.name}
          </Link>
          <span className="font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
            {row.sub}
          </span>
        </div>
      </div>

      {/* Tom track med senterlinje (desktop) */}
      <div className="relative hidden h-[30px] overflow-hidden rounded-lg bg-secondary/40 lg:block">
        <span className="absolute bottom-0 left-1/2 top-0 z-[3] w-px bg-foreground" />
      </div>

      {/* Høyre-meta */}
      <div className="pl-3.5 text-right">
        <span className="block font-mono text-[13px] font-extrabold leading-none text-foreground tabular-nums">
          —
        </span>
        <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Ingen SG
        </span>
      </div>
    </div>
  );
}

// ── Panel 4 — Region-fordeling ──────────────────────────────────
function RegionPanel({ data }: { data: CompareData["region"] }) {
  const max = Math.max(...data.bars.map((b) => b.pct), 1);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <PanelTitle lead={data.heading.lead} rest={data.heading.rest} />
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {data.sub}
        </p>
      </div>

      <div className="flex flex-col gap-3 px-6 py-6">
        {data.bars.map((b) => (
          <div
            key={b.id}
            className="grid grid-cols-[180px_1fr_auto] items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 max-sm:grid-cols-[1fr_auto] max-sm:gap-2"
          >
            <div className="flex items-center gap-2 max-sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              <span className="truncate text-[15px] font-bold text-foreground">{b.name}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-secondary/60 max-sm:order-3 max-sm:col-span-2">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${(b.pct / max) * 100}%` }}
              />
            </div>
            <div className="shrink-0 text-right font-mono tabular-nums max-sm:order-2">
              <span className="text-[15px] font-extrabold text-foreground">{b.count}</span>
              <span className="ml-1.5 text-[11px] font-bold text-muted-foreground">
                · {b.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <Frule>
        <b className="font-bold text-foreground">Prinsipp.</b> {data.frule}
      </Frule>
    </div>
  );
}

// ── Hoved-komponent ─────────────────────────────────────────────
export function TalentSammenligning({ data }: { data: CompareData }) {
  return (
    <div className="mx-auto w-full max-w-[1240px]">
      {/* Side-header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            {data.eyebrow}
          </span>
          <h1 className="mt-2 mb-1.5 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
            <span className="italic font-normal text-primary">{data.title.lead}</span>
            {data.title.rest}
          </h1>
          <p className="max-w-[800px] text-sm leading-relaxed text-muted-foreground">
            {data.helper}
          </p>
        </div>
        <Link
          href={data.backHref}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-card px-4 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <ChevronDown className="h-4 w-4 rotate-90" strokeWidth={2} aria-hidden />
          Tilbake
        </Link>
      </header>

      {/* 1 · Side om side */}
      <SectionDivider
        num="1"
        label="Side om side"
        sub="Samme parametre · best-badge per metrikk"
        count={`${data.sideBySide.players.length} spillere`}
      />
      <SideBySidePanel data={data.sideBySide} />

      {/* 2 — Pyramide-fordeling (tom) */}
      <PyramidPanel data={data.pyramid} />

      {/* 2 · Kohort-rangering */}
      <SectionDivider
        num="2"
        label="Kohort-rangering"
        sub="Én metrikk · hele stallen · sortert"
        count={`${data.cohort.count} spillere`}
      />
      <CohortPanel data={data.cohort} />

      {/* 3 · Region-fordeling */}
      <SectionDivider
        num="3"
        label="Region-fordeling"
        sub="Geografisk fordeling av stallen"
        count={`${data.region.count} regioner`}
      />
      <RegionPanel data={data.region} />
    </div>
  );
}

// Re-eksport for ergonomi (matcher mønster i andre admin-komponenter).
export type { LucideIcon };
