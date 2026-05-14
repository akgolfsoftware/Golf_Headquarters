/**
 * PlayerHQ · Trening · Kalender (uke-view)
 *
 * Datakilde: TrainingPlanSession + Round + TestResult for valgt uke.
 * Kalender er full bredde. Pyramide-fordeling vises i strip over kalender.
 */

import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { dagerIUken, startOfWeek, ukenummer } from "@/lib/uke-helpers";
import type { PyramidArea } from "@/generated/prisma/client";
import { KalenderInteraktiv } from "./kalender-interaktiv";
import type { KalenderEvent, Favoritt } from "./kalender-interaktiv";

type Search = { uke?: string; filter?: string };

const DAG_NAVN = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const TIER_MAP: Record<PyramidArea, "fys" | "tek" | "slag" | "spill" | "turn"> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

// Static Tailwind classes — must be full strings, not dynamic templates
const PYR_BAR: Record<PyramidArea, string> = {
  FYS:  "bg-pyr-fys",
  TEK:  "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS:  "Fysisk",
  TEK:  "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

// Filter: which tones are shown per filter value
const FILTER_TONES: Record<string, ("coach" | "round" | "tourn")[]> = {
  alle:      ["coach", "round", "tourn"],
  coaching:  ["coach"],
  runde:     ["round"],
  test:      ["tourn"],
};

function minutterTilTop(d: Date) {
  const minutter = d.getHours() * 60 + d.getMinutes() - 6 * 60;
  return Math.max(0, (minutter / 60) * 54);
}

function kalStatus(scheduledAt: Date, s: string): "done" | "plan" | "skip" | "late" {
  if (s === "COMPLETED") return "done";
  if (s === "SKIPPED") return "skip";
  if (scheduledAt < new Date() && s === "PLANNED") return "late";
  return "plan";
}

function fmtKl(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;

  // --- Uke-navigasjon ---
  let referanseDato = new Date();
  if (params.uke) {
    const [aar, ukeStr] = params.uke.split("-W");
    const aarNum = Number(aar);
    const ukeNum = Number(ukeStr);
    if (aarNum && ukeNum) {
      const jan4 = new Date(aarNum, 0, 4);
      const start = startOfWeek(jan4);
      start.setDate(start.getDate() + (ukeNum - 1) * 7);
      referanseDato = start;
    }
  }

  const ukeStart = startOfWeek(referanseDato);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const dager = dagerIUken(ukeStart);

  // --- Data ---
  const aktivePlaner = await prisma.trainingPlan.findMany({
    where: { userId: user.id, isActive: true },
    select: { id: true },
  });
  const planIds = aktivePlaner.map((p) => p.id);

  const [sessions, runder, tester] = await Promise.all([
    planIds.length
      ? prisma.trainingPlanSession.findMany({
          where: {
            planId: { in: planIds },
            scheduledAt: { gte: ukeStart, lt: ukeSlutt },
          },
          select: {
            id: true,
            scheduledAt: true,
            title: true,
            durationMin: true,
            pyramidArea: true,
            status: true,
            rationale: true,
            _count: { select: { drills: true } },
          },
        })
      : Promise.resolve([]),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: ukeStart, lt: ukeSlutt } },
      select: { id: true, playedAt: true, course: { select: { name: true } } },
    }),
    prisma.testResult.findMany({
      where: { userId: user.id, takenAt: { gte: ukeStart, lt: ukeSlutt } },
      select: { id: true, takenAt: true, test: { select: { name: true } } },
    }),
  ]);

  // --- Favoritter (for SlotModal) ---
  const recentCompleted = planIds.length
    ? await prisma.trainingPlanSession.findMany({
        where: { planId: { in: planIds }, status: "COMPLETED" },
        orderBy: { scheduledAt: "desc" },
        select: { title: true, pyramidArea: true, durationMin: true },
        take: 20,
      })
    : [];
  const seenTitles = new Set<string>();
  const favoritter: Favoritt[] = [];
  for (const s of recentCompleted) {
    if (!seenTitles.has(s.title) && favoritter.length < 3) {
      seenTitles.add(s.title);
      favoritter.push({
        title: s.title,
        pyramidArea: s.pyramidArea,
        durationMin: s.durationMin,
      });
    }
  }

  // --- Pyramide-fordeling (minutter per område) ---
  const pyrMin: Partial<Record<PyramidArea, number>> = {};
  for (const s of sessions) {
    pyrMin[s.pyramidArea] = (pyrMin[s.pyramidArea] ?? 0) + s.durationMin;
  }
  const totalPyrMin = Object.values(pyrMin).reduce((a, b) => a + b, 0) || 1;
  const pyrOmrader = (Object.keys(pyrMin) as PyramidArea[]).sort(
    (a, b) => (pyrMin[b] ?? 0) - (pyrMin[a] ?? 0)
  );

  // --- Events per dag ---
  const eventsPerDagAll: KalenderEvent[][] = [[], [], [], [], [], [], []];
  function dagIndex(d: Date) {
    const diff = Math.floor(
      (d.getTime() - ukeStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.max(0, Math.min(6, diff));
  }

  for (const s of sessions) {
    const idx = dagIndex(s.scheduledAt);
    const slutt = new Date(s.scheduledAt.getTime() + s.durationMin * 60_000);
    eventsPerDagAll[idx].push({
      sessionId: s.id,
      title: s.title,
      meta: `${fmtKl(s.scheduledAt)} – ${fmtKl(slutt)}`,
      tone: "coach",
      top: minutterTilTop(s.scheduledAt),
      height: Math.max(40, (s.durationMin / 60) * 54),
      status: kalStatus(s.scheduledAt, s.status),
      tier: TIER_MAP[s.pyramidArea],
      pyramidArea: s.pyramidArea,
      durationMin: s.durationMin,
      drillCount: s._count.drills,
      rationale: s.rationale ?? undefined,
    });
  }
  for (const r of runder) {
    eventsPerDagAll[dagIndex(r.playedAt)].push({
      title: `Runde · ${r.course.name}`,
      meta: fmtKl(r.playedAt),
      tone: "round",
      top: minutterTilTop(r.playedAt),
      height: 216,
      status: "done",
    });
  }
  for (const t of tester) {
    eventsPerDagAll[dagIndex(t.takenAt)].push({
      title: `Test · ${t.test.name}`,
      meta: fmtKl(t.takenAt),
      tone: "tourn",
      top: minutterTilTop(t.takenAt),
      height: 90,
      status: "done",
    });
  }

  // --- Filter ---
  const aktivFilter = (params.filter ?? "alle").toLowerCase();
  const visToner = FILTER_TONES[aktivFilter] ?? FILTER_TONES["alle"];
  const eventsPerDag = eventsPerDagAll.map((dag) =>
    dag.filter((ev) => (visToner as string[]).includes(ev.tone))
  );

  // --- KPI-data ---
  const fornavn = user.name.split(" ")[0];
  const aktivitetCount = sessions.length + runder.length + tester.length;
  const uke = ukenummer(ukeStart);

  const fmtMnd = (d: Date) =>
    d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  const subTekst = `Uke ${uke} · ${fmtMnd(ukeStart)} – ${fmtMnd(
    new Date(ukeSlutt.getTime() - 1)
  )} ${ukeStart.getFullYear()}`;

  const forrigeUke = new Date(ukeStart);
  forrigeUke.setDate(forrigeUke.getDate() - 7);
  const nesteUke = new Date(ukeStart);
  nesteUke.setDate(nesteUke.getDate() + 7);
  const fmtParam = (d: Date) =>
    `${d.getFullYear()}-W${String(ukenummer(d)).padStart(2, "0")}`;

  const idag = new Date();
  const todayLine =
    idag >= ukeStart && idag < ukeSlutt
      ? { dag: dagIndex(idag), top: minutterTilTop(idag) }
      : null;

  const totalCoach = sessions.length;
  const totalSelv = 0;
  const planlagtMin = sessions.reduce((s, x) => s + x.durationMin, 0);
  const planlagtTimer = `${Math.floor(planlagtMin / 60)} t ${planlagtMin % 60} m`;

  // Planlagte spill og turneringer (SPILL + TURN sessions)
  const spillOgTurn = sessions.filter(
    (s) => s.pyramidArea === "SPILL" || s.pyramidArea === "TURN"
  );

  // Filter-lenke helper
  function filterLink(f: string) {
    const sp = new URLSearchParams();
    if (params.uke) sp.set("uke", params.uke);
    if (f !== "alle") sp.set("filter", f);
    const qs = sp.toString();
    return `/portal/tren/kalender${qs ? "?" + qs : ""}`;
  }

  const FILTER_PILLS = [
    { key: "coaching",    label: "Coaching" },
    { key: "selvtrening", label: "Selvtrening", disabled: true },
    { key: "gruppe",      label: "Gruppe",      disabled: true },
    { key: "runde",       label: "Runde" },
    { key: "test",        label: "Test" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <PageHeader
            eyebrow={`PlayerHQ · Trening · Kalender · ${subTekst}`}
            titleLead="Uke"
            titleItalic={String(uke)}
            sub={`${aktivitetCount} ${
              aktivitetCount === 1 ? "aktivitet" : "aktiviteter"
            } denne uka, ${fornavn}. Alt i én oversikt: coach-økter, selvtrening, runder, tester.`}
          />
        </div>

        {/* KPI-strip */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Økter denne uka"
            value={String(totalCoach + totalSelv)}
            sub={`${totalCoach} coaching · ${totalSelv} selvtrening`}
          />
          <KpiCard label="Volum" value={planlagtTimer} sub="planlagt trening" />
          <Link href="/portal/mal/runder">
            <KpiCard
              label="Spill og turnering"
              value={String(spillOgTurn.length)}
              sub={spillOgTurn.length ? "planlagt denne uka" : "ingen planlagt"}
              link
            />
          </Link>
          <Link href="/portal/tren/tester">
            <KpiCard
              label="Tester"
              value={String(tester.length)}
              sub={tester.length ? "fullført" : "ingen denne uka"}
              link
            />
          </Link>
        </div>

        {/* Pyramide-fordeling */}
        {pyrOmrader.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card px-6 py-4">
            <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Fordeling denne uka
            </div>
            <div className="flex h-3 overflow-hidden rounded-full">
              {pyrOmrader.map((pyr) => {
                const pct = Math.round(((pyrMin[pyr] ?? 0) / totalPyrMin) * 100);
                return (
                  <div
                    key={pyr}
                    className={`${PYR_BAR[pyr]} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${PYR_LABEL[pyr]}: ${pyrMin[pyr]} min`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {pyrOmrader.map((pyr) => {
                const min = pyrMin[pyr] ?? 0;
                const pct = Math.round((min / totalPyrMin) * 100);
                return (
                  <span key={pyr} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <span className={`h-2 w-2 rounded-sm ${PYR_BAR[pyr]}`} />
                    {PYR_LABEL[pyr]}
                    <span className="tabular-nums text-foreground">{pct}%</span>
                    <span className="tabular-nums opacity-60">{min}m</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* Uke-navigasjon */}
          <div className="inline-flex gap-1 rounded-md border border-border bg-card p-1">
            <Link
              href={`/portal/tren/kalender?uke=${fmtParam(forrigeUke)}`}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-2 text-xs font-medium text-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Forrige uke
            </Link>
            <Link
              href="/portal/tren/kalender"
              className="rounded-sm bg-foreground px-2 py-2 text-xs font-medium text-background"
            >
              I dag
            </Link>
            <Link
              href={`/portal/tren/kalender?uke=${fmtParam(nesteUke)}`}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-2 text-xs font-medium text-foreground hover:bg-secondary"
            >
              Neste uke
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Filter-piller */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={filterLink("alle")}
              className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${
                aktivFilter === "alle"
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              Alle
            </Link>
            {FILTER_PILLS.map((p) =>
              p.disabled ? (
                <span
                  key={p.key}
                  className="rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-foreground opacity-40"
                  title="Kommer i v2"
                >
                  {p.label}
                </span>
              ) : (
                <Link
                  key={p.key}
                  href={filterLink(p.key)}
                  className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${
                    aktivFilter === p.key
                      ? "bg-foreground text-background"
                      : "border border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {p.label}
                </Link>
              )
            )}
          </div>

          <span className="flex-1" />

          {/* Ny økt */}
          <Link
            href="/portal/ny-okt"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Ny økt
          </Link>
        </div>

        {/* Kalender — full bredde */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Dag-header */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-secondary">
            <div />
            {dager.map((d, i) => {
              const erIdag = d.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className="border-l border-border/60 px-2 py-2 text-center"
                >
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    {DAG_NAVN[i]}
                  </div>
                  <div
                    className={`mt-1 font-mono text-lg font-medium ${
                      erIdag ? "font-bold text-primary" : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interaktivt kalender-grid */}
          <KalenderInteraktiv
            eventsPerDag={eventsPerDag}
            dager={dager}
            todayLine={todayLine}
            favoritter={favoritter}
            isFree={user.tier === "GRATIS"}
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  link,
}: {
  label: string;
  value: string;
  sub: string;
  link?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 ${
        link ? "cursor-pointer transition-colors hover:border-foreground/20 hover:bg-secondary/50" : ""
      }`}
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-3xl font-medium leading-tight tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
