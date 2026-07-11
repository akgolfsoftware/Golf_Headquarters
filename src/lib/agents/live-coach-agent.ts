// live-coach-agent: kjøres når en spiller starter en live treningsøkt
// (plan-session eller session-v2). Finner/oppretter en økt-bundet
// CoachingSession (kind "LIVE") og sender en varm velkomstmelding fra
// AI Golf Coach — idempotent per økt (kjøres på nytt uten å duplisere).
//
// ALDRI Telegram her — kun in-app notify() (se agent-notify.ts-header for
// hvorfor Telegram normalt brukes; bevisst unntak for live-start).

import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "@/lib/ai/client";
import { notify } from "@/lib/notifications";
import { aggregateSg } from "@/lib/sg";
import { runAgent, type AgentResult } from "./agent-runner";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "live-coach-agent";

export type LiveSessionKind = "plan-session" | "session-v2";

const meldingRadSchema = z.object({
  role: z.enum(["user", "assistant", "coach", "system"]),
  content: z.string(),
  ts: z.string(),
});
type MeldingRad = z.infer<typeof meldingRadSchema>;

/** Leser messages-JSON-blobben trygt — ugyldige/korrupte rader filtreres bort i stedet for å telle som gyldige. */
function lesMeldinger(raw: Prisma.JsonValue | null | undefined): MeldingRad[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((rad) => {
    const parsed = meldingRadSchema.safeParse(rad);
    return parsed.success ? [parsed.data] : [];
  });
}

type OktInfo = {
  title: string;
  pyramidArea: string | null;
  drillNavn: string[];
  coachBrief: string | null;
  coachId: string | null;
};

/** Leser coachBrief.melding fra en JSON-blob (completedSummary/liveSnapshot), zod-fritt men trygt. */
function lesCoachBrief(raw: Prisma.JsonValue | null | undefined): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const brief = (raw as Record<string, unknown>).coachBrief;
  if (!brief || typeof brief !== "object" || Array.isArray(brief)) return null;
  const melding = (brief as Record<string, unknown>).melding;
  return typeof melding === "string" && melding.trim() ? melding : null;
}

/** Henter tittel, pyramideområde, drill-navn og evt. coach-brief for økta. */
async function hentOktInfo(
  sessionId: string,
  kind: LiveSessionKind,
): Promise<OktInfo | null> {
  if (kind === "plan-session") {
    const session = await prisma.trainingPlanSession.findUnique({
      where: { id: sessionId },
      select: {
        title: true,
        pyramidArea: true,
        rationale: true,
        plan: { select: { createdById: true } },
        drills: {
          orderBy: { orderIndex: "asc" },
          select: { exercise: { select: { name: true } } },
        },
      },
    });
    if (!session) return null;
    return {
      title: session.title,
      pyramidArea: session.pyramidArea,
      drillNavn: session.drills.map((d) => d.exercise.name),
      coachBrief: session.rationale?.trim() ? session.rationale : null,
      coachId: session.plan.createdById,
    };
  }

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      title: true,
      notes: true,
      completedSummary: true,
      coachId: true,
      drills: {
        orderBy: { sortOrder: "asc" },
        select: { name: true, pyramide: true },
      },
    },
  });
  if (!session) return null;
  return {
    title: session.title,
    pyramidArea: session.drills[0]?.pyramide ?? null,
    drillNavn: session.drills.map((d) => d.name),
    coachBrief: lesCoachBrief(session.completedSummary) ?? session.notes,
    coachId: session.coachId,
  };
}

/** Statisk fallback-velkomst når AI er avslått. */
function statiskVelkomst(oktInfo: OktInfo): string {
  const drillDel = oktInfo.drillNavn.length > 0 ? ` Vi kjører ${oktInfo.drillNavn[0]} først.` : "";
  return `Nå kjører vi «${oktInfo.title}».${drillDel} Si ifra underveis hvis noe føles rart, så tar vi det sammen.`;
}

/** Genererer en varm, kort velkomstmelding via Claude — faller tilbake til statisk tekst. */
async function genererVelkomst(
  spillerNavn: string,
  oktInfo: OktInfo,
  planNavn: string | null,
  sgSnitt: { total: number | null; rundeAntall: number },
): Promise<string> {
  if (!isAiEnabled() || !anthropic) {
    return statiskVelkomst(oktInfo);
  }

  const kontekstLinjer = [
    `Spiller: ${spillerNavn}`,
    `Dagens økt: ${oktInfo.title}`,
    oktInfo.pyramidArea ? `Pyramideområde: ${oktInfo.pyramidArea}` : null,
    oktInfo.drillNavn.length > 0 ? `Driller i økta: ${oktInfo.drillNavn.join(", ")}` : null,
    oktInfo.coachBrief ? `Coach-notat til denne økta: ${oktInfo.coachBrief}` : null,
    planNavn ? `Aktiv treningsplan: ${planNavn}` : null,
    sgSnitt.rundeAntall > 0 && sgSnitt.total != null
      ? `Strokes Gained totalt siste ${sgSnitt.rundeAntall} runder: ${sgSnitt.total.toFixed(2)}`
      : null,
  ]
    .filter((l): l is string => l != null)
    .join("\n");

  const system = `
Du er "AI Golf Coach" — Anders' AI-versjon som snakker TIL spilleren gjennom en live treningsøkt.

TONE:
- Varm, direkte, norsk bokmål med æ/ø/å
- Kort — maks 2-3 setninger
- Aldri utropstegn, aldri emoji, aldri "Bra jobba!"
- Referer dagens økt ved navn
- Avslutt med ETT konkret, godt spørsmål til spilleren om hva de vil ha hjelp med i økta
- Anbefaler, sperrer aldri trening
`.trim();

  try {
    const respons = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system,
      messages: [
        {
          role: "user",
          content: `Skriv en velkomstmelding til spilleren som akkurat startet denne økta.\n\n${kontekstLinjer}`,
        },
      ],
    });
    const tekst = respons.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
    return tekst || statiskVelkomst(oktInfo);
  } catch (err) {
    console.error("[live-coach-agent] Claude-kall feilet, bruker statisk fallback", err);
    return statiskVelkomst(oktInfo);
  }
}

export async function runLiveCoachAgent(opts: {
  userId: string;
  sessionId: string;
  kind: LiveSessionKind;
}): Promise<AgentResult> {
  const { userId, sessionId, kind } = opts;

  return runAgent(AGENT_NAME, userId, async () => {
    // Idempotens: finnes det allerede en LIVE-tråd for denne økta med en
    // assistant-melding, skip velkomst.
    const eksisterende = await prisma.coachingSession.findUnique({
      where: { userId_liveSessionId: { userId, liveSessionId: sessionId } },
    });
    if (eksisterende) {
      const meldinger = lesMeldinger(eksisterende.messages);
      const harVelkomst = meldinger.some((m) => m.role === "assistant");
      if (harVelkomst) {
        return {
          signalsWritten: 0,
          planActionsWritten: 0,
          output: { threadId: eksisterende.id, welcomeSent: false },
        };
      }
    }

    const oktInfo = await hentOktInfo(sessionId, kind);
    if (!oktInfo) {
      return {
        signalsWritten: 0,
        planActionsWritten: 0,
        output: { welcomeSent: false, reason: "okt-ikke-funnet" },
      };
    }

    const [spiller, aktivPlan, sisteRunder] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.trainingPlan.findFirst({
        where: { userId, isActive: true },
        select: { name: true },
      }),
      prisma.round.findMany({
        where: { userId },
        orderBy: { playedAt: "desc" },
        take: 3,
        select: {
          score: true,
          sgTotal: true,
          sgOtt: true,
          sgApp: true,
          sgArg: true,
          sgPutt: true,
        },
      }),
    ]);

    const sg = aggregateSg(sisteRunder);
    const spillerNavn = spiller?.name ?? "spilleren";

    const velkomst = await genererVelkomst(spillerNavn, oktInfo, aktivPlan?.name ?? null, {
      total: sg.total,
      rundeAntall: sg.rundeAntall,
    });

    const ts = new Date().toISOString();
    const nyMelding: MeldingRad = { role: "assistant", content: velkomst, ts };

    // Trenger en coachId for CoachingSession — første tilgjengelige COACH som
    // fallback (samme mønster som ai-chat/route.ts) hvis økta ikke har en.
    let coachId = oktInfo.coachId;
    if (!coachId) {
      const coach = await prisma.user.findFirst({
        where: { role: "COACH" },
        select: { id: true },
      });
      coachId = coach?.id ?? userId;
    }

    let thread;
    if (eksisterende) {
      const meldinger = lesMeldinger(eksisterende.messages);
      thread = await prisma.coachingSession.update({
        where: { id: eksisterende.id },
        data: {
          messages: [...meldinger, nyMelding] as unknown as Prisma.InputJsonValue,
        },
      });
    } else {
      thread = await prisma.coachingSession.create({
        data: {
          userId,
          coachId,
          kind: "LIVE",
          liveSessionId: sessionId,
          liveSessionKind: kind,
          messages: [nyMelding] as unknown as Prisma.InputJsonValue,
        },
      });
    }

    const liveUrl = `/portal/live/${sessionId}`;

    await notify({
      userId,
      type: "system",
      title: "AI Golf Coach er klar",
      body: `Klar til å hjelpe deg gjennom «${oktInfo.title}».`,
      link: liveUrl,
    });

    if (coachId && coachId !== userId) {
      await notify({
        userId: coachId,
        type: "system",
        title: `${spillerNavn} startet «${oktInfo.title}»`,
        body: "Live-økt er i gang.",
        link: liveUrl,
      });
    }

    return {
      signalsWritten: 0,
      planActionsWritten: 0,
      output: { threadId: thread.id, welcomeSent: true },
    };
  });
}
