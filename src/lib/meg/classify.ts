// src/lib/meg/classify.ts
// Klassifiserer en fritekst-melding fra Anders via Claude tool-use.
// Bruker eksisterende anthropic-klient fra src/lib/ai/client.ts.
import "server-only";
import { anthropic, AI_MODEL } from "@/lib/ai/client";
import {
  ClassificationSchema,
  classificationToolSchema,
  type Classification,
} from "@/lib/meg/classify-schema";

const SYSTEM = `Du klassifiserer korte personlige logg-meldinger fra Anders.
Velg riktig 'kind', skriv et kort og tydelig 'summary' på norsk, og legg på relevante 'tags'.
Trekk ut tall (value_num + value_unit) når det finnes, f.eks. "sov 5 timer" -> 5 / "timer".
Ingen pjatt. Bruk alltid verktøyet 'lagre_klassifisering'.`;

/** Klassifiserer en fritekst-melding. Returnerer null hvis AI ikke er konfigurert eller svaret er ugyldig. */
export async function classifyMessage(text: string): Promise<Classification | null> {
  if (!anthropic) return null;

  const res = await anthropic.messages.create({
    model: AI_MODEL,
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
  return parsed.success ? parsed.data : null;
}
