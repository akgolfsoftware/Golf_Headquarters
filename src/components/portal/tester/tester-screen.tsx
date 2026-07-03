/**
 * PlayerHQ · Tren · Tester — mobile-first skjerm.
 *
 * Port av [historisk fasit, fjernet 2026-07-03] playerhq/components-test-week.html. Den
 * coach-only periodiserings-dialogen (seksjon 3 i FASIT) er bevisst utelatt —
 * spilleren ser kun trigger (nedtelling) og resultat (tester + historikk),
 * jf. design-prinsippet i HTML-fotnoten.
 *
 * Server component. Inline-utvidelse + filter lever i <TesterList> (klient).
 * Ingen hardkodet hex, ingen emoji (kun lucide). DS-tokens hele veien.
 */

import Link from "next/link";
import {
  Activity,
  CalendarClock,
  ChevronRight,
  ListChecks,
  MapPin,
  Plus,
  Target,
} from "lucide-react";
import { PlayerHero } from "@/components/portal/player-hero";
import { cn } from "@/lib/utils";
import {
  type Axis,
  type PlannedTest,
  type TesterScreenData,
} from "@/lib/portal-tester/tester-data";
import { TesterList } from "./tester-list";

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

function Kpi({
  label,
  value,
  sub,
  unit,
  featured,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  unit?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border px-3.5 py-3",
        featured ? "border-primary/30 bg-primary text-accent" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "font-mono text-[9px] font-extrabold uppercase tracking-[0.12em]",
          featured ? "text-accent/80" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums",
          featured ? "text-accent" : "text-foreground",
        )}
      >
        {value}
        {unit && (
          <span
            className={cn(
              "ml-0.5 text-sm font-bold",
              featured ? "text-accent/70" : "text-muted-foreground",
            )}
          >
            {unit}
          </span>
        )}
      </span>
      {sub && (
        <span
          className={cn(
            "font-mono text-[10px] font-semibold tracking-[0.02em]",
            featured ? "text-accent/80" : "text-muted-foreground",
          )}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function PlannedRow({ t }: { t: PlannedTest }) {
  return (
    <Link
      href={t.href}
      className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-secondary/60"
    >
      <span className={cn("h-8 w-8 rounded-lg", AXIS_PILL[t.axis], "flex items-center justify-center")}>
        <Target className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold leading-tight tracking-[-0.005em] text-foreground">
          {t.name}
        </p>
        <p className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {t.axis}
          {t.step && (
            <>
              {" · "}steg {t.step.current} av {t.step.total}
            </>
          )}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-warning">
        {t.state === "ongoing" ? (
          <>
            <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-warning motion-reduce:animate-none" />
            Pågår
          </>
        ) : (
          t.when ?? "Planlagt"
        )}
      </span>
    </Link>
  );
}

export function TesterScreen({ data }: { data: TesterScreenData }) {
  const allRows = data.groups.flatMap((g) => g.rows);
  const bestGroup =
    [...data.groups]
      .filter((g) => g.total > 0)
      .sort((a, b) => b.done / b.total - a.done / a.total)[0] ?? null;

  return (
    <div className="mx-auto max-w-[460px] space-y-6 px-4 py-6 sm:max-w-2xl sm:py-8">
      {/* HERO */}
      <PlayerHero
        eyebrow="PlayerHQ · Trening · Tester"
        titleLead="Tester"
        titleItalic="og"
        titleTrail="benchmarks"
        sub={
          data.testedCount > 0
            ? `${data.testedCount} av ${data.totalTests} tester påbegynt · ${data.totalAttempts} resultater logget${data.lastResultLabel ? ` · sist ${data.lastResultLabel}` : ""}`
            : `${data.totalTests} tester i batteriet — ingen tatt ennå.`
        }
        actions={
          <Link
            href="/portal/tren/tester/katalog"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 font-sans text-[13px] font-bold tracking-[-0.005em] text-accent hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Ta ny test
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <Kpi
          label="Gjennomført"
          value={`${data.testedCount}`}
          unit={`/${data.totalTests}`}
          featured
          sub={
            data.totalTests > 0
              ? `${Math.round((data.testedCount / data.totalTests) * 100)} % av batteriet`
              : "—"
          }
        />
        <Kpi
          label="Totale forsøk"
          value={`${data.totalAttempts}`}
          sub={data.totalAttempts > 0 ? "på tvers av alle tester" : "ingen ennå"}
        />
        <Kpi
          label="Beste kategori"
          value={bestGroup ? bestGroup.label : "—"}
          sub={
            bestGroup ? (
              <span className="inline-flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", AXIS_BAR[bestGroup.axis])} aria-hidden />
                {bestGroup.done} av {bestGroup.total} tatt
              </span>
            ) : (
              "—"
            )
          }
        />
        <Kpi
          label="Pågående"
          value={`${data.planned.filter((p) => p.state === "ongoing").length}`}
          sub={data.active ? data.active.name : "ingen aktive økter"}
        />
      </div>

      {/* ACTIVE TEST BANNER */}
      {data.active && (
        <Link
          href={data.active.href}
          className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/[0.06] px-3.5 py-3 hover:bg-warning/10"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <Activity className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
              Pågående test: <span className="font-bold">{data.active.name}</span>
            </p>
            {data.active.step && (
              <p className="mt-0.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                Steg {data.active.step.current} av {data.active.step.total} registrert
              </p>
            )}
          </div>
          <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-primary px-3 font-sans text-[12px] font-bold text-accent">
            Fortsett
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </span>
        </Link>
      )}

      {/* PLANLAGT · KOMMENDE TESTER */}
      {data.planned.length > 0 && (
        <section aria-labelledby="planlagt-heading">
          <div className="mb-3 flex items-center gap-3">
            <h2
              id="planlagt-heading"
              className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground"
            >
              Planlagt · kommende tester
            </h2>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              {data.planned.length}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <div className="flex flex-col gap-2">
            {data.planned.map((t) => (
              <PlannedRow key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* TESTER-LISTE (queue + filter + inline-utvidelse) */}
      <section aria-labelledby="tester-heading">
        <div className="mb-3 flex items-center gap-3">
          <ListChecks className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <h2
            id="tester-heading"
            className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground"
          >
            Test-batteri
          </h2>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        {allRows.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-12 text-center">
            <CalendarClock
              className="mx-auto h-7 w-7 text-muted-foreground/40"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="mt-3 text-[13px] text-muted-foreground">
              Ingen tester tilgjengelig ennå.
            </p>
            <Link
              href="/portal/tren/tester/katalog"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
            >
              Åpne test-katalogen
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
        ) : (
          <TesterList rows={allRows} />
        )}
      </section>

      {/* prinsipp-fotnote (fra FASIT) */}
      <p className="flex items-start gap-2 rounded-lg bg-secondary px-3.5 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" strokeWidth={1.5} aria-hidden />
        <span>
          <span className="font-bold text-foreground">Tre baselines.</span> Hver test åpner egen
          progresjon (nå vs forrige), antall forsøk og trend-linje. Verdiktet er et signal — coachen
          tar avgjørelsen.
        </span>
      </p>
    </div>
  );
}
