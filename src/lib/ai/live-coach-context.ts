// Sentral kontekst-henter for AI Golf Coach under en AKTIV treningsøkt.
//
// All Prisma-henting for live-coach-prompten samles her — brukt av
// chat-API (live-coach-chat.ts) og kan gjenbrukes av live-coach-agent
// (Fase A) ved behov. Henter per kind (plan-session/session-v2) som
// hentOktInfo i live-coach-agent.ts, pluss spillerprofil + runder.

import "server-only";
import { prisma } from "@/lib/prisma";
import type { LiveCoachKontext, SystemPromptInput } from "@/lib/ai-plan/coach-prompt";
import type { LiveSessionKind } from "@/lib/agents/live-coach-agent";

type ActiveDrill = NonNullable<LiveCoachKontext["activeDrill"]>;

type OktKontekst = {
  title: string;
  coachBrief: string | null;
  activeDrill: ActiveDrill | null;
  drillsRemaining: number;
};

/** Henter tittel, coach-brief, aktiv drill og gjenstående driller for en TrainingPlanSession. */
async function hentPlanSessionOkt(
  sessionId: string,
  drillId: string | undefined,
): Promise<OktKontekst | null> {
  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      title: true,
      rationale: true,
      drills: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          lFase: true,
          csNivaa: true,
          pyramidArea: true,
          pPosisjoner: true,
          exercise: { select: { name: true } },
        },
      },
    },
  });
  if (!session) return null;

  const drills = session.drills;
  const valgtIndex = drillId ? drills.findIndex((d) => d.id === drillId) : 0;
  const valgt = valgtIndex >= 0 ? drills[valgtIndex] : (drills[0] ?? null);

  const activeDrill: ActiveDrill | null = valgt
    ? {
        name: valgt.exercise.name,
        lFase: valgt.lFase,
        csNivaa: valgt.csNivaa,
        pyramidArea: valgt.pyramidArea,
        pPosisjoner: valgt.pPosisjoner,
      }
    : null;

  return {
    title: session.title,
    coachBrief: session.rationale?.trim() ? session.rationale : null,
    activeDrill,
    drillsRemaining: Math.max(drills.length - Math.max(valgtIndex, 0), 0),
  };
}

/** Leser coachBrief.melding fra completedSummary — speiler live-coach-agent.ts. */
function lesCoachBrief(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const brief = (raw as Record<string, unknown>).coachBrief;
  if (!brief || typeof brief !== "object" || Array.isArray(brief)) return null;
  const melding = (brief as Record<string, unknown>).melding;
  return typeof melding === "string" && melding.trim() ? melding : null;
}

/** Henter tittel, coach-brief, aktiv drill og gjenstående driller for en TrainingSessionV2. */
async function hentSessionV2Okt(
  sessionId: string,
  drillId: string | undefined,
): Promise<OktKontekst | null> {
  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      title: true,
      notes: true,
      completedSummary: true,
      drills: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          lFase: true,
          csNivaa: true,
          pyramide: true,
          pPosisjoner: true,
        },
      },
    },
  });
  if (!session) return null;

  const drills = session.drills;
  const valgtIndex = drillId ? drills.findIndex((d) => d.id === drillId) : 0;
  const valgt = valgtIndex >= 0 ? drills[valgtIndex] : (drills[0] ?? null);

  const activeDrill: ActiveDrill | null = valgt
    ? {
        name: valgt.name,
        lFase: valgt.lFase,
        csNivaa: valgt.csNivaa,
        pyramidArea: valgt.pyramide,
        pPosisjoner: valgt.pPosisjoner,
      }
    : null;

  return {
    title: session.title,
    coachBrief: lesCoachBrief(session.completedSummary) ?? session.notes,
    activeDrill,
    drillsRemaining: Math.max(drills.length - Math.max(valgtIndex, 0), 0),
  };
}

/**
 * Henter full live-coach-kontekst (spillerprofil + økt-info) for en bruker.
 * Returnerer null hvis økta ikke finnes — kalleren avgjør 404-håndtering.
 */
export async function hentLiveCoachKontext(opts: {
  userId: string;
  sessionId: string;
  kind: LiveSessionKind;
  drillId?: string;
}): Promise<(LiveCoachKontext & SystemPromptInput) | null> {
  const { userId, sessionId, kind, drillId } = opts;

  const [okt, user, aktivePlaner, sisteRunder] = await Promise.all([
    kind === "plan-session"
      ? hentPlanSessionOkt(sessionId, drillId)
      : hentSessionV2Okt(sessionId, drillId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        hcp: true,
        ambition: true,
        homeClub: true,
        tier: true,
        playingYears: true,
      },
    }),
    prisma.trainingPlan.findMany({
      where: { userId, isActive: true },
      select: { name: true, startDate: true },
    }),
    prisma.round.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { playedAt: "desc" },
      take: 5,
    }),
  ]);

  if (!okt || !user) return null;

  return {
    mottaker: "spiller-live",
    spillerNavn: user.name,
    hcp: user.hcp,
    ambition: user.ambition,
    homeClub: user.homeClub,
    tier: user.tier,
    playingYears: user.playingYears,
    aktivePlaner: aktivePlaner.map((p) => ({
      navn: p.name,
      meta: `(siden ${p.startDate.toISOString().split("T")[0]})`,
    })),
    sisteRunder: sisteRunder.map((r) => ({
      dato: r.playedAt.toISOString().split("T")[0],
      bane: r.course.name,
      score: r.score,
      sgTotal: r.sgTotal,
    })),
    sessionKind: kind,
    sessionId,
    sessionTitle: okt.title,
    coachBrief: okt.coachBrief,
    activeDrill: okt.activeDrill,
    drillsRemaining: okt.drillsRemaining,
  };
}
