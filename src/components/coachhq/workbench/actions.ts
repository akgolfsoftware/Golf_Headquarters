"use server";

// Server actions for Coach Workbench Caddie-chat.
//
// `sendCaddieMelding` tar imot hele meldingshistorien (klient-side state)
// og sender til Caddie-agenten med spillerId som kontekst. Returnerer
// AI-svar inkludert tool-bruk-logg.

import { chatCaddieMedSpiller } from "@/lib/ai/agents/caddie-with-spiller";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { isAiEnabled } from "@/lib/ai/client";
import { prisma } from "@/lib/prisma";
import type { ToolCallLog } from "@/lib/ai/agents/caddie";

export type SendCaddieMeldingInput = {
  spillerId: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};

export type SendCaddieMeldingResult =
  | {
      ok: true;
      assistantText: string;
      toolCalls: ToolCallLog[];
    }
  | {
      ok: false;
      error: string;
      // Demo-svar når AI ikke er konfigurert.
      demoAnswer?: string;
    };

export async function sendCaddieMelding(
  input: SendCaddieMeldingInput,
): Promise<SendCaddieMeldingResult> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Sjekk om AI er konfigurert. Fallback til demo-mode hvis ikke.
  if (!isAiEnabled()) {
    const demo = await buildDemoAnswer(
      input.spillerId,
      input.messages[input.messages.length - 1]?.content ?? "",
    );
    return {
      ok: false,
      error:
        "Caddie er ikke konfigurert. Sett ANTHROPIC_API_KEY i .env.local for å aktivere AI.",
      demoAnswer: demo,
    };
  }

  // Authz: en COACH kan kun chatte om spillere de faktisk har en aktiv
  // enrollering på (PlayerEnrollment med endedAt = null). ADMIN har full tilgang.
  if (coach.role !== "ADMIN") {
    const relasjon = await prisma.playerEnrollment.findFirst({
      where: { coachId: coach.id, userId: input.spillerId, endedAt: null },
      select: { id: true },
    });
    if (!relasjon) {
      return {
        ok: false,
        error: "Ingen tilgang — du er ikke koblet til denne spilleren.",
      };
    }
  }

  const result = await chatCaddieMedSpiller({
    messages: input.messages,
    spillerId: input.spillerId,
    coachId: coach.id,
  });

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
    };
  }

  return {
    ok: true,
    assistantText: result.assistantText,
    toolCalls: result.toolCalls,
  };
}

/**
 * Demo-svar når ANTHROPIC_API_KEY mangler. Returnerer hardkodet,
 * data-fundert respons basert på spiller-info i Prisma.
 */
async function buildDemoAnswer(
  spillerId: string,
  lastUserMessage: string,
): Promise<string> {
  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { name: true, hcp: true, homeClub: true },
  });

  if (!spiller) {
    return "Demo-modus: fant ikke spilleren i databasen.";
  }

  const navn = spiller.name ?? "spilleren";
  const hcp = spiller.hcp ?? "ukjent";

  const lc = lastUserMessage.toLowerCase();

  if (lc.includes("drill") || lc.includes("ovelse") || lc.includes("trening")) {
    return `Demo-svar (AI ikke konfigurert):\n\nFor ${navn} (HCP ${hcp}) ville Caddie typisk foreslå:\n- Gate-drill 50 cm for puttekontroll (3x10 min daglig)\n- Avstandskontroll 5-15 m\n- Statisk balansetrening for setup\n\nKonfigurer ANTHROPIC_API_KEY for ekte AI-anbefalinger basert på SG-data.`;
  }

  if (lc.includes("plan") || lc.includes("periode")) {
    return `Demo-svar (AI ikke konfigurert):\n\nCaddie kan lage en periodisert plan for ${navn} basert på Bompa-modellen og pyramide-vekting. Konfigurer ANTHROPIC_API_KEY for å aktivere plan-generering.`;
  }

  if (lc.includes("sg") || lc.includes("strokes")) {
    return `Demo-svar (AI ikke konfigurert):\n\nFor SG-analyse trenger Caddie tilgang til Anthropic API. Konfigurer ANTHROPIC_API_KEY for å se hvor ${navn} vinner og taper slag mot PGA-benchmark.`;
  }

  return `Demo-svar (AI ikke konfigurert):\n\nDu spurte om "${lastUserMessage.slice(0, 80)}" for ${navn}.\n\nFor ekte AI-svar: sett ANTHROPIC_API_KEY i .env.local og restart serveren.`;
}
