// Agent: Caddie — AI-assistent for Anders i AK Golf HQ.
//
// Henter spillerdata via tools, bruker pyramide/Bompa/SG-skills som
// kunnskaps-grunnlag, og svarer i Anders' tone (direkte, norsk bokmål,
// ingen emoji). Dette er foundation — full chat-loop med tool-routing
// implementeres her, men UI/route handlers bygges separat.
//
// Eksisterende `src/lib/caddie/` er den gamle Caddie-implementasjonen
// (med approval-executor). Denne fila er ny foundation under `src/lib/ai/`
// som kan migrere/erstatte den når Spor 5 lander UI.

import "server-only";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "../client";
import { ALL_SKILLS } from "../skills";
import { ALL_TOOLS, EXEC_BY_NAME } from "../tools";
import { recallMemory, formatMemoryForPrompt } from "../memory";

const SKILLS_BLOCK = ALL_SKILLS.map(
  (s) => `\n## ${s.name}\n${s.knowledge}`,
).join("\n");

export const CADDIE_SYSTEM_PROMPT = `
Du er Caddie, AI-assistent for golfcoachen Anders Kristiansen i AK Golf HQ.

Du har tilgang til alle spillerdata via tools. Bruk dem aktivt.

TONE:
- Profesjonell, direkte
- Norsk bokmål med æ/ø/å
- Aldri utropstegn
- Aldri "Bra jobba!" — bruk "Solid", "Sterkt"
- Aktiv stemme
- Ingen emoji

KUNNSKAP:
${SKILLS_BLOCK}

ARBEIDSFLYT:
1. Hent nødvendige data via tools
2. Analyser
3. Foreslå konkret handling med rasjonale

Når brukeren spør om spiller-data: bruk get_spiller, get_runder, get_sg_data, get_treningsplan.
Når brukeren spør om plan: bruk get_treningsplan + foreslå justeringer basert på pyramide-vekting.
Når brukeren spør om SG: bruk get_sg_data + sammenlign mot PGA-benchmark.
`.trim();

export type CaddieMessage = MessageParam;

export type ChatCaddieOpts = {
  messages: CaddieMessage[];
  userId?: string;
  // Maks antall tool-iterasjoner per kall (sikrer at vi ikke looper i evig
  // tool_use → tool_result → tool_use-syklus).
  maxToolIterations?: number;
  // Valgfri ekstra system-prompt som appendes etter standard CADDIE_SYSTEM_PROMPT.
  // Brukes til å injisere ekstra kontekst (eks. valgt spiller-ID i workbench).
  systemPrefix?: string;
};

export type ChatCaddieResult =
  | { ok: true; assistantText: string; toolCalls: ToolCallLog[] }
  | { ok: false; error: string };

export type ToolCallLog = {
  name: string;
  input: unknown;
  output: unknown;
};

/**
 * Bygger system-prompt med bruker-spesifikk minne-kontekst injisert.
 * Optional `extraPrefix` appendes på slutten (eks. valgt spiller-ID).
 */
async function bygSystemPrompt(
  userId?: string,
  extraPrefix?: string,
): Promise<string> {
  let prompt = CADDIE_SYSTEM_PROMPT;
  if (userId) {
    const memory = await recallMemory(userId);
    prompt += formatMemoryForPrompt(memory);
  }
  if (extraPrefix && extraPrefix.trim().length > 0) {
    prompt += "\n\n" + extraPrefix.trim();
  }
  return prompt;
}

/**
 * Hovedfunksjon: send en samtale til Caddie og få svar tilbake.
 *
 * Håndterer tool-use-loop: hvis modellen ber om et tool, kjør det og
 * gi resultatet tilbake i ny `messages.create`-runde. Maks
 * `maxToolIterations` runder før vi gir opp.
 */
export async function chatCaddie(
  opts: ChatCaddieOpts,
): Promise<ChatCaddieResult> {
  if (!isAiEnabled() || !anthropic) {
    return { ok: false, error: "AI ikke aktivert (mangler ANTHROPIC_API_KEY)" };
  }

  const systemPrompt = await bygSystemPrompt(opts.userId, opts.systemPrefix);
  const maxIter = opts.maxToolIterations ?? 5;
  const conversation: MessageParam[] = [...opts.messages];
  const toolCalls: ToolCallLog[] = [];

  for (let i = 0; i < maxIter; i++) {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system: systemPrompt,
      messages: conversation,
      tools: ALL_TOOLS,
    });

    // Hvis modellen er ferdig (ingen tool_use), returner tekst.
    if (response.stop_reason === "end_turn" || response.stop_reason === "stop_sequence") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim();
      return { ok: true, assistantText: text, toolCalls };
    }

    // tool_use: kjør alle tool-calls og legg til som tool_result.
    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter((b) => b.type === "tool_use");

      // Legg modellens svar (med tool_use-blokker) i conversation.
      conversation.push({ role: "assistant", content: response.content });

      // Kjør hvert tool og bygg tool_result-melding.
      const toolResults = await Promise.all(
        toolUses.map(async (tu) => {
          if (tu.type !== "tool_use") return null;
          const exec = EXEC_BY_NAME[tu.name];
          if (!exec) {
            return {
              type: "tool_result" as const,
              tool_use_id: tu.id,
              content: `Ukjent tool: ${tu.name}`,
              is_error: true,
            };
          }
          try {
            const output = await exec(tu.input);
            toolCalls.push({ name: tu.name, input: tu.input, output });
            return {
              type: "tool_result" as const,
              tool_use_id: tu.id,
              content: JSON.stringify(output),
            };
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            toolCalls.push({
              name: tu.name,
              input: tu.input,
              output: { error: msg },
            });
            return {
              type: "tool_result" as const,
              tool_use_id: tu.id,
              content: `Feil under tool-kjøring: ${msg}`,
              is_error: true,
            };
          }
        }),
      );

      const validResults = toolResults.filter(
        (r): r is NonNullable<typeof r> => r !== null,
      );
      conversation.push({ role: "user", content: validResults });
      continue;
    }

    // Annet stop_reason (max_tokens, refusal, etc.) — returner det vi har.
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
    return { ok: true, assistantText: text, toolCalls };
  }

  return {
    ok: false,
    error: `Max tool-iterasjoner (${maxIter}) nådd uten ferdig svar`,
  };
}
