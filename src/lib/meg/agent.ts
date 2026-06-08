import "server-only";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { anthropic, MEG_MODEL_SMART, AI_MAX_TOKENS, isAiEnabled } from "@/lib/ai/client";
import { megExecutorsFor } from "@/lib/meg/tools";
import { toolsForRolle, type Rolle } from "@/lib/meg/access";
import { storeConversation } from "@/lib/meg/store";

const ADMIN_SYSTEM_PROMPT = `
Du er Meg — Anders Kristiansen sin personlige assistent. Kommuniser på norsk bokmål.
Vær kort og konkret. Ingen emoji. Ingen utropstegn. Aktiv stemme.

Du kan logge data, hente historikk, søke i minne, lese Notion, helse, Gmail og Google Disk via tools. Bruk dem aktivt.

Skrive-handlinger (opprette/fullføre Notion-oppgaver, sende e-post, opprette filer) utføres ALDRI direkte.
Når du kaller et slikt verktøy lages kun et forslag. Be alltid Anders svare
BEKREFT for å utføre, eller nei for å avbryte. Aldri påstå at noe er sendt eller
opprettet før han har bekreftet.

Anders er CEO i AK Golf Group AS. Han driver golfakademi, coaching og simulatorer.
Han er ikke programmerer — forklar alltid i hverdagsspråk.

Datoformat: DD.MM.YYYY. Tall: norsk desimalformat (komma, ikke punkt).
`.trim();

/** Bygger system-prompten for avsenderen. Coach får en arbeids-avgrenset assistent. */
function systemPromptFor(navn: string, rolle: Rolle): string {
  if (rolle === "admin") return ADMIN_SYSTEM_PROMPT;
  return `
Du er AK Golf Academy-assistenten. Du snakker med ${navn}, som er coach i AK Golf Academy.
Kommuniser på norsk bokmål. Vær kort og konkret. Ingen emoji. Ingen utropstegn. Aktiv stemme.

Du kan hjelpe ${navn} med arbeidsnotater: logge notater/oppgaver og hente fram egne tidligere notater.
Du har IKKE tilgang til andres data — verken e-post, kalender, helse eller private notater.
Hold deg til arbeid i AK Golf Academy.

Datoformat: DD.MM.YYYY. Tall: norsk desimalformat (komma, ikke punkt).
`.trim();
}

export type MegResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/**
 * Kjører ett bruker-svar gjennom Meg-agenten med tool-løkke.
 * history er de siste N (rolle, innhold)-par fra me_conversation (eldst først).
 */
export async function runMegAgent(opts: {
  text: string;
  history: { role: "user" | "assistant"; content: string }[];
  subject: string;
  navn: string;
  rolle: Rolle;
  maxIter?: number;
}): Promise<MegResult> {
  if (!isAiEnabled() || !anthropic) {
    return { ok: false, error: "AI ikke aktivert" };
  }

  const maxIter = opts.maxIter ?? 6;
  const systemPrompt = systemPromptFor(opts.navn, opts.rolle);
  const tools = toolsForRolle(opts.rolle);
  const exec = megExecutorsFor(opts.subject);

  const conversation: MessageParam[] = [
    ...opts.history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: opts.text },
  ];

  for (let i = 0; i < maxIter; i++) {
    const response = await anthropic.messages.create({
      model: MEG_MODEL_SMART,
      max_tokens: AI_MAX_TOKENS,
      system: systemPrompt,
      messages: conversation,
      tools,
    });

    if (response.stop_reason === "end_turn" || response.stop_reason === "stop_sequence") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim();
      await storeConversation("assistant", text, opts.subject);
      return { ok: true, text };
    }

    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter((b) => b.type === "tool_use");
      conversation.push({ role: "assistant", content: response.content });

      const toolResults = await Promise.all(
        toolUses.map(async (tu) => {
          if (tu.type !== "tool_use") return null;
          const fn = exec[tu.name];
          if (!fn) {
            return {
              type: "tool_result" as const,
              tool_use_id: tu.id,
              content: `Ukjent tool: ${tu.name}`,
              is_error: true,
            };
          }
          try {
            const output = await fn(tu.input);
            return { type: "tool_result" as const, tool_use_id: tu.id, content: output };
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return {
              type: "tool_result" as const,
              tool_use_id: tu.id,
              content: `Feil: ${msg}`,
              is_error: true,
            };
          }
        }),
      );

      const valid = toolResults.filter((r): r is NonNullable<typeof r> => r !== null);
      conversation.push({ role: "user", content: valid });
      continue;
    }

    // max_tokens eller annet — returner det vi har
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
    if (text) {
      await storeConversation("assistant", text, opts.subject);
      return { ok: true, text };
    }
  }

  return { ok: false, error: `Maks iterasjoner (${maxIter}) nådd` };
}
