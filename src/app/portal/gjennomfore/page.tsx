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
      {tab === "kalender" ? <KalenderTab userId={user.id} /> : null}
      {tab === "live" ? <LiveTab userId={user.id} /> : null}
      {tab === "booking" ? <BookingTab userId={user.id} /> : null}
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

async function KalenderTab({ userId }: { userId: string }) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const slutt = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);

  const okter = await prisma.trainingSessionV2
    .findMany({
      where: {
        studentId: userId,
        startTime: { gte: start, lte: slutt },
      },
      orderBy: { startTime: "asc" },
      take: 30,
    })
    .catch(() => []);

  if (okter.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
        <h3 className="font-display mt-3 text-lg font-semibold">
          Ingen planlagte økter neste 14 dager
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Be coachen din legge inn økter, eller bestill en time.
        </p>
        <div className="mt-4">
          <Link href="/portal/gjennomfore?tab=booking">
            <AthleticButton variant="lime" size="sm">
              Book økt
              <ArrowRight className="h-3.5 w-3.5" />
            </AthleticButton>
          </Link>
        </div>
      </div>
    );
  }

  // Grupper etter dag
  const perDag = new Map<string, typeof okter>();
  for (const o of okter) {
    const key = o.startTime.toISOString().slice(0, 10);
    const list = perDag.get(key) ?? [];
    list.push(o);
    perDag.set(key, list);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AthleticEyebrow>
          NESTE 14 DAGER · {okter.length} ØKTER
        </AthleticEyebrow>
        <Link
          href="/portal/tren/kalender"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
        >
          Full kalender
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {Array.from(perDag.entries()).map(([dag, dagOkter]) => (
          <div
            key={dag}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              {new Date(dag).toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </div>
            <ul className="space-y-2">
              {dagOkter.map((s) => {
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
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {timeStr} · {durMin} min · {s.practiceType}
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {s.title}
                      </div>
                    </div>
                    <Link href={`/portal/tren/${s.id}`}>
                      <AthleticButton variant="ghost-light" size="sm">
                        Åpne
                      </AthleticButton>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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

async function BookingTab({ userId }: { userId: string }) {
  const aktive = await prisma.booking
    .findMany({
      where: {
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { gte: new Date() },
      },
      orderBy: { startAt: "asc" },
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
      },
      take: 10,
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <AthleticEyebrow>
            DINE BOOKINGER · {aktive.length} AKTIVE
          </AthleticEyebrow>
          <Link href="/booking">
            <AthleticButton variant="lime" size="sm">
              Book ny økt
              <ArrowRight className="h-3.5 w-3.5" />
            </AthleticButton>
          </Link>
        </div>

        {aktive.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="font-display mt-3 text-lg font-semibold">
              Ingen aktive bookinger
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Book en coaching-time, drop-in eller TrackMan-økt.
            </p>
            <div className="mt-4">
              <Link href="/booking">
                <AthleticButton variant="lime" size="sm">
                  Start booking
                  <ArrowRight className="h-3.5 w-3.5" />
                </AthleticButton>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {aktive.map((b) => {
              const dato = b.startAt.toLocaleDateString("nb-NO", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              const tid = b.startAt.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {dato} · {tid} · {b.serviceType.durationMin} MIN
                    </div>
                    <div className="font-display mt-1 text-sm font-semibold">
                      {b.serviceType.name}
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      {b.location.name} · Status:{" "}
                      <span
                        className={
                          b.status === "CONFIRMED"
                            ? "font-semibold text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {b.status === "CONFIRMED" ? "Bekreftet" : "Venter på betaling"}
                      </span>
                    </div>
                  </div>
                  <Link href={`/portal/meg/bookinger`}>
                    <AthleticButton variant="ghost-light" size="sm">
                      Detaljer
                    </AthleticButton>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
