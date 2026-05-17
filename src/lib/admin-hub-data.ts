// Samlet data-fetch for /admin hub-dashboard.

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export type DagensTime = {
  id: string;
  startAt: Date;
  endAt: Date;
  userName: string;
  userId: string;
  serviceName: string;
  locationName: string;
  status: string;
};

export type AktivPlayer = {
  id: string;
  name: string;
  hcp: number | null;
  tier: string;
  sisteAktivitet: Date | null;
};

export type AktivitetsItem = {
  type: "round" | "test" | "trackman" | "session";
  dato: Date;
  brukerNavn: string;
  brukerId: string;
  beskrivelse: string;
};

export type AdminHubData = {
  kpi: {
    aktiveSpillere: number;
    dagensTimer: number;
    ubesvarteMeldinger: number;
    ventendeGodkjenninger: number;
  };
  dagensTimer: DagensTime[];
  aktivePlayers: AktivPlayer[];
  aktivitetsFeed: AktivitetsItem[];
};

export async function getAdminHubData(user: User): Promise<AdminHubData> {
  const idag = new Date();
  const dagensStart = new Date(idag);
  dagensStart.setHours(0, 0, 0, 0);
  const dagensSlutt = new Date(dagensStart);
  dagensSlutt.setDate(dagensSlutt.getDate() + 1);

  const tretti = new Date(idag);
  tretti.setDate(tretti.getDate() - 30);

  const fjorten = new Date(idag);
  fjorten.setDate(fjorten.getDate() - 14);

  const [
    aktiveSpillereCount,
    dagensTimerRader,
    aktivePlayerRader,
    sisteRunder,
    sisteTester,
    sisteTrackman,
    sisteSesjoner,
    ubesvarteMeldinger,
    ventendeGodkjenninger,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER", lastLoginAt: { gte: tretti } } }),
    prisma.booking.findMany({
      where: { startAt: { gte: dagensStart, lt: dagensSlutt } },
      include: {
        user: { select: { id: true, name: true } },
        serviceType: { select: { name: true } },
        location: { select: { name: true } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        hcp: true,
        tier: true,
        lastLoginAt: true,
      },
      orderBy: { lastLoginAt: "desc" },
      take: 5,
    }),
    prisma.round.findMany({
      where: { playedAt: { gte: fjorten } },
      include: {
        user: { select: { id: true, name: true } },
        course: { select: { name: true } },
      },
      orderBy: { playedAt: "desc" },
      take: 8,
    }),
    prisma.testResult.findMany({
      where: { takenAt: { gte: fjorten } },
      include: {
        user: { select: { id: true, name: true } },
        test: { select: { name: true } },
      },
      orderBy: { takenAt: "desc" },
      take: 5,
    }),
    prisma.trackManSession.findMany({
      where: { recordedAt: { gte: fjorten } },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { recordedAt: "desc" },
      take: 5,
    }),
    prisma.trainingPlanSessionLog.findMany({
      where: { startedAt: { gte: fjorten } },
      include: {
        session: {
          select: {
            title: true,
            plan: { select: { user: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    // Ubesvarte = direkte sesjoner der siste melding er fra spiller (role "user").
    // Vi henter messages-blobben og filtrerer i JS — antall direkte sesjoner per
    // coach er lavt nok til at det er greit.
    prisma.coachingSession
      .findMany({
        where: { kind: "DIRECT", coachId: user.id },
        select: { messages: true },
      })
      .then((rader) => {
        let ubesvart = 0;
        for (const r of rader) {
          const meldinger = Array.isArray(r.messages)
            ? (r.messages as Array<{ role?: string }>)
            : [];
          const siste = meldinger.at(-1);
          if (siste?.role === "user") ubesvart += 1;
        }
        return ubesvart;
      }),
    prisma.planAction.count({
      where: { status: "PENDING" },
    }),
  ]);

  const dagensTimer: DagensTime[] = dagensTimerRader.map((b) => ({
    id: b.id,
    startAt: b.startAt,
    endAt: b.endAt,
    userName: b.user?.name ?? "Gjest",
    userId: b.user?.id ?? "",
    serviceName: b.serviceType.name,
    locationName: b.location.name,
    status: b.status,
  }));

  const aktivePlayers: AktivPlayer[] = aktivePlayerRader.map((p) => ({
    id: p.id,
    name: p.name,
    hcp: p.hcp,
    tier: p.tier,
    sisteAktivitet: p.lastLoginAt,
  }));

  const aktivitetsFeed: AktivitetsItem[] = [
    ...sisteRunder.map((r) => ({
      type: "round" as const,
      dato: r.playedAt,
      brukerNavn: r.user.name,
      brukerId: r.user.id,
      beskrivelse: `${r.course.name} · skår ${r.score}${r.sgTotal != null ? ` · SG ${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1)}` : ""}`,
    })),
    ...sisteTester.map((t) => ({
      type: "test" as const,
      dato: t.takenAt,
      brukerNavn: t.user.name,
      brukerId: t.user.id,
      beskrivelse: `${t.test.name} · ${t.score.toFixed(1).replace(".", ",")}`,
    })),
    ...sisteTrackman.map((tm) => ({
      type: "trackman" as const,
      dato: tm.recordedAt,
      brukerNavn: tm.user.name,
      brukerId: tm.user.id,
      beskrivelse: `TrackMan · ${tm.shotCount} slag`,
    })),
    ...sisteSesjoner.map((l) => ({
      type: "session" as const,
      dato: l.startedAt,
      brukerNavn: l.session.plan.user.name,
      brukerId: l.session.plan.user.id,
      beskrivelse: `Fullført økt: ${l.session.title}`,
    })),
  ]
    .sort((a, b) => b.dato.getTime() - a.dato.getTime())
    .slice(0, 12);

  return {
    kpi: {
      aktiveSpillere: aktiveSpillereCount,
      dagensTimer: dagensTimer.length,
      ubesvarteMeldinger,
      ventendeGodkjenninger,
    },
    dagensTimer,
    aktivePlayers,
    aktivitetsFeed,
  };
}
