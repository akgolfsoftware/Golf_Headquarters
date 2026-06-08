// src/lib/meg/classify.ts
// Klassifiserer en fritekst-melding fra Anders til strukturert logg.
// Prøver lokal Ollama-modell først (gratis), faller tilbake til Claude.
import "server-only";
import { anthropic, MEG_MODEL_FAST } from "@/lib/ai/client";
import { ollamaChatJson } from "@/lib/meg/ollama";
import {
  ClassificationSchema,
  classificationToolSchema,
  type Classification,
} from "@/lib/meg/classify-schema";

const SYSTEM = `Du klassifiserer korte personlige logg-meldinger fra Anders.
Velg riktig 'kind', skriv et kort og tydelig 'summary' på norsk, og legg på relevante 'tags'.
Trekk ut tall (value_num + value_unit) når det finnes, f.eks. "sov 5 timer" -> 5 / "timer".
Ingen pjatt. Svar kun med strukturert JSON.`;

export type ClassifyEngine = "lokal" | "claude";
export type ClassifyResult = { engine: ClassifyEngine; data: Classification };

/** Lokal klassifisering via Ollama. Returnerer null hvis Ollama er av eller svaret er ugyldig. */
async function classifyViaOllama(text: string): Promise<Classification | null> {
  const raw = await ollamaChatJson(SYSTEM, text, classificationToolSchema);
  if (raw === null) return null;
  const parsed = ClassificationSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("[meg/classify] ugyldig Ollama-output", parsed.error.message);
    return null;
  }
  return parsed.data;
}

/** Claude-klassifisering via tool-use. Returnerer null hvis AI ikke er konfigurert eller svaret er ugyldig. */
async function classifyViaClaude(text: string): Promise<Classification | null> {
  if (!anthropic) return null;
  const res = await anthropic.messages.create({
    model: MEG_MODEL_FAST,
    max_tokens: 512,
    system: SYSTEM,
    tools: [{
      name: "lagre_klassifisering",
      description: "Lagre den strukturerte klassifiseringen av meldingen.",
      input_schema: classificationToolSchema,
    }],
    tool_choice: { type: "tool", name: "lagre_klassifisering" },
    messages: [{ role: "user", content: text }],
  });

  const toolBlock = res.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") return null;

  const parsed = ClassificationSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    console.warn("[meg/classify] ugyldig Claude-output", parsed.error.message);
    return null;
  }
  return parsed.data;
}

/**
 * Klassifiserer en fritekst-melding. Prøver lokal Ollama først (gratis token),
 * faller tilbake til Claude. Returnerer hvilken motor som svarte + dataen,
 * eller null hvis ingen er konfigurert / begge feiler.
 */
export async function classifyMessageWithEngine(text: string): Promise<ClassifyResult | null> {
  const local = await classifyViaOllama(text);
  if (local) return { engine: "lokal", data: local };
  const claude = await classifyViaClaude(text);
  if (claude) return { engine: "claude", data: claude };
  return null;
}

/** Klassifiserer en fritekst-melding. Returnerer null hvis ingen motor er konfigurert. */
export async function classifyMessage(text: string): Promise<Classification | null> {
  const res = await classifyMessageWithEngine(text);
  return res?.data ?? null;
}
