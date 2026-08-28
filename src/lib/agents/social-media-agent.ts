/**
 * SoMe-agent — utkast til Instagram/Facebook fra nylige treninger.
 * Skriver PENDING PlanAction (SOCIAL_POST) i godkjenningskøen.
 * Publiserer aldri selv — Anders godkjenner i /admin/godkjenninger.
 */
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { anthropic, modelFor, AI_MAX_TOKENS, isAiEnabled, tekstFra } from "@/lib/ai/client";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";
import {
  byggDemoSoMePoster,
  parseSoMePoster,
  soMePlattformFeltSchema,
  type SoMePost,
  type SoMeTreningsrad,
} from "@/lib/domain/some-innhold";

export const AGENT_NAME = "social-media";

const SYSTEM_PROMPT = `
Du er SoMe-agent for AK Golf Academy.
Lag korte innlegg til Instagram og Facebook basert på nylige treninger.

Regler:
- Norsk bokmål. Ingen emoji. Ingen utropstegn. Ingen markedsføringsklisjéer.
- Ingen personnavn, ingen helse, ingen handicap.
- Instagram: maks 4 setninger. Facebook: maks 6 setninger.
- Konkret treningsgrep, ikke «ta golfen til neste nivå».

Returner KUN JSON på formen:
{"poster":[{"plattform":"instagram","tekst":"...","vinkel":"treningstips"},{"plattform":"facebook","tekst":"...","vinkel":"akademi"}]}
`.trim();

async function samleTrening(): Promise<SoMeTreningsrad[]> {
  const siden = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    const rader = await prisma.workbenchSession.findMany({
      where: {
        status: { in: ["COMPLETED", "PUBLISHED"] },
        date: { gte: siden },
      },
      orderBy: { date: "desc" },
      take: 12,
      select: { title: true, pyramid: true, date: true },
    });
    return rader.map((r) => ({
      tittel: r.title,
      pyramide: r.pyramid,
      dato: r.date.toISOString().slice(0, 10),
    }));
  } catch {
    return [];
  }
}

function userPrompt(okter: SoMeTreningsrad[]): string {
  if (okter.length === 0) {
    return "Ingen økter siste 7 dager. Lag to generelle, konkrete treningstips (Instagram + Facebook).";
  }
  const linjer = okter.map((o) => `- ${o.dato} · ${o.pyramide} · ${o.tittel}`);
  return `Nylige økter (kun tittel/pyramide, ingen navn):\n${linjer.join("\n")}\n\nLag ett Instagram- og ett Facebook-utkast.`;
}

async function genererPoster(okter: SoMeTreningsrad[]): Promise<SoMePost[]> {
  const demo = byggDemoSoMePoster(okter);
  if (!isAiEnabled() || !anthropic) return demo;

  const response = await anthropic.messages.create({
    model: modelFor(AGENT_NAME),
    max_tokens: AI_MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt(okter) }],
  });
  const parsed = parseSoMePoster(tekstFra(response));
  return parsed.length > 0 ? parsed : demo;
}

function pendingPlattform(suggestion: Prisma.JsonValue): string | null {
  const parsed = soMePlattformFeltSchema.safeParse(suggestion);
  return parsed.success ? parsed.data.plattform : null;
}

export async function runSocialMediaAgent(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN", deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!admin) {
      return { planActionsWritten: 0, output: { feil: "ingen-admin" } };
    }

    const okter = await samleTrening();
    const poster = await genererPoster(okter);

    const ventende = await prisma.planAction.findMany({
      where: {
        userId: admin.id,
        agentName: AGENT_NAME,
        status: "PENDING",
        actionType: "SOCIAL_POST",
      },
      select: { suggestion: true },
    });
    const opptatt = new Set(
      ventende.flatMap((r) => {
        const p = pendingPlattform(r.suggestion);
        return p ? [p] : [];
      }),
    );

    let planActionsWritten = 0;
    for (const post of poster) {
      if (opptatt.has(post.plattform)) continue;
      const suggestion = {
        tittel: `${post.plattform}: ${post.vinkel}`,
        plattform: post.plattform,
        tekst: post.tekst,
        vinkel: post.vinkel,
        forklaring: `Utkast til ${post.plattform}-innlegg. Publiseres ikke før du godkjenner.`,
      };
      const created = await prisma.planAction.create({
        data: {
          userId: admin.id,
          coachId: admin.id,
          actionType: "SOCIAL_POST",
          status: "PENDING",
          agentName: AGENT_NAME,
          suggestion,
        },
      });
      await varsleVedPlanAction({
        userId: admin.id,
        agentName: AGENT_NAME,
        actionType: "SOCIAL_POST",
        forklaring: suggestion.forklaring,
        planActionId: created.id,
      });
      opptatt.add(post.plattform);
      planActionsWritten++;
    }

    return {
      planActionsWritten,
      output: { poster: poster.length, skrevet: planActionsWritten, okter: okter.length },
    };
  });
}
