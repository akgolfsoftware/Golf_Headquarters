/**
 * Coachens per-økt live-visning — «UNDER-flata mens økta pågår», søsterflate
 * til FangstSheet. Paper-fasit: fase1/agencyos-live-session.html.
 *
 * Kilder: training_sessions_v2 · session_recordings · session_drills.
 * Ingen tall fabrikeres — mangler opptak/analyse/driller for økta, vises det
 * som ærlig tomt. Opptak knyttes til økta via /api/recording/start
 * ({ sessionId }), som startes fra «Start opptak» på denne flata.
 */

import { prisma } from "@/lib/prisma";
import { AnalyseResultatSchema } from "@/lib/coaching-analysis";

export type LiveOktData = {
  id: string;
  tittel: string;
  spillerNavn: string | null;
  coachNavn: string | null;
  sted: string | null;
  miljo: string;
  type: string;
  status: string;
  startTime: string;
  varighetPlanlagtMin: number;
  malsetning: string | null;
  opptak: {
    status: string;
    durationSec: number | null;
    transcript: string | null;
    /** Ferdig zod-validert på serveren — klientkomponenten skal aldri importere
     *  coaching-analysis (den drar med seg Anthropic SDK + fs inn i bundelen). */
    coachAnalyse: string | null;
  } | null;
  driller: { id: string; navn: string; varighetMin: number; pyramide: string; logget: boolean }[];
  /** Tidligere sendt fokuspunkt til spiller (completedSummary.coachBrief), tom streng hvis ingen. */
  coachBrief: string;
  /** Coachens post-økt-vurdering 1–5 (completedSummary.coachRating), null hvis ikke satt. */
  coachRating: number | null;
};

export async function lastLiveOktData(sessionId: string): Promise<LiveOktData | null> {
  const okt = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      title: true,
      studentId: true,
      coachId: true,
      startTime: true,
      endTime: true,
      location: true,
      miljo: true,
      practiceType: true,
      status: true,
      maalsetning: true,
      notes: true,
      completedSummary: true,
      drills: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, durationMinutes: true, pyramide: true },
      },
    },
  });
  if (!okt) return null;

  // studentId/coachId har ingen navngitt Prisma-relasjon på modellen —
  // slås opp separat, ikke via include.
  const [student, coach, opptak, logs] = await Promise.all([
    okt.studentId ? prisma.user.findUnique({ where: { id: okt.studentId }, select: { name: true } }) : null,
    prisma.user.findUnique({ where: { id: okt.coachId }, select: { name: true } }),
    prisma.sessionRecording.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { status: true, durationSec: true, transcript: true, aiAnalysis: true },
    }),
    prisma.drillLogV2.findMany({ where: { drill: { sessionId } }, select: { drillId: true } }),
  ]);
  const loggedDrillIds = new Set(logs.map((l) => l.drillId));

  // completedSummary er et JSON-objekt der spiller- og coach-felt lever side
  // om side (SessionSummaryShape + coachBrief/coachRating) — les forsiktig,
  // aldri `as unknown as`.
  const rawSummary: unknown = okt.completedSummary;
  const summaryObj =
    rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)
      ? (rawSummary as Record<string, unknown>)
      : {};
  const briefObj =
    summaryObj.coachBrief && typeof summaryObj.coachBrief === "object" && !Array.isArray(summaryObj.coachBrief)
      ? (summaryObj.coachBrief as Record<string, unknown>)
      : {};
  const coachBrief = typeof briefObj.melding === "string" ? briefObj.melding : "";
  const coachRating = typeof summaryObj.coachRating === "number" ? summaryObj.coachRating : null;

  const varighetMin = Math.round((okt.endTime.getTime() - okt.startTime.getTime()) / 60_000);

  return {
    id: okt.id,
    tittel: okt.title,
    spillerNavn: student?.name ?? null,
    coachNavn: coach?.name ?? null,
    sted: okt.location,
    miljo: okt.miljo,
    type: okt.practiceType,
    status: okt.status,
    startTime: okt.startTime.toISOString(),
    varighetPlanlagtMin: varighetMin,
    malsetning: okt.maalsetning,
    opptak: opptak
      ? {
          status: opptak.status,
          durationSec: opptak.durationSec,
          transcript: opptak.transcript,
          coachAnalyse: AnalyseResultatSchema.safeParse(opptak.aiAnalysis).data?.coachAnalyse ?? null,
        }
      : null,
    driller: okt.drills.map((d) => ({
      id: d.id,
      navn: d.name,
      varighetMin: d.durationMinutes,
      pyramide: d.pyramide,
      logget: loggedDrillIds.has(d.id),
    })),
    coachBrief,
    coachRating,
  };
}
