import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
} from "@/lib/uke-helpers";
import {
  ManedKalender,
  type Aktivitet,
} from "@/components/portal/maned-kalender";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type Search = { maned?: string };

const MND_NAVN = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;

  // ?maned=2026-05 → Date(2026, 4, 1)
  let maned = new Date();
  if (params.maned) {
    const [aar, mnd] = params.maned.split("-").map(Number);
    if (aar && mnd) maned = new Date(aar, mnd - 1, 1);
  }

  const start = startOfMonth(maned);
  const slutt = endOfMonth(maned);
  // Utvid til hele uker så grid-startuke sin første dag dekkes
  const gridStart = startOfWeek(start);
  const gridSlutt = new Date(slutt);
  gridSlutt.setDate(gridSlutt.getDate() + 14);

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
            scheduledAt: { gte: gridStart, lt: gridSlutt },
          },
          select: { id: true, scheduledAt: true, title: true },
        })
      : Promise.resolve([]),
    prisma.round.findMany({
      where: {
        userId: user.id,
        playedAt: { gte: gridStart, lt: gridSlutt },
      },
      select: { id: true, playedAt: true, course: { select: { name: true } } },
    }),
    prisma.testResult.findMany({
      where: {
        userId: user.id,
        takenAt: { gte: gridStart, lt: gridSlutt },
      },
      select: { id: true, takenAt: true, test: { select: { name: true } } },
    }),
  ]);

  const aktiviteterPerDag = new Map<string, Aktivitet[]>();
  function leggTil(dato: Date, akt: Aktivitet) {
    const key = dato.toISOString().split("T")[0];
    aktiviteterPerDag.set(key, [...(aktiviteterPerDag.get(key) ?? []), akt]);
  }
  for (const s of sessions)
    leggTil(s.scheduledAt, { type: "training", tittel: s.title });
  for (const r of runder)
    leggTil(r.playedAt, { type: "round", tittel: r.course.name });
  for (const t of tester)
    leggTil(t.takenAt, { type: "test", tittel: t.test.name });

  const forrigeMnd = new Date(maned.getFullYear(), maned.getMonth() - 1, 1);
  const nesteMnd = new Date(maned.getFullYear(), maned.getMonth() + 1, 1);
  const formatManed = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const aktivitetCount = sessions.length + runder.length + tester.length;
  const manedTittel = `${MND_NAVN[maned.getMonth()]} ${maned.getFullYear()}`;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Trening · Kalender"
        titleLead={MND_NAVN[maned.getMonth()]}
        titleItalic={String(maned.getFullYear())}
        sub={`${aktivitetCount} aktivitet${aktivitetCount === 1 ? "" : "er"} planlagt denne måneden — coach-økter, runder, tester.`}
        actions={
          <div className="inline-flex gap-1 rounded-md border border-border bg-card p-1">
            <Link
              href={`/portal/tren/kalender?maned=${formatManed(forrigeMnd)}`}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Forrige
            </Link>
            <Link
              href="/portal/tren/kalender"
              className="rounded-sm bg-foreground px-2 py-1.5 text-xs font-medium text-background"
            >
              I dag
            </Link>
            <Link
              href={`/portal/tren/kalender?maned=${formatManed(nesteMnd)}`}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
            >
              Neste
              <ChevronRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        }
      />

      {aktivitetCount === 0 ? (
        <EmptyState
          icon={CalendarDays}
          titleItalic="Ingen aktiviteter"
          titleTrail={`i ${manedTittel}`}
          sub="Snakk med coachen din for å få planlagt økter, eller bla videre til en annen måned."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Trening
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Runde
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Test
            </span>
          </div>

          <ManedKalender
            maned={maned}
            aktiviteterPerDag={aktiviteterPerDag}
            bygglenke={(dato) =>
              `/portal/tren?dato=${dato.toISOString().split("T")[0]}`
            }
          />
        </>
      )}
    </div>
  );
}
