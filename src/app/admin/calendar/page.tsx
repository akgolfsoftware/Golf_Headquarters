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

export default async function AdminKalender({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });
  const params = await searchParams;

  let maned = new Date();
  if (params.maned) {
    const [aar, mnd] = params.maned.split("-").map(Number);
    if (aar && mnd) maned = new Date(aar, mnd - 1, 1);
  }

  const start = startOfMonth(maned);
  const slutt = endOfMonth(maned);
  const gridStart = startOfWeek(start);
  const gridSlutt = new Date(slutt);
  gridSlutt.setDate(gridSlutt.getDate() + 14);

  const [bookings, sessions, runder, tester] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: gridStart, lt: gridSlutt } },
      select: {
        id: true,
        startAt: true,
        user: { select: { name: true } },
        serviceType: { select: { name: true } },
      },
    }),
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: gridStart, lt: gridSlutt } },
      select: {
        id: true,
        scheduledAt: true,
        title: true,
        plan: { select: { user: { select: { name: true } } } },
      },
    }),
    prisma.round.findMany({
      where: { playedAt: { gte: gridStart, lt: gridSlutt } },
      select: {
        id: true,
        playedAt: true,
        user: { select: { name: true } },
        course: { select: { name: true } },
      },
    }),
    prisma.testResult.findMany({
      where: { takenAt: { gte: gridStart, lt: gridSlutt } },
      select: {
        id: true,
        takenAt: true,
        user: { select: { name: true } },
        test: { select: { name: true } },
      },
    }),
  ]);

  const aktiviteterPerDag = new Map<string, Aktivitet[]>();
  function leggTil(dato: Date, akt: Aktivitet) {
    const key = dato.toISOString().split("T")[0];
    aktiviteterPerDag.set(key, [...(aktiviteterPerDag.get(key) ?? []), akt]);
  }
  for (const b of bookings)
    leggTil(b.startAt, {
      type: "training",
      tittel: `${b.user.name} · ${b.serviceType.name}`,
    });
  for (const s of sessions)
    leggTil(s.scheduledAt, {
      type: "training",
      tittel: `${s.plan.user.name} · ${s.title}`,
    });
  for (const r of runder)
    leggTil(r.playedAt, {
      type: "round",
      tittel: `${r.user.name} · ${r.course.name}`,
    });
  for (const t of tester)
    leggTil(t.takenAt, {
      type: "test",
      tittel: `${t.user.name} · ${t.test.name}`,
    });

  const forrigeMnd = new Date(maned.getFullYear(), maned.getMonth() - 1, 1);
  const nesteMnd = new Date(maned.getFullYear(), maned.getMonth() + 1, 1);
  const formatManed = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Kalender
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            {MND_NAVN[maned.getMonth()]} {maned.getFullYear()}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/calendar?maned=${formatManed(forrigeMnd)}`}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-border"
          >
            ←
          </Link>
          <Link
            href="/admin/calendar"
            className="rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-border"
          >
            I dag
          </Link>
          <Link
            href={`/admin/calendar?maned=${formatManed(nesteMnd)}`}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-border"
          >
            →
          </Link>
        </div>
      </header>

      <div className="flex gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Trening/booking
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
        bygglenke={() => "/admin/calendar"}
      />
    </div>
  );
}
