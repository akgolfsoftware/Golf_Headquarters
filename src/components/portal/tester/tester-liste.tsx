"use client";

/**
 * PlayerHQ · Trening · Tester — «Tester og benchmarks».
 *
 * Presentasjonell, props-drevet test-oversikt + NGF-katalog (flat liste over
 * hele test-batteriet, gruppert per pyramide-akse via rekkefølge, med
 * akse-filter). Bygget FRA fasiten [historisk fasit, fjernet 2026-07-03] _screens/pl-tester.png:
 *   hero (eyebrow · «Tester og benchmarks» · deck · «Ta ny test») →
 *   4 KPI-kort (Gjennomført / Totale forsøk / Beste kategori / Pågående) →
 *   TEST-BATTERI-seksjon (ALLE TESTER N + filter-pills + rader) →
 *   «Tre baselines»-fotnote.
 *
 * Tom-tilstand er fasiten: hver rad viser «Ingen målinger ennå» + «IKKE TATT».
 * Ingen Prisma/DB/auth — kun presentasjon. DS-tokens hele veien, lucide-ikoner.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, ListChecks, MapPin, Plus } from "lucide-react";
import { PlayerHero } from "@/components/portal/player-hero";
import { cn } from "@/lib/utils";

// ── Typer ──────────────────────────────────────────────────────────────────

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";

export type TestRow = {
  id: string;
  /** Visningsnavn, f.eks. «TN Driver Gate». */
  name: string;
  axis: Axis;
  /** Siste verdi som tekst (f.eks. «142 kg»). Utelatt = ikke tatt ennå. */
  latest?: string;
  /** Sub-tekst under navnet. Default: «Ingen målinger ennå». */
  detail?: string;
  /** Lenke til test-detalj. Default: /portal/tren/tester/{id}. */
  href?: string;
};

export type TesterListeData = {
  eyebrow: string;
  /** Antall tester gjennomført (med minst ett resultat). */
  gjennomfort: number;
  /** Totalt antall tester i batteriet. */
  totalt: number;
  /** Totalt antall forsøk på tvers av alle tester. */
  totaleForsok: number;
  /** Antall pågående test-økter. */
  pagaende: number;
  rows: TestRow[];
  /** Knapp-mål. */
  hrefs: {
    nyTest: string;
    katalog: string;
  };
};

// ── Akse-stiler (kanoniske pyramide-tokens) ─────────────────────────────────

const AXIS_BAR: Record<Axis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const AXIS_PILL: Record<Axis, string> = {
  fys: "bg-[var(--color-pyr-fys-track)] text-[var(--pyr-fys)]",
  tek: "bg-[var(--color-pyr-tek-track)] text-[var(--pyr-tek)]",
  slag: "bg-[var(--color-pyr-slag-track)] text-[var(--pyr-slag)]",
  spill: "bg-[var(--color-pyr-spill-track)] text-primary",
  turn: "bg-[var(--color-pyr-turn-track)] text-destructive",
};

const AXIS_LABEL: Record<Axis, string> = {
  fys: "Fysisk",
  tek: "Teknisk",
  slag: "Slag",
  spill: "Spill",
  turn: "Turnering",
};

// Filter-rekkefølge matcher fasiten: ALLE · FYS · TEK · SLAG · SPILL · TURN.
type FilterAxis = "all" | Axis;

const FILTERS: { key: FilterAxis; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "fys", label: "Fys" },
  { key: "tek", label: "Tek" },
  { key: "slag", label: "Slag" },
  { key: "spill", label: "Spill" },
  { key: "turn", label: "Turn" },
];

// ── KPI-kort ────────────────────────────────────────────────────────────────

function Kpi({
  label,
  value,
  unit,
  sub,
  featured,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border px-4 py-3.5",
        featured ? "border-primary/30 bg-primary text-accent" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]",
          featured ? "text-accent/85" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums",
          featured ? "text-accent" : "text-foreground",
        )}
      >
        {value}
        {unit ? (
          <span
            className={cn(
              "ml-0.5 text-base font-bold",
              featured ? "text-accent/70" : "text-muted-foreground",
            )}
          >
            {unit}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "font-mono text-[11px] font-semibold tracking-[0.01em]",
          featured ? "text-accent/85" : "text-muted-foreground",
        )}
      >
        {sub}
      </span>
    </div>
  );
}

// ── Test-rad (tom-tilstand = fasit) ─────────────────────────────────────────

function Row({ row }: { row: TestRow }) {
  const href = row.href ?? `/portal/tren/tester/${row.id}`;
  const hasData = Boolean(row.latest);

  return (
    <li className="border-t border-border first:border-t-0">
      <Link
        href={href}
        className="grid grid-cols-[3px_1fr_auto] items-center gap-x-4 px-1 py-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        {/* akse-kant */}
        <span className={cn("h-10 w-[3px] rounded-full", AXIS_BAR[row.axis])} aria-hidden />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[17px] font-bold leading-tight tracking-[-0.01em] text-foreground">
              {row.name}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                AXIS_PILL[row.axis],
              )}
            >
              {row.axis}
            </span>
          </div>
          <p className="mt-1 truncate font-mono text-[12px] tracking-[0.01em] text-muted-foreground">
            {row.detail ?? "Ingen målinger ennå"}
          </p>
        </div>

        {/* status / siste verdi */}
        <span className="shrink-0 text-right">
          {hasData ? (
            <span className="font-mono text-[18px] font-bold leading-none tracking-[-0.015em] tabular-nums text-foreground">
              {row.latest}
            </span>
          ) : (
            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Ikke tatt
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

// ── Hoved-komponent ─────────────────────────────────────────────────────────

export function TesterListe({ data }: { data: TesterListeData }) {
  const [filter, setFilter] = useState<FilterAxis>("all");

  const visible = useMemo(
    () => (filter === "all" ? data.rows : data.rows.filter((r) => r.axis === filter)),
    [filter, data.rows],
  );

  // Beste kategori: aksen med flest *gjennomførte* tester. I tom-tilstand
  // (alle 0) faller den tilbake til pyramide-rekkefølgen — FYS først — som
  // matcher fasiten («Fysisk · 0 av 8 tatt»).
  const bestKategori = useMemo(() => {
    const order: Axis[] = ["fys", "tek", "slag", "spill", "turn"];
    const total = new Map<Axis, number>();
    const done = new Map<Axis, number>();
    for (const r of data.rows) {
      total.set(r.axis, (total.get(r.axis) ?? 0) + 1);
      if (r.latest) done.set(r.axis, (done.get(r.axis) ?? 0) + 1);
    }
    let best: Axis | null = null;
    for (const a of order) {
      if ((total.get(a) ?? 0) === 0) continue;
      if (best === null || (done.get(a) ?? 0) > (done.get(best) ?? 0)) best = a;
    }
    if (!best) return null;
    return {
      axis: best,
      label: AXIS_LABEL[best],
      total: total.get(best) ?? 0,
      done: done.get(best) ?? 0,
    };
  }, [data.rows]);

  const pct = data.totalt > 0 ? Math.round((data.gjennomfort / data.totalt) * 100) : 0;

  return (
    <div className="mx-auto max-w-[460px] space-y-7 px-4 py-6 sm:max-w-2xl sm:py-8">
      {/* HERO */}
      <PlayerHero
        eyebrow={data.eyebrow}
        titleLead="Tester"
        titleItalic="og"
        titleTrail="benchmarks"
        sub={
          data.gjennomfort > 0
            ? `${data.gjennomfort} av ${data.totalt} tester påbegynt — ${data.totaleForsok} resultater logget.`
            : `${data.totalt} tester i batteriet — ingen tatt ennå.`
        }
        actions={
          <Link
            href={data.hrefs.nyTest}
            className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-primary px-6 font-sans text-[15px] font-bold tracking-[-0.01em] text-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            Ta ny test
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </Link>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-3">
        <Kpi
          label="Gjennomført"
          value={`${data.gjennomfort}`}
          unit={`/${data.totalt}`}
          featured
          sub={`${pct} % av batteriet`}
        />
        <Kpi
          label="Totale forsøk"
          value={`${data.totaleForsok}`}
          sub={data.totaleForsok > 0 ? "på tvers av alle tester" : "ingen ennå"}
        />
        <Kpi
          label="Beste kategori"
          value={bestKategori ? bestKategori.label : "—"}
          sub={
            bestKategori ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn("h-2 w-2 rounded-full", AXIS_BAR[bestKategori.axis])}
                  aria-hidden
                />
                {bestKategori.done} av {bestKategori.total} tatt
              </span>
            ) : (
              "—"
            )
          }
        />
        <Kpi
          label="Pågående"
          value={`${data.pagaende}`}
          sub={data.pagaende > 0 ? "aktive økter" : "ingen aktive økter"}
        />
      </div>

      {/* TEST-BATTERI */}
      <section aria-labelledby="test-batteri-heading">
        <div className="mb-3 flex items-center gap-3">
          <ListChecks className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <h2
            id="test-batteri-heading"
            className="font-mono text-[13px] font-extrabold uppercase tracking-[0.14em] text-foreground"
          >
            Test-batteri
          </h2>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        <div className="rounded-2xl border border-border bg-card">
          {/* filter-rad */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-3.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[12px] font-extrabold uppercase tracking-[0.12em] text-foreground">
                Alle tester
              </span>
              <span className="font-mono text-[12px] font-bold tracking-[0.04em] text-muted-foreground tabular-nums">
                {data.rows.length}
              </span>
            </div>
            <div
              role="tablist"
              aria-label="Filtrer tester etter pyramide-akse"
              className="ml-auto flex flex-wrap items-center justify-end gap-1.5"
            >
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "inline-flex h-7 items-center rounded-full px-3 font-mono text-[11px] font-bold uppercase tracking-[0.10em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      active
                        ? "bg-primary text-accent"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* rader */}
          {visible.length === 0 ? (
            <p className="px-4 py-12 text-center text-[13px] text-muted-foreground">
              Ingen tester i denne kategorien ennå.
            </p>
          ) : (
            <ul className="px-3 py-1">
              {visible.map((row) => (
                <Row key={row.id} row={row} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* prinsipp-fotnote (fra fasit) */}
      <p className="flex items-start gap-2.5 rounded-2xl border border-border bg-secondary/60 px-4 py-4 font-mono text-[13px] leading-relaxed text-muted-foreground">
        <MapPin
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70"
          strokeWidth={1.75}
          aria-hidden
        />
        <span>
          <span className="font-bold text-foreground">Tre baselines.</span> Hver test åpner egen
          progresjon (nå vs forrige), antall forsøk og trend-linje. Verdiktet er et signal — coachen
          tar avgjørelsen.
        </span>
      </p>
    </div>
  );
}
