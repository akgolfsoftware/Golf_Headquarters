/**
 * «Venter på deg» — ADHD-dashbordet i dagens notat.
 * Skriver/erstatter en seksjon med MAKS 3 prioriterte aksjonspunkter i
 * $AK_BRAIN_PATH/YYYY-MM-DD.md, basert på dagens destillat + uavklarte
 * inbox-noter. Dagens fil skal si hva som gjelder — hukommelsen skal aldri
 * måtte lete. Seksjonen erstattes ved hver kjøring (alltid fersk).
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const SEKSJON_HEADER = "## Venter på deg";

const SYSTEM = `Du velger de VIKTIGSTE aksjonspunktene for Anders Kristiansen i morgen tidlig.
Input: dagens destillerte notat + eventuelle usorterte inbox-noter.
Regler (ADHD-tilpasset — brytes aldri):
- MAKS 3 punkter. Færre er bedre enn flere. Null punkter er lov hvis ingenting haster.
- Hvert punkt er ÉN konkret handling Anders kan gjøre NÅ (verb først), ikke en kategori.
- Norsk bokmål. Ingen fyllord, ingen ros, ingen «husk at».
- Uavklarte inbox-noter nevnes som ETT samlepunkt hvis de finnes («Avklar N noter i inbox»).`;

const toolSchema = {
  type: "object",
  properties: {
    punkter: {
      type: "array",
      maxItems: 3,
      items: { type: "string", description: "Én konkret handling, verb først" },
    },
  },
  required: ["punkter"],
} as const;

/** Erstatter (eller legger til) «## Venter på deg»-seksjonen i et dagsnotat. Ren funksjon (testbar). */
export function byttUtVenterSeksjon(eksisterende: string, punkter: string[]): string {
  const seksjon =
    punkter.length > 0
      ? `${SEKSJON_HEADER}\n\n${punkter.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n`
      : `${SEKSJON_HEADER}\n\nIngenting haster. God morgen.\n`;

  const start = eksisterende.indexOf(SEKSJON_HEADER);
  if (start === -1) {
    const base = eksisterende.trim() ? eksisterende.trimEnd() : "";
    return `${base}\n\n${seksjon}`;
  }
  // Erstatt fra header til neste «## »-overskrift (eller til slutten av filen).
  const etterHeader = start + SEKSJON_HEADER.length;
  const nesteSeksjon = eksisterende.indexOf("\n## ", etterHeader);
  const foer = eksisterende.slice(0, start);
  const etter = nesteSeksjon === -1 ? "" : eksisterende.slice(nesteSeksjon + 1);
  return `${foer}${seksjon}${etter ? `\n${etter}` : ""}`;
}

/**
 * Genererer maks 3 aksjonspunkter via Claude og skriver dem inn i dagens notat.
 * Hopper stille over hvis ANTHROPIC_API_KEY mangler — aldri en hard avhengighet.
 */
export async function skrivVenterPaaDeg(
  dato: string,
  akBrainPath: string,
  kontekst: { dagsnotat: string | null; uavklartInbox: string[] },
): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("[venter] ANTHROPIC_API_KEY mangler — hopper over.");
    return;
  }

  const deler: string[] = [];
  if (kontekst.dagsnotat) deler.push(`Dagens destillat:\n${kontekst.dagsnotat}`);
  if (kontekst.uavklartInbox.length > 0) {
    deler.push(`Usorterte inbox-noter (${kontekst.uavklartInbox.length}): ${kontekst.uavklartInbox.join(", ")}`);
  }
  if (deler.length === 0) {
    console.log("[venter] Ingen kontekst i dag — hopper over.");
    return;
  }

  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: process.env.MEG_MODEL_SMART ?? "claude-sonnet-4-6",
    max_tokens: 512,
    system: SYSTEM,
    tools: [
      {
        name: "sett_venter_punkter",
        description: "Lagre maks 3 prioriterte aksjonspunkter",
        input_schema: toolSchema as unknown as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: "sett_venter_punkter" },
    messages: [{ role: "user", content: deler.join("\n\n") }],
  });

  const blokk = res.content.find((b) => b.type === "tool_use");
  if (!blokk || blokk.type !== "tool_use") {
    console.warn("[venter] Claude returnerte ikke tool-use — hopper over.");
    return;
  }
  const input = blokk.input as { punkter?: unknown };
  const punkter = Array.isArray(input.punkter)
    ? input.punkter.filter((p): p is string => typeof p === "string").slice(0, 3)
    : [];

  const filsti = path.join(akBrainPath, `${dato}.md`);
  let eksisterende = "";
  try {
    eksisterende = await readFile(filsti, "utf-8");
  } catch {
    eksisterende = `# ${dato}`;
  }
  await writeFile(filsti, byttUtVenterSeksjon(eksisterende, punkter), "utf-8");
  console.log(`[venter] ${dato}: ${punkter.length} punkter skrevet → ${filsti}`);
}
