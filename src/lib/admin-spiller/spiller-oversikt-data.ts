/**
 * Data-loader for Spiller 360-landingssiden («Oversikt»-fanen).
 *
 * Fasit: designsystem/train-lock/S3-03 Spiller profil bento.dc.html — bento
 * med identitet, nøkkeltall, ukeaktivitet + pyramide, teknisk plan, «Nå»,
 * sesong, minikalender og «I dag». D3 (Anders 03.09.2026): bygg alt nå.
 *
 * TruthLayer: hvert kort er koblet til en ekte spørring. Der fasiten viser
 * et konsept uten et 1:1-felt i datamodellen (fasitens «blokk N av M» på
 * teknisk plan), er det oversatt til det ekte begrepet i modellen
 * (P-posisjon → arbeidsoppgaver, TechnicalPlanPosition/PositionTask) i
 * stedet for oppdiktet. Felter uten data utelates, aldri fylt med 0/—.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";

const OSLO_TZ = "Europe/Oslo";
const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short" });

function osloIdagStart(): Date {
  const idagIso = new Intl.DateTimeFormat("sv-SE", { timeZone: OSLO_TZ }).format(new Date());
  return new Date(`${idagIso}T00:00:00`);
}

/** Mandag i inneværende uke (Oslo). */
function mondayOf(d: Date): Date {
  const dag = d.getDay() || 7;
  const m = new Date(d);
  m.setDate(d.getDate() - dag + 1);
  return m;
}

export type SpillerOversiktKort = {
  identitet: {
    navn: string;
    gruppeLabel: string | null;
    hjemmeklubb: string | null;
    iStallenSiden: string | null;
  };
  nokkeltall: {
    hcp: number | null;
    sgSnitt: number | null;
    okterIAar: number;
    turneringerSpilt: number;
  };
  uke: {
    prosent: number | null;
    gjennomfort: number;
    total: number;
    pyramide: { kode: "TEK" | "SLAG" | "TURN" | "SPILL"; pst: number }[];
  } | null;
  tekniskPlan: {
    navn: string;
    aktivPosisjon: string | null;
    oppgaverGjort: number;
    oppgaverTotalt: number;
  } | null;
  naa: {
    tittel: string;
    tidspunktLabel: string;
    sted: string | null;
  } | null;
  sesong: {
    aar: number;
    snittrunde: number | null;
    turneringerIgjen: number;
  };
  iDag: { id: string; tittel: string; klokke: string; omrade: string; sted: string | null }[];
  nesteTurneringer: { navn: string; datoLabel: string }[];
};

export async function lastSpillerOversikt(playerId: string): Promise<SpillerOversiktKort> {
  const naa = new Date();
  const idagStart = osloIdagStart();
  const idagSlutt = new Date(idagStart.getTime() + 24 * 60 * 60 * 1000);
  const ukeStart = mondayOf(idagStart);
  const ukeSlutt = new Date(ukeStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const aarStart = new Date(Date.UTC(naa.getFullYear(), 0, 1));

  const [player, medlemskap, okterIAar, tournamentEntriesSpilt, ukeOkter, tekniskPlan, rounderISesong, kommendeTurneringer, dagensOkter, aktivNaa] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: playerId },
        select: { name: true, hcp: true, homeClub: true },
      }),
      prisma.groupMember.findFirst({
        where: { userId: playerId, ...aktivtSpillerMedlemskapWhere() },
        orderBy: { joinedAt: "asc" },
        select: { joinedAt: true, group: { select: { name: true } } },
      }),
      prisma.trainingSessionV2.count({
        where: { studentId: playerId, status: "COMPLETED", startTime: { gte: aarStart } },
      }),
      prisma.tournamentEntry.count({
        where: { userId: playerId, entryStatus: "COMPLETED", createdAt: { gte: aarStart } },
      }),
      prisma.trainingSessionV2.findMany({
        where: { studentId: playerId, startTime: { gte: ukeStart, lt: ukeSlutt }, status: { not: "CANCELLED" } },
        select: { status: true, practiceType: true },
      }),
      prisma.technicalPlan.findFirst({
        where: { userId: playerId, status: "ACTIVE" },
        orderBy: { startDato: "desc" },
        select: {
          navn: true,
          positions: {
            orderBy: { sortOrder: "asc" },
            select: {
              navn: true,
              hovedfokus: true,
              tasks: { select: { status: true } },
            },
          },
        },
      }),
      prisma.round.findMany({
        where: { userId: playerId, roundType: "turnering", playedAt: { gte: aarStart } },
        select: { score: true },
      }),
      prisma.tournamentEntry.findMany({
        where: {
          userId: playerId,
          entryStatus: { in: ["PLANNED", "CLAIMED_REGISTERED", "CONFIRMED"] },
        },
        select: { manualName: true, manualDate: true, tournament: { select: { name: true, startDate: true } } },
        orderBy: { manualDate: "asc" },
        take: 20,
      }),
      prisma.trainingSessionV2.findMany({
        where: { studentId: playerId, startTime: { gte: idagStart, lt: idagSlutt }, status: { not: "CANCELLED" } },
        select: { id: true, title: true, startTime: true, practiceType: true, location: true },
        orderBy: { startTime: "asc" },
      }),
      prisma.trainingSessionV2.findFirst({
        where: {
          studentId: playerId,
          status: { in: ["IN_PROGRESS", "PLANNED"] },
          startTime: { lte: new Date(naa.getTime() + 6 * 60 * 60 * 1000) },
          endTime: { gte: naa },
        },
        orderBy: { startTime: "asc" },
        select: { title: true, startTime: true, endTime: true, location: true, status: true },
      }),
    ]);

  if (!player) {
    throw new Error("Spiller ikke funnet");
  }

  // Pyramide-fordeling for uka — andel fullført per område (kun blant økter
  // som faktisk ligger i uka, ikke en fabrikert 100%-fordeling). Samme
  // practiceType → pyramide-kobling som src/app/portal/actions.ts
  // (PRACTICE_TO_PYRAMID) — TrainingSessionV2.practiceType har ingen FYS-verdi,
  // så FYS vises aldri i dette kortet (ekte begrensning, ikke en bug her).
  const PRACTICE_TO_PYRAMID: Record<string, "TEK" | "SLAG" | "TURN" | "SPILL"> = {
    BLOKK: "TEK",
    RANDOM: "SLAG",
    KONKURRANSE: "TURN",
    SPILL_TEST: "SPILL",
  };
  const omradeTeller: Record<"TEK" | "SLAG" | "TURN" | "SPILL", { gjort: number; total: number }> = {
    TEK: { gjort: 0, total: 0 },
    SLAG: { gjort: 0, total: 0 },
    TURN: { gjort: 0, total: 0 },
    SPILL: { gjort: 0, total: 0 },
  };
  for (const s of ukeOkter) {
    const omrade = PRACTICE_TO_PYRAMID[s.practiceType];
    if (!omrade) continue;
    omradeTeller[omrade].total += 1;
    if (s.status === "COMPLETED") omradeTeller[omrade].gjort += 1;
  }
  const pyramide = (Object.keys(omradeTeller) as (keyof typeof omradeTeller)[])
    .filter((k) => omradeTeller[k].total > 0)
    .map((k) => ({ kode: k, pst: Math.round((omradeTeller[k].gjort / omradeTeller[k].total) * 100) }));

  const ukeGjennomfort = ukeOkter.filter((s) => s.status === "COMPLETED").length;
  const ukeTotal = ukeOkter.length;

  let tekniskPlanKort: SpillerOversiktKort["tekniskPlan"] = null;
  if (tekniskPlan) {
    const alleTasks = tekniskPlan.positions.flatMap((p) => p.tasks);
    const hovedfokus = tekniskPlan.positions.find((p) => p.hovedfokus) ?? tekniskPlan.positions[0] ?? null;
    tekniskPlanKort = {
      navn: tekniskPlan.navn,
      aktivPosisjon: hovedfokus?.navn ?? null,
      oppgaverGjort: alleTasks.filter((t) => t.status === "DONE").length,
      oppgaverTotalt: alleTasks.length,
    };
  }

  const sgRunder = await prisma.round.findMany({
    where: { userId: playerId, sgTotal: { not: null }, playedAt: { gte: new Date(naa.getTime() - 84 * 24 * 60 * 60 * 1000) } },
    select: { sgTotal: true },
    orderBy: { playedAt: "desc" },
    take: 12,
  });
  const sgSnitt = sgRunder.length > 0
    ? Math.round((sgRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / sgRunder.length) * 100) / 100
    : null;

  const snittrunde = rounderISesong.length > 0
    ? Math.round((rounderISesong.reduce((s, r) => s + r.score, 0) / rounderISesong.length) * 10) / 10
    : null;

  const kl = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: OSLO_TZ });

  return {
    identitet: {
      navn: player.name,
      gruppeLabel: medlemskap?.group.name ?? null,
      hjemmeklubb: player.homeClub,
      iStallenSiden: medlemskap ? NB_DATE.format(medlemskap.joinedAt) : null,
    },
    nokkeltall: {
      hcp: player.hcp,
      sgSnitt,
      okterIAar,
      turneringerSpilt: tournamentEntriesSpilt,
    },
    uke: ukeTotal > 0
      ? {
          prosent: Math.round((ukeGjennomfort / ukeTotal) * 100),
          gjennomfort: ukeGjennomfort,
          total: ukeTotal,
          pyramide,
        }
      : null,
    tekniskPlan: tekniskPlanKort,
    naa: aktivNaa
      ? {
          tittel: aktivNaa.title,
          tidspunktLabel: `${kl.format(aktivNaa.startTime)}–${kl.format(aktivNaa.endTime)}`,
          sted: aktivNaa.location,
        }
      : null,
    sesong: {
      aar: naa.getFullYear(),
      snittrunde,
      turneringerIgjen: kommendeTurneringer.filter(
        (t) => (t.tournament?.startDate ?? t.manualDate ?? new Date(0)) >= idagStart,
      ).length,
    },
    iDag: dagensOkter.map((s) => ({
      id: s.id,
      tittel: s.title,
      klokke: kl.format(s.startTime),
      omrade: PRACTICE_TO_PYRAMID[s.practiceType] ?? "TEK",
      sted: s.location,
    })),
    nesteTurneringer: kommendeTurneringer
      .filter((t) => (t.tournament?.startDate ?? t.manualDate ?? new Date(0)) >= idagStart)
      .slice(0, 3)
      .map((t) => ({
        navn: t.tournament?.name ?? t.manualName ?? "Turnering",
        datoLabel: NB_DATE.format(t.tournament?.startDate ?? t.manualDate ?? new Date()),
      })),
  };
}
