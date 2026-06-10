/**
 * AgencyOS — Økter (uke-oversikt over treningsøkter)
 * Design migrert fra wireframe/design-files-v2/final/05-okter.html.
 *
 * Viser denne ukas TrainingPlanSession-instanser med pyramide-stripes per økt.
 * PageHeader, KPI-strip (Økter denne uka, Snitt-pyramide, Live nå, Forfalt),
 * filter-row, list-grid med fargekodet stripe. Server Component — interaktive
 * filtre kan legges til i v2.1 via dedikert client-fil.
 */

import { CalendarClock, Search } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import {
  PYR_LABEL,
  PYR_REKKEFOLGE,
  aggregateByArea,
  prosentPerArea,
} from "@/lib/pyramide";
import type { PyramidArea, SessionStatus } from "@/generated/prisma/client";

// ============================================================================
// Hjelpere
// ============================================================================

const NORSK_UKEDAGER = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
const NORSK_UKEDAG_LANG = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

// Pyramide-områdene må separeres visuelt. Bruker offisielle pyramide-tokens
// fra globals.css (--color-pyr-{fys,tek,slag,spill,turn} + -track).
const PYR_STRIPE_BG: Record<PyramidArea, string> = {
  FYS: "bg-[var(--color-pyr-fys)]",
  TEK: "bg-[var(--color-pyr-tek)]",
  SLAG: "bg-[var(--color-pyr-slag)]",
  SPILL: "bg-[var(--color-pyr-spill)]",
  TURN: "bg-[var(--color-pyr-turn)]",
};

const PYR_TAG_BG: Record<PyramidArea, string> = {
  FYS: "bg-[var(--color-pyr-fys-track)] text-[var(--color-pyr-fys)]",
  TEK: "bg-[var(--color-pyr-tek-track)] text-[var(--color-pyr-tek)]",
  SLAG: "bg-[var(--color-pyr-slag-track)] text-[var(--color-pyr-slag)]",
  SPILL: "bg-[var(--color-pyr-spill-track)] text-[var(--color-pyr-spill)]",
  TURN: "bg-[var(--color-pyr-turn-track)] text-[var(--color-pyr-turn)]",
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  PLANNED: "Planlagt",
  ACTIVE: "Aktiv",
  PAUSED: "Pauset",
  COMPLETED: "Gjennomført",
  ABANDONED: "Avbrutt",
  SKIPPED: "Hoppet over",
  CANCELLED: "Kansellert",
};

/**
 * Returnerer mandag 00:00 og søndag 23:59:59.999 for en gitt dato.
 * Norge: mandag er ukestart.
 */
function ukeRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const dag = start.getDay(); // 0=søn..6=lør
  const diff = dag === 0 ? -6 : 1 - dag; // til mandag
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * ISO-ukenummer for en dato (1-53).
 */
function isoWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

// ============================================================================
// Page
// ============================================================================

export default async function OkterAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const { start, end } = ukeRange(now);
  const ukenr = isoWeek(now);

  const sessions = await prisma.trainingPlanSession.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          user: { select: { id: true, name: true } },
        },
      },
      log: { select: { completedAt: true, startedAt: true } },
    },
  });

  // KPI-tall
  const totalCount = sessions.length;
  const gjennomfort = sessions.filter((s) => s.status === "COMPLETED").length;
  const planlagt = sessions.filter((s) => s.status === "PLANNED").length;
  const kansellert = sessions.filter(
    (s) => s.status === "CANCELLED" || s.status === "SKIPPED",
  ).length;

  // Forfalt = PLANNED + scheduledAt har passert
  const forfalt = sessions.filter(
    (s) => s.status === "PLANNED" && new Date(s.scheduledAt) < now,
  ).length;

  // Live = ACTIVE
  const liveNa = sessions.filter((s) => s.status === "ACTIVE").length;

  // Pyramide-aggregat for hele uka
  const pyrAgg = aggregateByArea(
    sessions.map((s) => ({
      pyramidArea: s.pyramidArea,
      durationMin: s.durationMin,
    })),
  );
  const pyrPst = prosentPerArea(pyrAgg);
  const harPyrData = PYR_REKKEFOLGE.some((k) => pyrAgg[k] > 0);

  // Grupper sessions per ukedag
  const perDag = new Map<number, typeof sessions>();
  for (const s of sessions) {
    const wd = new Date(s.scheduledAt).getDay();
    if (!perDag.has(wd)) perDag.set(wd, []);
    perDag.get(wd)!.push(s);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`AgencyOS · /admin/okter · uke ${ukenr}`}
        titleLead={String(totalCount)}
        titleItalic="økter"
        titleTrail={`· uke ${ukenr}`}
        sub={`Treningsøkter planlagt mellom ${formatDato(start)} og ${formatDato(end)}.`}
        actions={
          <a
            href="/admin/kalender"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary"
          >
            Åpne kalender
          </a>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiAccent
          label="Økter denne uka"
          value={String(totalCount)}
          sub={liveNa > 0 ? `${liveNa} live nå` : "Ingen live nå"}
        />
        <Kpi
          label="Gjennomført"
          value={String(gjennomfort)}
          sub={
            totalCount > 0
              ? `${Math.round((gjennomfort / totalCount) * 100)} % av uka`
              : "—"
          }
        />
        <Kpi
          label="Planlagt"
          value={String(planlagt)}
          sub={forfalt > 0 ? `${forfalt} forfalt` : "Ingen forfalte"}
          accent={forfalt > 0 ? "destructive" : undefined}
        />
        <Kpi
          label="Kansellert"
          value={String(kansellert)}
          sub={kansellert > 0 ? "inkluderer hoppet over" : "—"}
        />
      </div>

      {/* Pyramide-fordeling */}
      {harPyrData && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Snitt-pyramide denne uka
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-sm">
            {PYR_REKKEFOLGE.map((k) =>
              pyrPst[k] > 0 ? (
                <div
                  key={k}
                  className={PYR_STRIPE_BG[k]}
                  style={{ width: `${pyrPst[k]}%` }}
                  aria-label={`${PYR_LABEL[k]}: ${pyrPst[k]} %`}
                />
              ) : null,
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 font-mono text-[12px] text-muted-foreground">
            {PYR_REKKEFOLGE.map((k) => (
              <span key={k} className="inline-flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-sm ${PYR_STRIPE_BG[k]}`}
                />
                {k} {pyrPst[k]}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter-row (visuell — full client-state i v2.1) */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[260px] items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            placeholder="Søk spiller, gruppe eller dato"
            className="flex-1 bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Fokus" />
        <FilterChip label="Status" />
        <FilterChip label="Coach" />
      </form>

      {/* Body */}
      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          titleItalic="Ingen planlagte"
          titleTrail="økter denne uka"
          sub={`Det er ingen treningsøkter mellom ${formatDato(start)} og ${formatDato(end)}. Lag en ny treningsplan eller åpne kalenderen.`}
          cta={
            <a
              href="/admin/kalender"
              className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
            >
              Åpne kalender
            </a>
          }
        />
      ) : (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
            const dagsOkter = perDag.get(wd) ?? [];
            if (dagsOkter.length === 0) return null;
            return (
              <div
                key={wd}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5">
                  <div className="font-display text-sm font-semibold capitalize text-foreground">
                    {NORSK_UKEDAG_LANG[wd]}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {dagsOkter.length} økt{dagsOkter.length === 1 ? "" : "er"}
                  </div>
                </div>
                <ul className="divide-y divide-border/60">
                  {dagsOkter.map((s) => {
                    const spillerNavn = s.plan.user.name;
                    const tidStart = new Date(s.scheduledAt);
                    const tidSlutt = new Date(
                      tidStart.getTime() + s.durationMin * 60_000,
                    );
                    const erForfalt =
                      s.status === "PLANNED" && tidStart < now;
                    // Bygg en lokal pyramide-stripe for sesjonen — for v1
                    // har vi kun ett pyramidArea per sesjon.
                    return (
                      <li
                        key={s.id}
                        className="flex items-stretch gap-4 px-4 py-4 hover:bg-secondary/30"
                      >
                        <div
                          aria-hidden="true"
                          className={`w-1 rounded-sm ${PYR_STRIPE_BG[s.pyramidArea]}`}
                        />
                        <div className="w-16 shrink-0 font-mono text-[12px] text-muted-foreground">
                          <div className="text-foreground">
                            {formatTid(tidStart)}
                          </div>
                          <div className="mt-0.5">
                            {s.durationMin} min
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-foreground">
                              {s.title}
                            </span>
                            {erForfalt && (
                              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-destructive">
                                Forfalt
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-[12px] text-muted-foreground">
                            {spillerNavn || "Ukjent spiller"} · {s.plan.name}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${PYR_TAG_BG[s.pyramidArea]}`}
                            >
                              {s.pyramidArea}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {STATUS_LABEL[s.status]}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              · {formatTid(tidStart)}–{formatTid(tidSlutt)}
                            </span>
                          </div>
                        </div>
                        <div className="hidden shrink-0 items-center md:flex">
                          <a
                            href={`/admin/plans/${s.plan.id}`}
                            className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground hover:bg-secondary"
                          >
                            Åpne plan
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Komponenter
// ============================================================================

function KpiAccent({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-background/70">{sub}</div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "destructive";
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[28px] font-semibold leading-none tabular-nums ${
          accent === "destructive" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

// NORSK_UKEDAGER beholdes for fremtidig kort-form i mobil-visning.
void NORSK_UKEDAGER;
