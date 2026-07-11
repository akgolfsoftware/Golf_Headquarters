// Generator-funksjon for AI-plan-forslag.
// Bruker Claude Sonnet 4.5 med tool_use for å tvinge JSON-output som matcher
// PLAN_FORSLAG_TOOL_SCHEMA. Logger hver generering til AiPlanGeneration
// med tokens og estimert kost.
//
// Henter en PlanTemplate (baseline) basert på spillerens (kategori, lPhase)
// og lar AI-en bruke den som utgangspunkt. Når en template ble brukt,
// lagres templateId i AiPlanGeneration så vi senere kan korrelere med
// PlanEffectiveness.

import { anthropicKlient } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { AI_COACH_SYSTEM_PROMPT } from "./system-prompt";
import {
  byggSpillerKontekst,
  hentTemplate,
  type PlanTemplateData,
} from "./context";
import { byggBrukerMeldingMedMal } from "./coach-prompt";
import {
  PLAN_FORSLAG_TOOL_SCHEMA,
  validerPlanForslag,
  type PlanForslag,
} from "./schema";
import { selectKnowledgeFiles } from "@/lib/ai-coach/rag-select";
import { formatFewShotBlock, loadFewShotExamples } from "@/lib/ai-coach/few-shot";
import type { SpillerKontekst } from "./context";

const SG_KIND_TO_AREA: Record<string, string> = {
  SG_OTT: "OTT",
  SG_APP: "APP",
  SG_ARG: "ARG",
  SG_PUTT: "PUTT",
};

function deriveSgArea(ctx: SpillerKontekst): string | undefined {
  let worst: { kind: string; value: number } | null = null;
  for (const s of ctx.signaler) {
    const area = SG_KIND_TO_AREA[s.kind];
    if (!area || s.value == null) continue;
    if (!worst || s.value < worst.value) {
      worst = { kind: s.kind, value: s.value };
    }
  }
  return worst ? SG_KIND_TO_AREA[worst.kind] : undefined;
}

function byggSystemPromptMedKunnskap(ctx: SpillerKontekst): string {
  const sgArea = deriveSgArea(ctx);
  const chunks = selectKnowledgeFiles({ sgArea });
  const fewShot = formatFewShotBlock(
    loadFewShotExamples("live-coach-dialog.jsonl", 2),
  );
  const kunnskap =
    chunks.length > 0
      ? `\n\n<kunnskap>\n${chunks.join("\n\n")}\n</kunnskap>`
      : "";
  return `${AI_COACH_SYSTEM_PROMPT}${kunnskap}${fewShot}`;
}

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
  /** ID på baseline-mal som ble brukt, eller null hvis ingen ble matchet. */
  templateId: string | null;
};

export async function genererPlan(
  input: GenererPlanInput,
): Promise<GenererPlanResultat> {
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

  // 2) Forsøk å matche en PlanTemplate. Fallback til null hvis spilleren
  //    mangler kategori eller aktiv L-fase.
  let template: PlanTemplateData | null = null;
  if (ctx.spiller.ngfKategori && ctx.aktivLPhase) {
    template = await hentTemplate(
      ctx.spiller.ngfKategori,
      ctx.aktivLPhase,
    );
  }

  const brukerMelding = byggBrukerMeldingMedMal(
    ctx,
    brukerPrompt,
    template,
    feedback,
    forrigeForslag,
  );

  const systemPrompt = byggSystemPromptMedKunnskap(ctx);

  // 3) Kall Anthropic med tool_use for tvunget JSON
  const klient = anthropicKlient();
  const respons = await klient.messages.create({
    model: AI_PLAN_MODEL,
    max_tokens: 8192,
    system: systemPrompt,
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

  // 4) Plukk ut tool_use-blokken
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

  // 5) Logg generering. templateId persistes i contextJson så vi senere kan
  //    rekonstruere hvilken baseline-mal som ble brukt.
  const generation = await prisma.aiPlanGeneration.create({
    data: {
      userId,
      coachId,
      prompt: brukerPrompt,
      systemPrompt,
      contextJson: { ...ctx, _templateId: template?.templateId ?? null } as object,
      responseJson: forslag as object,
      model: AI_PLAN_MODEL,
      tokensInput,
      tokensOutput,
      costUsd,
      iterationOf: iterationOf ?? null,
    },
    select: { id: true },
  });

  // 6) Inkrementer usageCount på malen så vi vet hvor ofte den brukes.
  if (template) {
    await prisma.planTemplate.update({
      where: { id: template.templateId },
      data: { usageCount: { increment: 1 } },
    });
  }

  return {
    forslag,
    generationId: generation.id,
    templateId: template?.templateId ?? null,
  };
}
