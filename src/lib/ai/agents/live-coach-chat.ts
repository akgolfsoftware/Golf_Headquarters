// Agent: Live coach chat — AI Golf Coach som svarer spilleren under en
// AKTIV treningsøkt. Ikke-streamende variant (brukes av route-handleren i
// tillegg til en egen streaming-implementasjon for selve chat-svaret).
//
// Ingen tools i MVP — kun kontekst-injisert system-prompt (økt, drill,
// spillerprofil) + bruker-minne.

import "server-only";
import { anthropic, AI_MODEL, isAiEnabled } from "../client";
import { recallMemory, formatMemoryForPrompt } from "../memory";
import { hentLiveCoachKontext } from "../live-coach-context";
import { bygLiveCoachSystemPrompt, type SystemPromptInput } from "@/lib/ai-plan/coach-prompt";
import type { LiveSessionKind } from "@/lib/agents/live-coach-agent";

export type LiveCoachChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatLiveCoachResult =
  | { ok: true; assistantText: string }
  | { ok: false; error: string };

export type ChatLiveCoachOpts = {
  userId: string;
  sessionId: string;
  kind: LiveSessionKind;
  messages: LiveCoachChatMessage[];
  drillId?: string;
};

/**
 * Sender en samtale til AI Golf Coach under en aktiv live-økt og får svar
 * tilbake. Bygger system-prompt fra live-kontekst (økt, drill, spillerprofil)
 * pluss persistert bruker-minne.
 */
export async function chatLiveCoach(
  opts: ChatLiveCoachOpts,
): Promise<ChatLiveCoachResult> {
  if (!isAiEnabled() || !anthropic) {
    return { ok: false, error: "AI ikke aktivert (mangler ANTHROPIC_API_KEY)" };
  }

  const kontekst = await hentLiveCoachKontext({
    userId: opts.userId,
    sessionId: opts.sessionId,
    kind: opts.kind,
    drillId: opts.drillId,
  });
  if (!kontekst) {
    return { ok: false, error: "Fant ikke økta" };
  }

  const {
    mottaker,
    spillerNavn,
    hcp,
    ambition,
    homeClub,
    tier,
    playingYears,
    aktivePlaner,
    sisteRunder,
    sisteTester,
    ...live
  } = kontekst;
  const base: SystemPromptInput = {
    mottaker,
    spillerNavn,
    hcp,
    ambition,
    homeClub,
    tier,
    playingYears,
    aktivePlaner,
    sisteRunder,
    sisteTester,
  };

  let system = bygLiveCoachSystemPrompt(base, live);
  const memory = await recallMemory(opts.userId);
  system += formatMemoryForPrompt(memory);

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 512,
      system,
      messages: opts.messages,
    });
    const assistantText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();
    return { ok: true, assistantText };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
