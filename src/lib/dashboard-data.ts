// Samlet data-fetch for /portal hjem-dashboard.
// Én funksjon for å unngå å duplisere queries på tvers av komponentene.

import { prisma } from "@/lib/prisma";
import type {
  User,
  TrainingPlanSession,
  Round,
  TestResult,
  TrackManSession,
  CourseDefinition,
  TestDefinition,
  ExerciseDefinition,
  SessionDrill,
  CoachingSession,
  PlanAction,
} from "@/generated/prisma/client";
import { sammeDag, startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import { aggregateByArea, type PyramideAggregat } from "@/lib/pyramide";
import { computeStreak } from "@/lib/streak";
import { aggregateSg, type SgAggregate } from "@/lib/sg";

type DrillMedDef = SessionDrill & { exercise: ExerciseDefinition };
type SesjonMedDrills = TrainingPlanSession & { drills: DrillMedDef[] };
type RundeMedBane = Round & { course: CourseDefinition };
type TestMedDef = TestResult & { test: TestDefinition };

export type SistRegistrert =
  | { type: "round"; dato: Date; tittel: string; detalj: string }
  | { type: "test"; dato: Date; tittel: string; detalj: string }
  | { type: "trackman"; dato: Date; tittel: string; detalj: string };

export type DashboardData = {
  dagensSesjon: SesjonMedDrills | null;
  ukenSesjoner: TrainingPlanSession[];
  pyramideUke: PyramideAggregat;
  pyramide14d: PyramideAggregat;
  streak14: boolean[];
  sgAggregate: SgAggregate;
  sisteRegistrerte: SistRegistrert[];
  sisteCoachMelding: { content: string; ts: Date; coachNavn: string } | null;
  pendingActions: PlanAction[];
};

export async function getDashboardData(user: User): Promise<DashboardData> {
  const idag = new Date();
  const ukestart = startOfWeek(idag);
  const ukeslutt = endOfWeek(idag);

  const fjorten = new Date(idag);
  fjorten.setDate(fjorten.getDate() - 14);

  const tretti = new Date(idag);
  tretti.setDate(tretti.getDate() - 30);

  const dagensStart = new Date(idag);
  dagensStart.setHours(0, 0, 0, 0);
  const dagensSlutt = new Date(dagensStart);
  dagensSlutt.setDate(dagensSlutt.getDate() + 1);

  // I stedet for å hente aktivePlanIds først (en separat query før de tre
  // session-queryene), bruker vi en sub-query (`plan: { userId, isActive }`)
  // direkte i hver session-where-clause. Sparer én round-trip og lar
  // Postgres bruke FK-indeksen.
  const aktivPlanFilter = { plan: { userId: user.id, isActive: true } };

  const [
    dagensKandidater,
    ukenSesjoner,
    sisteFjorten,
    runder,
    sisteRunder,
    sisteTester,
    sisteTrackman,
    sisteAiSesjon,
    pendingActions,
  ] = await Promise.all([
    prisma.trainingPlanSession.findMany({
      where: {
        ...aktivPlanFilter,
        scheduledAt: { gte: dagensStart, lt: dagensSlutt },
      },
      include: {
        drills: {
          include: { exercise: true },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { scheduledAt: "asc" },
    }) as Promise<SesjonMedDrills[]>,
    prisma.trainingPlanSession.findMany({
      where: {
        ...aktivPlanFilter,
        scheduledAt: { gte: ukestart, lt: ukeslutt },
      },
    }),
    prisma.trainingPlanSession.findMany({
      where: {
        ...aktivPlanFilter,
        scheduledAt: { gte: fjorten, lt: dagensSlutt },
      },
      select: {
        pyramidArea: true,
        durationMin: true,
        scheduledAt: true,
        status: true,
      },
    }),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: tretti } },
      orderBy: { playedAt: "desc" },
    }),
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 3,
      include: { course: true },
    }),
    prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "desc" },
      take: 3,
      include: { test: true },
    }),
    prisma.trackManSession.findMany({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
      take: 3,
    }),
    prisma.coachingSession.findFirst({
      where: { userId: user.id, kind: "AI" },
      orderBy: { updatedAt: "desc" },
      include: { coach: { select: { name: true } } },
    }),
    prisma.planAction.findMany({
      where: { userId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const dagensSesjon =
    (dagensKandidater as SesjonMedDrills[]).find(
      (s) => s.status === "PLANNED" || s.status === "ACTIVE"
    ) ??
    (dagensKandidater as SesjonMedDrills[])[0] ??
    null;

  const pyramideUke = aggregateByArea(
    ukenSesjoner.filter((s) => s.status === "COMPLETED" || s.status === "ACTIVE")
  );

  const pyramide14d = aggregateByArea(
    sisteFjorten.filter((s) => s.status === "COMPLETED" || s.status === "ACTIVE")
  );

  const fullforteDates = sisteFjorten
    .filter((s) => s.status === "COMPLETED")
    .map((s) => s.scheduledAt);
  const streak14 = computeStreak(fullforteDates, 14);

  const sgAggregate = aggregateSg(runder);

  // Bygg sist-registrert-feed
  const reg: SistRegistrert[] = [
    ...sisteRunder.map((r: RundeMedBane) => ({
      type: "round" as const,
      dato: r.playedAt,
      tittel: r.course.name,
      detalj: `Skår ${r.score}${r.sgTotal != null ? ` · SG ${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1)}` : ""}`,
    })),
    ...sisteTester.map((t: TestMedDef) => ({
      type: "test" as const,
      dato: t.takenAt,
      tittel: t.test.name,
      detalj: `Score ${t.score.toFixed(1).replace(".", ",")}`,
    })),
    ...sisteTrackman.map((tm: TrackManSession) => ({
      type: "trackman" as const,
      dato: tm.recordedAt,
      tittel: "TrackMan-økt",
      detalj: `${tm.shotCount} slag · ${tm.source}`,
    })),
  ]
    .sort((a, b) => b.dato.getTime() - a.dato.getTime())
    .slice(0, 5);

  // Hent siste assistant-melding fra AI-coach hvis det finnes
  let sisteCoachMelding: DashboardData["sisteCoachMelding"] = null;
  if (sisteAiSesjon && Array.isArray(sisteAiSesjon.messages)) {
    const meldinger = sisteAiSesjon.messages as Array<{
      role?: string;
      content?: string;
      ts?: string;
    }>;
    const sisteAssistent = [...meldinger].reverse().find(
      (m) => m.role === "assistant" && typeof m.content === "string"
    );
    if (sisteAssistent?.content) {
      sisteCoachMelding = {
        content: sisteAssistent.content,
        ts: sisteAiSesjon.updatedAt,
        coachNavn: (sisteAiSesjon as CoachingSession & { coach: { name: string } }).coach.name,
      };
    }
  }

  return {
    dagensSesjon,
    ukenSesjoner,
    pyramideUke,
    pyramide14d,
    streak14,
    sgAggregate,
    sisteRegistrerte: reg,
    sisteCoachMelding,
    pendingActions,
  };
}

// Hjelp: sjekk om dato er i dag
export function erIDag(date: Date): boolean {
  return sammeDag(date, new Date());
}
