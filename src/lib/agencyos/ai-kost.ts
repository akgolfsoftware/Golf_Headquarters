// Kostlogging for AI-kall (AgenticOS-datamodellen, 2026-08-13).
//
// Kalles fra agenter/ruter etter et Anthropic-svar med `usage`-tall. Prisen
// slås opp i ai_models (seedet av scripts/seed-ai-models-2026-08-13.ts);
// ukjent modell logges med costUsd = null (pris ukjent — aldri fabrikkert).
// Logging skal ALDRI velte agenten: feil svelges og logges til konsoll.

import { prisma } from "@/lib/prisma";

export async function registrerAiKost(input: {
  agentName: string;
  agentRunId?: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  try {
    const modell = await prisma.aiModel.findUnique({ where: { modelId: input.modelId } });
    const costUsd =
      modell?.inputUsdPer1M != null && modell?.outputUsdPer1M != null
        ? (input.inputTokens * modell.inputUsdPer1M + input.outputTokens * modell.outputUsdPer1M) /
          1_000_000
        : null;

    await prisma.aiCost.create({
      data: {
        agentName: input.agentName,
        agentRunId: input.agentRunId ?? null,
        modelId: input.modelId,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        costUsd,
      },
    });
  } catch (err) {
    console.error("[ai-kost] klarte ikke logge kost:", err);
  }
}
