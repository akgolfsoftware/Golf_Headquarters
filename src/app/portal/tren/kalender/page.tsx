import Link from "next/link";
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          {MND_NAVN[maned.getMonth()]} {maned.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Link
            href={`/portal/tren/kalender?maned=${formatManed(forrigeMnd)}`}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-border"
          >
            ←
          </Link>
          <Link
            href="/portal/tren/kalender"
            className="rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-border"
          >
            I dag
          </Link>
          <Link
            href={`/portal/tren/kalender?maned=${formatManed(nesteMnd)}`}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-border"
          >
            →
          </Link>
        </div>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Trening
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-pyr-spill" /> Runde
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Test
        </span>
      </div>

      <ManedKalender
        maned={maned}
        aktiviteterPerDag={aktiviteterPerDag}
        bygglenke={(dato) =>
          `/portal/tren?dato=${dato.toISOString().split("T")[0]}`
        }
      />
    </div>
  );
}
