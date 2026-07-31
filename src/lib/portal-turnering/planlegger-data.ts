/**
 * Data-loader for PlayerHQ Turneringsplanlegger
 * — katalog (i dag + fremtid) + spillerens plan.
 */

import { prisma } from "@/lib/prisma";

const MND = [
  "jan",
  "feb",
  "mar",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "des",
];

function datoKort(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

function datoLang(d: Date): string {
  const mnd = [
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
  return `${d.getDate()}. ${mnd[d.getMonth()]} ${d.getFullYear()}`;
}

export type PlanTier = "A" | "B" | "C";

export type PlanleggerTurnering = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  datoLabel: string;
  roundDates: string[];
  venue: string | null;
  entryCloses: Date | null;
  entryClosesLabel: string | null;
  entryClosesUrgent: boolean;
  registrationUrl: string | null;
  officialUrl: string | null;
  recommendedLevel: string | null;
  tour: string | null;
  format: string | null;
  status: string | null;
  /** Spillerens entry hvis lagt i plan. */
  entry: {
    id: string;
    planTier: PlanTier;
    entryStatus: string;
    statusLabel: string;
    claimedAt: Date | null;
    confirmedAt: Date | null;
  } | null;
};

function parseRoundDates(raw: unknown, start: Date, end: Date | null): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  // Fallback: start…end
  const out: string[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  let t = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endD = end ?? start;
  const endT = Date.UTC(endD.getUTCFullYear(), endD.getUTCMonth(), endD.getUTCDate());
  for (let i = 0; i < 7 && t <= endT; i++) {
    out.push(new Date(t).toISOString().slice(0, 10));
    t += dayMs;
  }
  return out;
}

function statusLabel(s: string): string {
  switch (s) {
    case "PLANNED":
      return "På planen";
    case "CLAIMED_REGISTERED":
      return "Venter bekreftelse";
    case "CONFIRMED":
      return "Bekreftet av spiller";
    case "WITHDRAWN":
      return "Trukket";
    case "COMPLETED":
      return "Gjennomført";
    case "DNF":
      return "Brøt";
    default:
      return s;
  }
}

function asPlanTier(v: string | null | undefined): PlanTier {
  if (v === "A" || v === "C") return v;
  return "B";
}

/**
 * Katalog: turneringer med start i dag eller senere (norsk «i dag» via UTC-dag ok nok).
 */
export async function loadPlanleggerKatalog(
  userId: string,
): Promise<PlanleggerTurnering[]> {
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const tournaments = await prisma.tournament.findMany({
    where: {
      mergedIntoId: null,
      startDate: { gte: startOfToday },
      OR: [
        { status: { in: ["UPCOMING", "IN_PROGRESS"] } },
        { status: null },
      ],
    },
    orderBy: { startDate: "asc" },
    take: 200,
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true,
      entryCloses: true,
      registrationUrl: true,
      officialUrl: true,
      recommendedLevel: true,
      roundDates: true,
      tour: true,
      format: true,
      status: true,
      course: { select: { name: true } },
    },
  });

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId,
      tournamentId: { in: tournaments.map((t) => t.id) },
    },
    select: {
      id: true,
      tournamentId: true,
      planTier: true,
      entryStatus: true,
      playerClaimedRegisteredAt: true,
      playerConfirmedRegisteredAt: true,
    },
  });
  const entryByTid = new Map(
    entries
      .filter((e): e is typeof e & { tournamentId: string } => Boolean(e.tournamentId))
      .map((e) => [e.tournamentId, e]),
  );

  const dayMs = 24 * 60 * 60 * 1000;

  return tournaments.map((t) => {
    const e = entryByTid.get(t.id) ?? null;
    const rounds = parseRoundDates(t.roundDates, t.startDate, t.endDate);
    const closes = t.entryCloses;
    const urgent =
      closes != null &&
      closes.getTime() >= now.getTime() &&
      closes.getTime() - now.getTime() <= 7 * dayMs;

    return {
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      datoLabel:
        t.endDate && t.endDate.toDateString() !== t.startDate.toDateString()
          ? `${datoKort(t.startDate)} – ${datoKort(t.endDate)}`
          : datoKort(t.startDate),
      roundDates: rounds,
      venue: t.course?.name ?? t.location,
      entryCloses: closes,
      entryClosesLabel: closes ? datoLang(closes) : null,
      entryClosesUrgent: urgent,
      registrationUrl: t.registrationUrl,
      officialUrl: t.officialUrl,
      recommendedLevel: t.recommendedLevel,
      tour: t.tour,
      format: t.format === "STROKE" ? null : t.format,
      status: t.status,
      entry: e
        ? {
            id: e.id,
            planTier: asPlanTier(e.planTier),
            entryStatus: e.entryStatus,
            statusLabel: statusLabel(e.entryStatus),
            claimedAt: e.playerClaimedRegisteredAt,
            confirmedAt: e.playerConfirmedRegisteredAt,
          }
        : null,
    };
  });
}

/** Kun spillerens plan (alle statuser unntatt withdrawn optional). */
export async function loadMinTurneringsplan(
  userId: string,
): Promise<PlanleggerTurnering[]> {
  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId,
      entryStatus: { in: ["PLANNED", "CLAIMED_REGISTERED", "CONFIRMED"] },
      tournament: {
        startDate: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      },
    },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          location: true,
          entryCloses: true,
          registrationUrl: true,
          officialUrl: true,
          recommendedLevel: true,
          roundDates: true,
          tour: true,
          format: true,
          status: true,
          course: { select: { name: true } },
        },
      },
    },
    orderBy: { tournament: { startDate: "asc" } },
    take: 100,
  });

  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();

  return entries
    .filter((e) => e.tournament)
    .map((e) => {
      const t = e.tournament!;
      const closes = t.entryCloses;
      const urgent =
        closes != null &&
        closes.getTime() >= now.getTime() &&
        closes.getTime() - now.getTime() <= 7 * dayMs;
      return {
        id: t.id,
        name: t.name,
        startDate: t.startDate,
        endDate: t.endDate,
        datoLabel:
          t.endDate && t.endDate.toDateString() !== t.startDate.toDateString()
            ? `${datoKort(t.startDate)} – ${datoKort(t.endDate)}`
            : datoKort(t.startDate),
        roundDates: parseRoundDates(t.roundDates, t.startDate, t.endDate),
        venue: t.course?.name ?? t.location,
        entryCloses: closes,
        entryClosesLabel: closes ? datoLang(closes) : null,
        entryClosesUrgent: urgent,
        registrationUrl: t.registrationUrl,
        officialUrl: t.officialUrl,
        recommendedLevel: t.recommendedLevel,
        tour: t.tour,
        format: t.format === "STROKE" ? null : t.format,
        status: t.status,
        entry: {
          id: e.id,
          planTier: asPlanTier(e.planTier),
          entryStatus: e.entryStatus,
          statusLabel: statusLabel(e.entryStatus),
          claimedAt: e.playerClaimedRegisteredAt,
          confirmedAt: e.playerConfirmedRegisteredAt,
        },
      };
    });
}
