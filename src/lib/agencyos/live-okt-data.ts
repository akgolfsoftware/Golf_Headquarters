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
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { AnalyseResultatSchema } from "@/lib/coaching-analysis";
import { wbScheduledAtISO } from "@/lib/portal-live/wb-live-map";
import { AkFormelLeseSchema } from "@/lib/domain/workbench/schemas";

export type LiveOktData = {
  id: string;
  /** "wb": WorkbenchSession. Melding, fokuspunkt og vurdering finnes bare for "v2" ennå. */
  kilde: "v2" | "wb";
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
  driller: {
    id: string;
    navn: string;
    varighetMin: number;
    pyramide: string;
    logget: boolean;
    /** Registrerte reps og spillerens kommentar (bare Workbench-økter). */
    reps?: number | null;
    kommentar?: string | null;
    videoer?: number;
  }[];
  /** Tidligere sendt fokuspunkt til spiller (completedSummary.coachBrief), tom streng hvis ingen. */
  coachBrief: string;
  /** Coachens post-økt-vurdering 1–5 (completedSummary.coachRating), null hvis ikke satt. */
  coachRating: number | null;
};

/**
 * Tilgang til en live-økt: head coach (ADMIN) ser alle; assistant coach (COACH)
 * bare økter han selv leder, eller der eleven er en av hans spillere.
 */
export async function kanSeLiveOkt(
  viewer: { id: string; role: string },
  sessionId: string,
): Promise<boolean> {
  const okt = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: { coachId: true, studentId: true },
  });
  if (!okt) {
    // Workbench-økt (live-økt krav 2, 09.10.2026): samme regel med playerId.
    const wb = await prisma.workbenchSession.findUnique({ where: { id: sessionId }, select: { coachId: true, playerId: true } });
    if (!wb) return false;
    if (viewer.role === "ADMIN") return true;
    if (viewer.role !== "COACH") return false;
    return wb.coachId === viewer.id || harCoachTilgangTilSpiller(viewer, wb.playerId);
  }
  if (viewer.role === "ADMIN") return true;
  if (viewer.role !== "COACH") return false;
  if (okt.coachId === viewer.id) return true;
  return okt.studentId != null && harCoachTilgangTilSpiller(viewer, okt.studentId);
}

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
  if (!okt) return lastWbLiveOktData(sessionId);

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
    kilde: "v2",
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

/** Workbench-økt: øvelser med reps, kommentar og videoer fra live-økta. */
async function lastWbLiveOktData(sessionId: string): Promise<LiveOktData | null> {
  const okt = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true, title: true, playerId: true, coachId: true, date: true, startMinute: true, durationMinutes: true,
      location: true, environment: true, practiceType: true, status: true, maalsetning: true,
      drills: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, durationMinutes: true, akFormel: true } },
      drillLogs: { select: { drillId: true, reps: true, kommentar: true } },
    },
  });
  if (!okt) return null;
  const [spiller, coach, opptak, videoer] = await Promise.all([
    prisma.user.findUnique({ where: { id: okt.playerId }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: okt.coachId }, select: { name: true } }),
    prisma.sessionRecording.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { status: true, durationSec: true, transcript: true, aiAnalysis: true },
    }),
    prisma.playerSwingVideo.groupBy({
      by: ["drillId"],
      where: { liveSessionId: sessionId, liveSessionKind: "workbench" },
      _count: { _all: true },
    }),
  ]);
  return {
    id: okt.id,
    kilde: "wb",
    tittel: okt.title,
    spillerNavn: spiller?.name ?? null,
    coachNavn: coach?.name ?? null,
    sted: okt.location,
    miljo: okt.environment ?? "—",
    type: okt.practiceType ?? "—",
    status: okt.status,
    startTime: wbScheduledAtISO(okt.date, okt.startMinute),
    varighetPlanlagtMin: okt.durationMinutes,
    malsetning: okt.maalsetning,
    opptak: opptak
      ? {
          status: opptak.status,
          durationSec: opptak.durationSec,
          transcript: opptak.transcript,
          coachAnalyse: AnalyseResultatSchema.safeParse(opptak.aiAnalysis).data?.coachAnalyse ?? null,
        }
      : null,
    driller: okt.drills.map((d) => {
      const logg = okt.drillLogs.find((l) => l.drillId === d.id);
      return {
        id: d.id,
        navn: d.title,
        varighetMin: d.durationMinutes,
        pyramide: AkFormelLeseSchema.safeParse(d.akFormel).data?.pyramid ?? "",
        logget: (logg?.reps ?? 0) > 0,
        reps: logg ? logg.reps : null,
        kommentar: logg?.kommentar ?? null,
        videoer: videoer.find((v) => v.drillId === d.id)?._count._all ?? 0,
      };
    }),
    coachBrief: "",
    coachRating: null,
  };
}
