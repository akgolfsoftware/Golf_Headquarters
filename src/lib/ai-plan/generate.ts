// Generator-funksjon for AI-plan-forslag.
// Bruker Claude Sonnet 4.5 med tool_use for å tvinge JSON-output som matcher
// PLAN_FORSLAG_TOOL_SCHEMA. Logger hver generering til AiPlanGeneration
// med tokens og estimert kost.

import { anthropicKlient } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { AI_COACH_SYSTEM_PROMPT } from "./system-prompt";
import { byggSpillerKontekst, kontekstSomBrukerMelding } from "./context";
import {
  PLAN_FORSLAG_TOOL_SCHEMA,
  validerPlanForslag,
  type PlanForslag,
} from "./schema";

export const AI_PLAN_MODEL = "claude-sonnet-4-5-20250514";

// Sonnet 4.5: $3/M input tokens, $15/M output tokens.
const SONNET_INPUT_USD_PER_MTOK = 3;
const SONNET_OUTPUT_USD_PER_MTOK = 15;

function estimerKostUsd(tokensInput: number, tokensOutput: number): number {
  return (
    (tokensInput / 1_000_000) * SONNET_INPUT_USD_PER_MTOK +
    (tokensOutput / 1_000_000) * SONNET_OUTPUT_USD_PER_MTOK
  );
}

export type GenererPlanInput = {
  userId: string;
  coachId: string;
  brukerPrompt: string;
  iterationOf?: string;
  feedback?: string;
};

export type GenererPlanResultat = {
  forslag: PlanForslag;
  generationId: string;
};

export async function genererPlan(input: GenererPlanInput): Promise<GenererPlanResultat> {
  const { userId, coachId, brukerPrompt, iterationOf, feedback } = input;

  if (!brukerPrompt || brukerPrompt.trim().length < 5) {
    throw new Error("brukerPrompt må være minst 5 tegn.");
  }

  // 1) Hent kontekst og evt. forrige forslag
  const ctx = await byggSpillerKontekst(userId);
  let forrigeForslag: PlanForslag | undefined;
  if (iterationOf) {
    const forrige = await prisma.aiPlanGeneration.findUnique({
      where: { id: iterationOf },
      select: { responseJson: true },
    });
    if (forrige && forrige.responseJson) {
      const v = validerPlanForslag(forrige.responseJson);
      if (v.ok) forrigeForslag = v.data;
    }
  }

  const brukerMelding = kontekstSomBrukerMelding(
    ctx,
    brukerPrompt,
    feedback,
    forrigeForslag,
  );

  // 2) Kall Anthropic med tool_use for tvunget JSON
  const klient = anthropicKlient();
  const respons = await klient.messages.create({
    model: AI_PLAN_MODEL,
    max_tokens: 8192,
    system: AI_COACH_SYSTEM_PROMPT,
    tools: [
      {
        name: "lever_planforslag",
        description:
          "Lever et komplett, validert treningsplan-forslag som matcher schema.",
        input_schema: PLAN_FORSLAG_TOOL_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "lever_planforslag" },
    messages: [{ role: "user", content: brukerMelding }],
  });

  // 3) Plukk ut tool_use-blokken
  const toolBlock = respons.content.find(
    (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use",
  );
  if (!toolBlock) {
    throw new Error("AI returnerte ikke tool_use-blokk.");
  }

  const validering = validerPlanForslag(toolBlock.input);
  if (!validering.ok) {
    throw new Error(`Ugyldig AI-respons: ${validering.feil}`);
  }
  const forslag = validering.data;

  const tokensInput = respons.usage?.input_tokens ?? 0;
  const tokensOutput = respons.usage?.output_tokens ?? 0;
  const costUsd = estimerKostUsd(tokensInput, tokensOutput);

  // 4) Logg
  const generation = await prisma.aiPlanGeneration.create({
    data: {
      userId,
      coachId,
      prompt: brukerPrompt,
      systemPrompt: AI_COACH_SYSTEM_PROMPT,
      contextJson: ctx as object,
      responseJson: forslag as object,
      model: AI_PLAN_MODEL,
      tokensInput,
      tokensOutput,
      costUsd,
      iterationOf: iterationOf ?? null,
    },
    select: { id: true },
  });

  return { forslag, generationId: generation.id };
}
