/**
 * PlayerHQ · Trening · Kalender (uke-view)
 *
 * Endelig design fra wireframe/design-files-v2/playerhq-C/09-tren-kalender.html.
 * Datakilde: TrainingPlanSession + Round + TestResult for valgt uke.
 * Plassholdere (// TODO): streak-graf, formtopp, pyramide-aggregering kommer
 * når Achievement/Goal-data ligger inne.
 */

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Flag,
  Heart,
  Plus,
  Users,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { dagerIUken, startOfWeek, ukenummer } from "@/lib/uke-helpers";
import type { PyramidArea } from "@/generated/prisma/client";

type Search = { uke?: string };

type EventTone = "coach" | "self" | "group" | "round" | "tourn" | "fysio";
type EventStatus = "done" | "plan" | "skip" | "late";

type CalEvent = {
  title: string;
  meta: string;
  tone: EventTone;
  top: number;
  height: number;
  status: EventStatus;
  tier?: "fys" | "tek" | "slag" | "spill" | "turn";
  icon?: React.ReactNode;
};

const DAG_NAVN = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const TIER_MAP: Record<PyramidArea, "fys" | "tek" | "slag" | "spill" | "turn"> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

function minutterTilTop(d: Date) {
  // Y = (timer-6) * 54px (6:00 = top 0, hver time = 54px = 60min)
  const minutter = d.getHours() * 60 + d.getMinutes() - 6 * 60;
  return Math.max(0, (minutter / 60) * 54);
}

function status(scheduledAt: Date, sessionStatus: string): EventStatus {
  if (sessionStatus === "COMPLETED") return "done";
  if (sessionStatus === "SKIPPED") return "skip";
  const now = new Date();
  if (scheduledAt < now && sessionStatus === "PLANNED") return "late";
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

  let referanseDato = new Date();
  if (params.uke) {
    const [aar, ukeStr] = params.uke.split("-W");
    const aarNum = Number(aar);
    const ukeNum = Number(ukeStr);
    if (aarNum && ukeNum) {
      // Approximate: 4th jan + (uke-1) uker → ISO uke
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

  // Bygg event-map per dag (0=man ... 6=søn)
  const eventsPerDag: CalEvent[][] = [[], [], [], [], [], [], []];
  function dagIndex(d: Date) {
    const diff = Math.floor(
      (d.getTime() - ukeStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.max(0, Math.min(6, diff));
  }
  for (const s of sessions) {
    const idx = dagIndex(s.scheduledAt);
    const slutt = new Date(s.scheduledAt.getTime() + s.durationMin * 60_000);
    eventsPerDag[idx].push({
      title: s.title,
      meta: `${fmtKl(s.scheduledAt)} – ${fmtKl(slutt)}`,
      tone: "coach",
      top: minutterTilTop(s.scheduledAt),
      height: Math.max(40, (s.durationMin / 60) * 54),
      status: status(s.scheduledAt, s.status),
      tier: TIER_MAP[s.pyramidArea],
    });
  }
  for (const r of runder) {
    eventsPerDag[dagIndex(r.playedAt)].push({
      title: `Runde · ${r.course.name}`,
      meta: fmtKl(r.playedAt),
      tone: "round",
      top: minutterTilTop(r.playedAt),
      height: 216,
      status: "done",
      icon: <Flag className="h-3 w-3" />,
    });
  }
  for (const t of tester) {
    eventsPerDag[dagIndex(t.takenAt)].push({
      title: `Test · ${t.test.name}`,
      meta: fmtKl(t.takenAt),
      tone: "tourn",
      top: minutterTilTop(t.takenAt),
      height: 90,
      status: "done",
    });
  }

  const fornavn = user.name.split(" ")[0];
  const aktivitetCount = sessions.length + runder.length + tester.length;
  const uke = ukenummer(ukeStart);

  const fmtMnd = (d: Date) =>
    d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  const subTekst = `Uke ${uke} · ${fmtMnd(ukeStart)} – ${fmtMnd(new Date(ukeSlutt.getTime() - 1))} ${ukeStart.getFullYear()}`;

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
  const totalSelv = 0; // TODO: skille selv-trening når flagg på TrainingPlanSession finnes
  const planlagtMin = sessions.reduce((s, x) => s + x.durationMin, 0);
  const planlagtTimer = `${Math.floor(planlagtMin / 60)} t ${planlagtMin % 60} m`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="mb-6">
          <PageHeader
            eyebrow={`PlayerHQ · Trening · Kalender · ${subTekst}`}
            titleLead="Uke"
            titleItalic={String(uke)}
            sub={`${aktivitetCount} ${aktivitetCount === 1 ? "aktivitet" : "aktiviteter"} denne uka, ${fornavn}. Alt i én oversikt: coach-økter, selvtrening, runder, tester.`}
          />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Økter denne uka"
            value={String(totalCoach + totalSelv)}
            sub={`${totalCoach} coaching · ${totalSelv} selvtrening`}
          />
          <KpiCard label="Volum" value={planlagtTimer} sub="planlagt" />
          <KpiCard
            label="Runder"
            value={String(runder.length)}
            sub={runder.length ? "spilt denne uka" : "ingen registrert"}
          />
          <KpiCard
            label="Tester"
            value={String(tester.length)}
            sub={tester.length ? "fullført" : "ingen denne uka"}
            small
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4">
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
          <div className="flex gap-2">
            {["Coaching", "Selvtrening", "Gruppe", "Runde", "Test"].map((t) => (
              <button
                key={t}
                type="button"
                disabled
                title="Filter kommer i v2"
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground opacity-60"
              >
                {t}
              </button>
            ))}
          </div>
          <span className="flex-1" />
          <button
            type="button"
            disabled
            title="iCal-eksport kommer i v2"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-foreground opacity-60"
          >
            <Download className="h-4 w-4" />
            Eksporter iCal
          </button>
          <Link
            href="/portal/ny-okt"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Ny økt
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-secondary">
              <div />
              {dager.map((d, i) => {
                const erIdag =
                  d.toDateString() === new Date().toDateString();
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

            <div className="grid grid-cols-[60px_repeat(7,1fr)]">
              <div className="flex flex-col">
                {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => (
                  <div
                    key={h}
                    className="h-[54px] border-b border-r border-border/60 px-2 py-2 text-right font-mono text-[10px] text-muted-foreground"
                  >
                    {String(h).padStart(2, "0")}
                  </div>
                ))}
              </div>
              {dager.map((d, i) => (
                <div
                  key={i}
                  className="relative min-h-[864px] border-l border-border/60"
                >
                  {todayLine?.dag === i && (
                    <div
                      className="absolute left-0 right-0 z-10 h-0.5 bg-destructive"
                      style={{ top: todayLine.top }}
                    >
                      <span className="absolute -left-2 -top-1 h-2 w-2 rounded-full bg-destructive" />
                    </div>
                  )}
                  {eventsPerDag[i].map((e, j) => (
                    <EventCard key={j} ev={e} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <RailCard label="Ukens pyramide">
              {/* TODO v2: pyramide-aggregering fra PyramidArea per session */}
              <div className="mt-2 text-sm text-muted-foreground">
                Ingen data for denne uken.
              </div>
            </RailCard>

            <RailCard label="Streak">
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-medium leading-none">
                  —
                </span>
                <span className="text-sm text-muted-foreground">dager</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {/* TODO: streak-beregning */}
                Streak-tracker kommer.
              </div>
            </RailCard>

            <RailCard label="Formtopp">
              <div className="mt-1 font-display text-base italic leading-relaxed">
                «Peak-mål settes når sesongen starter.»
              </div>
              {/* TODO: Goal-data */}
            </RailCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  small,
}: {
  label: string;
  value: string;
  sub: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-mono font-medium leading-tight tracking-tight text-foreground ${
          small ? "text-base font-display font-semibold" : "text-3xl"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function EventCard({ ev }: { ev: CalEvent }) {
  const toneMap: Record<EventTone, string> = {
    coach: "bg-accent/40 text-foreground border-l-4 border-l-accent",
    self: "bg-secondary text-foreground border border-dashed border-border border-l-4 border-l-primary",
    group: "bg-primary text-primary-foreground border-l-4 border-l-primary",
    round: "bg-accent/30 text-foreground border-l-4 border-l-accent",
    tourn: "bg-foreground text-accent border-l-4 border-l-accent",
    fysio: "bg-secondary text-muted-foreground border-l-4 border-l-border",
  };
  const statusMap: Record<EventStatus, string> = {
    done: "bg-primary",
    plan: "bg-accent",
    skip: "bg-destructive",
    late: "bg-destructive/60",
  };
  return (
    <div
      className={`absolute left-1 right-1 rounded-md px-2 py-2 text-xs leading-tight ${toneMap[ev.tone]}`}
      style={{ top: ev.top, height: ev.height }}
    >
      <div className="inline-flex items-center gap-2 font-semibold">
        {ev.icon}
        <span>{ev.title}</span>
      </div>
      <div className="mt-1 font-mono text-[10px] opacity-85">{ev.meta}</div>
      <span
        className={`absolute right-2 top-2 h-2 w-2 rounded-full ${statusMap[ev.status]}`}
      />
    </div>
  );
}

function RailCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

// Unused, kept for parity if reintroduced later
void Heart;
void Users;
