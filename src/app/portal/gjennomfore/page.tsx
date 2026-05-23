/**
 * /portal/gjennomfore — PlayerHQ Gjennomføre hovedseksjon.
 * Tabs: I dag / Kalender / Live-økt / Booking
 */

import Link from "next/link";
import { ArrowRight, Calendar, Activity, MapPin, Clock } from "lucide-react";
import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { prisma } from "@/lib/prisma";
import { GjennomforeShell } from "@/components/portal-gjennomfore/gjennomfore-shell";
import { GjennomforeOverview } from "@/components/portal-gjennomfore/gjennomfore-overview";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

const VALID_TABS = ["idag", "kalender", "live", "booking"] as const;

export default async function GjennomforePage({ searchParams }: Props) {
  const user = await requirePortalUser();

  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const params = await searchParams;

  // Ingen tab valgt → vis oversiktsskjerm
  if (!params.tab) {
    return <GjennomforeOverview userId={user.id} />;
  }

  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "idag";

  // Tellere
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [todayCount, liveCount] = await Promise.all([
    prisma.trainingSessionV2
      .count({
        where: {
          studentId: user.id,
          startTime: { gte: startOfDay, lte: endOfDay },
        },
      })
      .catch(() => 0),
    prisma.trainingSessionV2
      .count({ where: { studentId: user.id, status: "IN_PROGRESS" } })
      .catch(() => 0),
  ]);

  return (
    <GjennomforeShell counts={{ idag: todayCount, live: liveCount }}>
      {tab === "idag" ? <IdagTab userId={user.id} /> : null}
      {tab === "kalender" ? <KalenderTab /> : null}
      {tab === "live" ? <LiveTab userId={user.id} /> : null}
      {tab === "booking" ? <BookingTab /> : null}
    </GjennomforeShell>
  );
}

async function IdagTab({ userId }: { userId: string }) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.trainingSessionV2
    .findMany({
      where: { studentId: userId, startTime: { gte: startOfDay, lte: endOfDay } },
      orderBy: { startTime: "asc" },
    })
    .catch(() => []);

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="font-display mt-3 text-lg font-semibold">Ingen økter i dag</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bla i kalenderen eller bestill en økt med coachen din.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link href="/portal/gjennomfore?tab=kalender">
            <AthleticButton variant="ghost-light" size="sm">
              Se kalender
            </AthleticButton>
          </Link>
          <Link href="/portal/gjennomfore?tab=booking">
            <AthleticButton variant="lime" size="sm">
              Book økt
            </AthleticButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AthleticEyebrow>DAGENS PROGRAM · {sessions.length} ØKTER</AthleticEyebrow>
      <ul className="space-y-2">
        {sessions.map((s) => {
          const durMin = Math.round(
            (s.endTime.getTime() - s.startTime.getTime()) / 60000,
          );
          const timeStr = s.startTime.toLocaleTimeString("nb-NO", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {timeStr} · {durMin} MIN · {s.practiceType}
                </div>
                <div className="font-display mt-1 text-sm font-semibold">
                  {s.title}
                </div>
              </div>
              <Link href={`/portal/tren/${s.id}`}>
                <AthleticButton variant="lime" size="sm">
                  Start
                  <ArrowRight className="h-3.5 w-3.5" />
                </AthleticButton>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function KalenderTab() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AthleticEyebrow>KALENDER</AthleticEyebrow>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
            <Calendar className="mr-1 inline h-5 w-5 text-primary" />
            Uke, måned og dag-visning
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag-drop økter, se booking, koble TrackMan-data.
          </p>
        </div>
        <Link href="/portal/tren/kalender">
          <AthleticButton variant="lime" size="md">
            Åpne kalender
            <ArrowRight className="h-4 w-4" />
          </AthleticButton>
        </Link>
      </div>
    </div>
  );
}

async function LiveTab({ userId }: { userId: string }) {
  const liveSession = await prisma.trainingSessionV2
    .findFirst({
      where: { studentId: userId, status: "IN_PROGRESS" },
      orderBy: { startTime: "desc" },
    })
    .catch(() => null);

  if (!liveSession) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="font-display mt-3 text-lg font-semibold">Ingen aktiv økt</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Start en planlagt økt fra &quot;I dag&quot; eller fra kalenderen.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[var(--color-accent-deep)] bg-[var(--color-accent-fill)] p-5">
      <AthleticEyebrow>PÅGÅR NÅ</AthleticEyebrow>
      <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
        {liveSession.title}
      </h2>
      <Link href={`/portal/tren/${liveSession.id}`}>
        <AthleticButton variant="lime" size="md" className="mt-3">
          Fortsett økten
          <ArrowRight className="h-4 w-4" />
        </AthleticButton>
      </Link>
    </div>
  );
}

function BookingTab() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AthleticEyebrow>BOOKING</AthleticEyebrow>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
            <MapPin className="mr-1 inline h-5 w-5 text-primary" />
            Book økt med coach
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Velg coach, anlegg og tidspunkt. Betaling via Stripe.
          </p>
        </div>
        <Link href="/booking">
          <AthleticButton variant="lime" size="md">
            Start booking
            <ArrowRight className="h-4 w-4" />
          </AthleticButton>
        </Link>
      </div>
    </div>
  );
}
