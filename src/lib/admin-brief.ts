// Generer en personlig daglig brief for en coach.

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export type BriefData = {
  dagensTimer: {
    start: Date | null;
    slutt: Date | null;
    antall: number;
  };
  nyligeRunder: { spiller: string; bane: string; sgTotal: number | null }[];
  ventendeGodkjenninger: number;
  ubesvarteMeldinger: number;
  ukenGenerert: { signals: number; planActions: number };
};

export async function getBriefData(coach: User): Promise<BriefData> {
  const idag = new Date();
  const dagensStart = new Date(idag);
  dagensStart.setHours(0, 0, 0, 0);
  const dagensSlutt = new Date(dagensStart);
  dagensSlutt.setDate(dagensSlutt.getDate() + 1);

  const igaar = new Date(idag);
  igaar.setDate(igaar.getDate() - 1);

  const sjuDager = new Date(idag);
  sjuDager.setDate(sjuDager.getDate() - 7);

  const [bookings, runder, godkjenninger, meldinger, signals, planActions] =
    await Promise.all([
      prisma.booking.findMany({
        where: { startAt: { gte: dagensStart, lt: dagensSlutt } },
        orderBy: { startAt: "asc" },
      }),
      prisma.round.findMany({
        where: { playedAt: { gte: igaar } },
        include: {
          user: { select: { name: true } },
          course: { select: { name: true } },
        },
        orderBy: { playedAt: "desc" },
        take: 5,
      }),
      prisma.planAction.count({ where: { status: "PENDING" } }),
      prisma.coachingSession.count({
        where: { kind: "DIRECT", coachId: coach.id },
      }),
      prisma.signal.count({ where: { computedAt: { gte: sjuDager } } }),
      prisma.planAction.count({ where: { createdAt: { gte: sjuDager } } }),
    ]);

  return {
    dagensTimer: {
      start: bookings[0]?.startAt ?? null,
      slutt: bookings[bookings.length - 1]?.endAt ?? null,
      antall: bookings.length,
    },
    nyligeRunder: runder.map((r) => ({
      spiller: r.user.name,
      bane: r.course.name,
      sgTotal: r.sgTotal,
    })),
    ventendeGodkjenninger: godkjenninger,
    ubesvarteMeldinger: meldinger,
    ukenGenerert: {
      signals,
      planActions,
    },
  };
}

export function bygBriefSystemPrompt(): string {
  return `Du er en daglig brief-assistent for en golf-coach. Lag en kort,
motiverende oppsummering på norsk bokmål basert på dataene fra dagens
brief. Maks 4 punktkuler, hvert under 25 ord. Fokus på:

- Hva er viktigst i dag (timer, godkjenninger, meldinger)
- Mest interessante spiller-utvikling siste 24t
- Én konkret handlingsanbefaling

Vær spesifikk, ikke generisk. Aldri emoji. Aldri be coachen "logge inn"
eller liknende — de er allerede her.`;
}

export function bygBriefUserPrompt(data: BriefData): string {
  const linjer: string[] = [];

  linjer.push(`Dato: ${new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}`);
  linjer.push("");
  linjer.push("Dagens timer:");
  if (data.dagensTimer.antall === 0) {
    linjer.push("  Ingen bookinger i dag.");
  } else {
    const start = data.dagensTimer.start?.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const slutt = data.dagensTimer.slutt?.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
    linjer.push(`  ${data.dagensTimer.antall} bookinger mellom ${start} og ${slutt}.`);
  }

  linjer.push("");
  linjer.push("Nyligste runder (siste 24t):");
  if (data.nyligeRunder.length === 0) {
    linjer.push("  Ingen.");
  } else {
    for (const r of data.nyligeRunder) {
      const sg =
        r.sgTotal != null
          ? `SG ${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1)}`
          : "ingen SG";
      linjer.push(`  - ${r.spiller} på ${r.bane} (${sg})`);
    }
  }

  linjer.push("");
  linjer.push(`Ventende godkjenninger: ${data.ventendeGodkjenninger}`);
  linjer.push(`Ubesvarte direkte meldinger: ${data.ubesvarteMeldinger}`);
  linjer.push("");
  linjer.push(
    `Siste 7 dager: ${data.ukenGenerert.signals} signals, ${data.ukenGenerert.planActions} plan-forslag.`
  );

  return linjer.join("\n");
}
