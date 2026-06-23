/**
 * AgencyOS · Tester på tvers — spillere × tester ytelse-matrise (presentasjonell).
 *
 * Port fra v10-fasiten:
 *   - public/design-handover/_screens/ag-tester.png (pixel-fasit, ekte data)
 *   - public/design-handover/agencyos/components-agency-tests.html (komponent-spec)
 *
 * Matrise med spillere som rader og tester som kolonner. Hver celle viser siste
 * måling (verdi + relativ dato) eller "ikke testet" (skrå-stripe). Fargekoding
 * er semantisk relativ til mål — men i fasit-tilstanden er ingen mål definert,
 * så celler er enten "målt" (nøytral tint) eller "ikke testet". Per-rad TILDEL-
 * knapp med rød badge for antall manglende tester.
 *
 * Props-drevet — ingen DB/auth. Demo-data injiseres fra preview-ruta.
 */

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  Info,
  LayoutTemplate,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NivaaBadge, type NivaaBadgeData } from "./nivaa-badge";

// ── Typer ──────────────────────────────────────────────────────────────────

/** Pyramide-akse → fargedot på test-kolonnen. */
export type TestAxis = "fys" | "tek" | "slag" | "spill" | "turn";

export type TestColumn = {
  id: string;
  axis: TestAxis;
  name: string;
  /** Enhet + retning, f.eks. "VERDI · HØYERE BEDRE". */
  unit: string;
  /** Mål-pille, f.eks. "MÅL ≥ 50". Utelates når mål ikke er definert. */
  target?: string;
};

/** Celle-tilstand i matrisen. */
export type CellState = "measured" | "untested" | "testing";

export type Cell = {
  state: CellState;
  /** Vist verdi (måling) eller statustekst. */
  value?: string;
  /** Delta vs forrige måling, f.eks. "+2" / "−0,03". */
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  /** Relativ tid / status-undertekst, f.eks. "42 D", "IKKE TESTET". */
  when?: string;
  /** Rød overdue-prikk øverst i cellen. */
  overdue?: boolean;
  /** Fargekoding relativt til mål (kun når mål er definert). */
  scoreTone?: "over" | "near" | "under";
  /** Nivå-badge mot DataGolf-fasit (kun for tester med benchmarks). */
  benchmark?: NivaaBadgeData;
};

export type PlayerRow = {
  id: string;
  initials: string;
  avatarTone?: "primary" | "lime" | "default";
  name: string;
  /** Gruppe-chip foran navnet. */
  group?: { label: string; tone: "wang" | "gfgk" | "aka" };
  /** Undertekst, f.eks. "6 AV 6 TESTER · HCP 4,2" eller "INGEN MÅLINGER". */
  sub: string;
  /** Én celle per test-kolonne (samme rekkefølge). */
  cells: Cell[];
  /** Antall manglende/overdue tester → badge på TILDEL. */
  missingCount?: number;
  /** Rad har en pågående test → vis "Komplett" i stedet for "Tildel". */
  testingNow?: boolean;
  /** Lenke til tildel-flyt for denne spilleren. */
  assignHref?: string;
};

export type GroupFilter = {
  label: string;
  count: number;
  active?: boolean;
  href?: string;
};

export type AvgRow = { name: string; value: string; unit?: string };

export type TrendRow = {
  label: string;
  count: string;
  tone: "up" | "flat" | "down";
};

export type TesterOversiktData = {
  /** Eyebrow over tittelen. */
  eyebrow: string;
  title: string;
  /** Meta-tall til høyre i tittelraden. */
  meta: { players: number; tests: number; measured: number; missing: number };
  /** Gruppe-filter-pills i toolbaren. */
  filters: GroupFilter[];
  /** Varseltekst i legend-raden (mål ikke definert). Utelates når mål finnes. */
  legendNote?: string;
  /** Vis full fargekode-legende (over/nær/under) i stedet for målt/ikke testet. */
  showColorLegend?: boolean;
  /** Vis nivå-badge-legende (DataGolf-fasiter). Har forrang over showColorLegend. */
  levelLegend?: boolean;
  /** Attribusjonstekst i footer, f.eks. "Data powered by DataGolf" (lisenskrav). */
  attribution?: string;
  columns: TestColumn[];
  rows: PlayerRow[];
  /** Footer-hint til høyre. */
  footerHint: string;
  /** Gruppe-snitt-kort (siste måling). */
  avg: AvgRow[];
  /** Trend-kort (vs forrige måling). */
  trends: TrendRow[];
  /** Note under trend-listen. */
  trendNote?: string;
  /** Lenker for toolbar-knapper. */
  exportHref?: string;
  templateHref?: string;
  newTestHref?: string;
}

// ── Hjelpere ─────────────────────────────────────────────────────────────

const axisDot: Record<TestAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const avatarTone: Record<NonNullable<PlayerRow["avatarTone"]>, string> = {
  primary: "bg-primary text-accent",
  lime: "bg-accent text-primary",
  default: "bg-secondary text-foreground",
};

const groupTone: Record<NonNullable<PlayerRow["group"]>["tone"], string> = {
  wang: "bg-muted-foreground/10 text-muted-foreground",
  gfgk: "bg-primary/10 text-primary",
  aka: "bg-warning/15 text-warning",
};

const deltaToneClass: Record<NonNullable<Cell["deltaTone"]>, string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

// ── Sub-komponenter ──────────────────────────────────────────────────────

function ScoreCell({ cell }: { cell: Cell }) {
  if (cell.state === "untested") {
    return (
      <div
        className={cn(
          "relative flex h-16 flex-col items-center justify-center gap-0.5",
          "bg-[repeating-linear-gradient(135deg,var(--color-secondary)_0_8px,var(--color-card)_8px_16px)]",
        )}
      >
        {cell.overdue && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive shadow-[0_0_4px_rgba(163,45,45,0.5)]"
          />
        )}
        <span className="font-mono text-[13px] font-bold text-muted-foreground tabular-nums">
          {cell.value ?? "—"}
        </span>
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {cell.when ?? "IKKE TESTET"}
        </span>
      </div>
    );
  }

  if (cell.state === "testing") {
    return (
      <div className="relative flex h-16 flex-col items-center justify-center gap-0.5 bg-accent/10 shadow-[inset_0_0_0_2px_var(--color-accent)]">
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_rgba(209,248,67,0.6)] motion-reduce:animate-none"
        />
        <span className="font-mono text-[15px] font-extrabold leading-none tracking-[-0.01em] text-primary tabular-nums">
          {cell.value ?? "PÅGÅR"}
        </span>
        <span className="mt-px font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-primary">
          {cell.when}
        </span>
      </div>
    );
  }

  // measured
  const tone = cell.scoreTone;
  const bg =
    tone === "over"
      ? "bg-primary/10"
      : tone === "near"
        ? "bg-warning/15"
        : tone === "under"
          ? "bg-destructive/[0.08]"
          : "bg-secondary/60";
  const valueColor =
    tone === "over"
      ? "text-success"
      : tone === "near"
        ? "text-warning"
        : tone === "under"
          ? "text-destructive"
          : "text-foreground";

  return (
    <div className={cn("relative flex h-16 flex-col items-center justify-center gap-0.5", bg)}>
      {cell.overdue && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive shadow-[0_0_4px_rgba(163,45,45,0.5)]"
        />
      )}
      <span className="flex items-center justify-center gap-1">
        <span
          className={cn(
            "font-mono text-[15px] font-extrabold leading-none tracking-[-0.01em] tabular-nums",
            valueColor,
          )}
        >
          {cell.value}
        </span>
        {cell.benchmark && <NivaaBadge badge={cell.benchmark} />}
      </span>
      {cell.delta && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-mono text-[9px] font-bold tracking-[0.04em] tabular-nums",
            cell.deltaTone ? deltaToneClass[cell.deltaTone] : "text-muted-foreground",
          )}
        >
          {cell.deltaTone === "up" && <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />}
          {cell.deltaTone === "down" && (
            <ArrowDown className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
          )}
          {cell.deltaTone === "flat" && <Minus className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />}
          {cell.delta}
        </span>
      )}
      {cell.when && (
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {cell.when}
        </span>
      )}
    </div>
  );
}

function AssignButton({ row }: { row: PlayerRow }) {
  if (row.testingNow) {
    return (
      <button
        type="button"
        className="inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Check className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
        Komplett
      </button>
    );
  }

  const isPrimary = (row.missingCount ?? 0) > 0;
  const inner = (
    <>
      <Plus className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
      Tildel
      {row.missingCount ? (
        <span className="ml-1 inline-flex h-[14px] items-center rounded-full bg-destructive px-1.5 font-mono text-[8px] font-extrabold text-white">
          {row.missingCount}
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isPrimary
      ? "bg-primary text-accent hover:opacity-90"
      : "border border-border bg-card text-foreground hover:bg-secondary",
  );

  if (row.assignHref) {
    return (
      <Link href={row.assignHref} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={classes}>
      {inner}
    </button>
  );
}

// ── Hovedkomponent ─────────────────────────────────────────────────────────

export function TesterOversikt({ data }: { data: TesterOversiktData }) {
  const totalCells = data.meta.players * data.meta.tests;

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      {/* Section eyebrow */}
      <div className="mb-3.5 flex items-center gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          AgencyOS · tester-stall · spillere × tester matrise
        </span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* TITLE */}
        <div className="px-5 pb-3 pt-[18px]">
          <span className="mb-1 block font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            {data.eyebrow}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">
            {data.title}
          </h2>
          <span className="ml-auto inline-flex flex-wrap items-center gap-x-3.5 gap-y-1 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            <span>
              <b className="text-foreground">{data.meta.players}</b> spillere
            </span>
            <span>·</span>
            <span>
              <b className="text-foreground">{data.meta.tests}</b> tester
            </span>
            <span>·</span>
            <span>
              <b className="text-foreground">{data.meta.measured}</b> målinger
            </span>
            <span>·</span>
            <span className="text-warning">
              <b>{data.meta.missing}</b> mangler
            </span>
          </span>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 border-y border-border bg-secondary/40 px-5 py-2.5">
          {data.filters.map((f) => {
            const inner = (
              <>
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold",
                    f.active ? "bg-accent/30 text-accent" : "bg-primary/[0.08] text-muted-foreground",
                  )}
                >
                  {f.count}
                </span>
              </>
            );
            const cls = cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              f.active
                ? "border border-primary bg-primary text-accent"
                : "border border-border bg-card text-foreground hover:bg-secondary",
            );
            return f.href ? (
              <Link key={f.label} href={f.href} aria-current={f.active ? "true" : undefined} className={cls}>
                {inner}
              </Link>
            ) : (
              <button key={f.label} type="button" className={cls}>
                {inner}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1.5">
            <ToolbarButton href={data.exportHref} icon={Download} label="Eksport CSV" />
            <ToolbarButton href={data.templateHref} icon={LayoutTemplate} label="Test-mal" />
            <ToolbarButton href={data.newTestHref} icon={Plus} label="Ny test" primary />
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-b border-border bg-secondary/40 px-5 py-2 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          <span className="font-extrabold uppercase tracking-[0.12em] text-foreground">Legende</span>
          {data.levelLegend ? (
            <>
              <LegendSwatch className="border-border bg-secondary" label="Målt" />
              <LegendSwatch striped className="border-border" label="Ikke testet" />
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-[14px] items-center rounded-[3px] bg-primary/10 px-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.06em] text-primary">
                  PGA
                </span>
                Nivå-badge = beste oppnådde tour-nivå
              </span>
              <span className="ml-auto">
                HOLD OVER BADGE FOR <b className="font-extrabold text-foreground">HELE NIVÅSTIGEN</b>
              </span>
            </>
          ) : data.showColorLegend ? (
            <>
              <LegendSwatch className="border-primary/40 bg-primary/[0.14]" label="Over mål" />
              <LegendSwatch className="border-warning/40 bg-warning/[0.16]" label="Nær (±5 %)" />
              <LegendSwatch className="border-destructive/40 bg-destructive/10" label="Under mål" />
              <LegendSwatch
                striped
                className="border-border"
                label="Ikke testet"
              />
              <span className="ml-auto">
                CELLER VISER <b className="font-extrabold text-foreground">SISTE MÅLING</b> · DELTA VS FORRIGE · DATO
              </span>
            </>
          ) : (
            <>
              <LegendSwatch className="border-border bg-secondary" label="Målt" />
              <LegendSwatch striped className="border-border" label="Ikke testet" />
              {data.legendNote && (
                <span className="ml-auto inline-flex items-center gap-1.5 uppercase tracking-[0.06em] text-warning">
                  <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  {data.legendNote}
                </span>
              )}
            </>
          )}
        </div>

        {/* MATRIX */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[220px]" />
              {data.columns.map((c) => (
                <col key={c.id} />
              ))}
              <col className="w-[130px]" />
            </colgroup>
            <thead>
              <tr>
                <th className="border-b border-border bg-card p-3 text-left" />
                {data.columns.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    className="border-b border-border bg-card px-2.5 pb-3 pt-3 align-bottom text-center"
                  >
                    <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full align-middle", axisDot[c.axis])} />
                    <span className="block text-[11px] font-extrabold tracking-[0.06em] text-foreground">
                      {c.name}
                    </span>
                    <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                      {c.unit}
                    </span>
                    {c.target && (
                      <span className="mt-1 inline-block rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-extrabold tracking-[0.04em] text-muted-foreground">
                        {c.target}
                      </span>
                    )}
                  </th>
                ))}
                <th className="border-b border-border bg-card p-3" />
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-b-0 hover:bg-primary/[0.02]"
                >
                  {/* Player cell */}
                  <td className="align-middle">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 text-left">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold",
                          avatarTone[row.avatarTone ?? "default"],
                        )}
                      >
                        {row.initials}
                      </span>
                      <div className="min-w-0">
                        <span className="flex items-center text-[13px] font-bold tracking-[-0.005em] text-foreground">
                          {row.group && (
                            <span
                              className={cn(
                                "mr-1 inline-flex h-3.5 items-center rounded-[3px] px-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.1em]",
                                groupTone[row.group.tone],
                              )}
                            >
                              {row.group.label}
                            </span>
                          )}
                          <span className="truncate">{row.name}</span>
                        </span>
                        <span className="mt-0.5 block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                          {row.sub}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Score cells */}
                  {row.cells.map((cell, i) => (
                    <td
                      key={data.columns[i]?.id ?? i}
                      className="border-l border-border p-0 align-middle text-center"
                    >
                      <ScoreCell cell={cell} />
                    </td>
                  ))}

                  {/* Action cell */}
                  <td className="border-l border-border align-middle">
                    <div className="flex justify-end px-2.5 py-2">
                      <AssignButton row={row} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border bg-secondary/40 px-5 py-3 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
          <span>
            {data.meta.players} spillere × {data.meta.tests} tester ={" "}
            <b className="text-foreground">{totalCells} celler</b> ·{" "}
            <b className="text-foreground">{data.meta.measured} målt</b> ·{" "}
            <b className="text-foreground">{data.meta.missing} mangler</b>
          </span>
          <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
            {data.attribution && <span className="text-foreground">{data.attribution}</span>}
            <span>{data.footerHint}</span>
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Gruppe-snitt */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-1 flex items-baseline gap-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.1em] text-foreground">
            Gruppe-snitt
            <span className="font-bold text-muted-foreground">siste måling · alle spillere</span>
          </h3>
          <dl className="mt-2">
            {data.avg.map((a, i) => (
              <div
                key={a.name}
                className={cn(
                  "flex items-baseline justify-between py-3",
                  i > 0 && "border-t border-border",
                )}
              >
                <dt className="text-[14px] text-foreground">{a.name}</dt>
                <dd className="font-mono text-[16px] font-extrabold tabular-nums text-foreground">
                  {a.value}
                  {a.unit && (
                    <span className="ml-1.5 font-mono text-[11px] font-bold text-muted-foreground">
                      {a.unit}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Trender */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-1 flex items-baseline gap-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.1em] text-foreground">
            Trender
            <span className="font-bold text-muted-foreground">vs forrige måling</span>
          </h3>
          <ul className="mt-2">
            {data.trends.map((t, i) => {
              const TrendIcon = t.tone === "up" ? TrendingUp : t.tone === "down" ? TrendingDown : Minus;
              const tone =
                t.tone === "up" ? "text-success" : t.tone === "down" ? "text-destructive" : "text-muted-foreground";
              return (
                <li
                  key={t.label}
                  className={cn(
                    "flex items-center justify-between py-3.5",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span className="flex items-center gap-2.5 text-[15px] text-foreground">
                    <TrendIcon className={cn("h-4 w-4 shrink-0", tone)} strokeWidth={2} aria-hidden />
                    {t.label}
                  </span>
                  <span className={cn("font-mono text-[15px] font-extrabold tabular-nums", tone)}>
                    {t.count}
                  </span>
                </li>
              );
            })}
          </ul>
          {data.trendNote && (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{data.trendNote}</p>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Små presentasjons-biter ──────────────────────────────────────────────

function ToolbarButton({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href?: string;
  icon: typeof Download;
  label: string;
  primary?: boolean;
}) {
  const cls = cn(
    "inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    primary
      ? "border border-primary bg-primary text-accent hover:opacity-90"
      : "border border-border bg-card text-foreground hover:bg-secondary",
  );
  const inner = (
    <>
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  // Ingen href = funksjonen er ikke bygget ennå. Vis disablet «Kommer»-knapp
  // i stedet for en død lenke (404) eller en stille klikkbar knapp som ikke gjør noe.
  return (
    <button
      type="button"
      disabled
      title="Kommer"
      aria-disabled="true"
      className={cn(cls, "cursor-not-allowed opacity-50")}
    >
      {inner}
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] opacity-70">
        Kommer
      </span>
    </button>
  );
}

function LegendSwatch({
  className,
  label,
  striped,
}: {
  className?: string;
  label: string;
  striped?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "h-3.5 w-3.5 rounded-[3px] border",
          striped &&
            "bg-[repeating-linear-gradient(135deg,var(--color-secondary)_0_4px,var(--color-card)_4px_8px)]",
          className,
        )}
      />
      {label}
    </span>
  );
}
