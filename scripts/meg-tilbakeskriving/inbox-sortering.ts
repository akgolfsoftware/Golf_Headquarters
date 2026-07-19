/**
 * Inbox-sortering — tømmer ~/ak-brain/inbox/ og klassifiserer hver note til
 * riktig domene-MOC. Zero-friction-prinsippet: Anders dumper rådata i inbox,
 * maskinen sorterer. Klassifisering skjer LOKALT via Ollama (kostnads- og
 * personvernstyring: inbox-notater kan inneholde PII og skal ikke til sky).
 * Claude-fallback er OPT-IN via MEG_INBOX_TILLAT_SKY=1. Klarer ingen av dem
 * det, blir nota liggende i inbox og rapporteres som uavklart — vi gjetter aldri.
 */

import Anthropic from "@anthropic-ai/sdk";
import { mkdir, readFile, readdir, rename, writeFile } from "fs/promises";
import path from "path";

export const DOMENER = ["Mulligan", "WANG", "GFGK", "Admin", "Software"] as const;
export type Domene = (typeof DOMENER)[number];

export type InboxRapport = {
  sortert: Array<{ fil: string; domene: Domene }>;
  uavklart: string[];
  feil: Array<{ fil: string; melding: string }>;
};

const KLASSIFISER_SYSTEM = `Du klassifiserer en kort notat-tekst fra Anders Kristiansen til ETT av fem domener:
- Mulligan: Mulligan Indoor Golf — simulatorer, drift, vedlikehold, kunde-e-post/SMS for senteret.
- WANG: WANG Toppidrett Fredrikstad — sportssjef, samlinger, foreldremøter, elevvurderinger, skole.
- GFGK: Gamle Fredrikstad Golfklubb — juniorer, sportslig plan, ballplukking, klubbaktivitet.
- Admin: AK Golf Group som selskap — økonomi, Tripletex, lønn, budsjett, fakturaer, avtaler.
- Software: programvare — Golf HQ / PlayerHQ / AgencyOS, WANG-plattform, Fredrikstad Total, kode, design.
Svar KUN med JSON: {"domene": "<ett av: Mulligan|WANG|GFGK|Admin|Software>", "sikker": true|false}.
Sett "sikker": false hvis teksten like gjerne kan tilhøre flere domener eller er for vag.`;

const klassifiserJsonSchema = {
  type: "object",
  properties: {
    domene: { type: "string", enum: [...DOMENER] },
    sikker: { type: "boolean" },
  },
  required: ["domene", "sikker"],
} as const;

function parseKlassifisering(raa: unknown): { domene: Domene; sikker: boolean } | null {
  if (!raa || typeof raa !== "object") return null;
  const obj = raa as { domene?: unknown; sikker?: unknown };
  if (typeof obj.domene !== "string" || !DOMENER.includes(obj.domene as Domene)) return null;
  return { domene: obj.domene as Domene, sikker: obj.sikker === true };
}

/** Lokal klassifisering via Ollama. null ved feil/timeout/ikke installert — aldri hard avhengighet. */
async function klassifiserMedOllama(tekst: string): Promise<{ domene: Domene; sikker: boolean } | null> {
  const baseUrl = process.env.MEG_OLLAMA_URL ?? "http://localhost:11434";
  const modell = process.env.MEG_OLLAMA_MODEL ?? "qwen2.5:7b";
  const kontroller = new AbortController();
  const timer = setTimeout(() => kontroller.abort(), 8000);
  try {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: kontroller.signal,
      body: JSON.stringify({
        model: modell,
        stream: false,
        format: klassifiserJsonSchema,
        messages: [
          { role: "system", content: KLASSIFISER_SYSTEM },
          { role: "user", content: tekst.slice(0, 4000) },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { message?: { content?: string } };
    const innhold = json.message?.content;
    if (!innhold) return null;
    return parseKlassifisering(JSON.parse(innhold));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Claude-fallback når Ollama er nede/usikker. null hvis API-nøkkel mangler eller kallet feiler. */
async function klassifiserMedClaude(tekst: string): Promise<{ domene: Domene; sikker: boolean } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: process.env.MEG_MODEL_RASK ?? "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: KLASSIFISER_SYSTEM,
      tools: [
        {
          name: "klassifiser",
          description: "Lagre domene-klassifisering av notatet",
          input_schema: klassifiserJsonSchema as unknown as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: "klassifiser" },
      messages: [{ role: "user", content: tekst.slice(0, 4000) }],
    });
    const blokk = res.content.find((b) => b.type === "tool_use");
    if (!blokk || blokk.type !== "tool_use") return null;
    return parseKlassifisering(blokk.input);
  } catch {
    return null;
  }
}

/** Legger en lenke til den sorterte nota under «## Innkommende» i domene-MOC-en. Idempotent per fil. */
async function oppdaterMoc(akBrainPath: string, domene: Domene, filnavn: string): Promise<void> {
  const mocSti = path.join(akBrainPath, `MOC-${domene}.md`);
  const lenke = `- [[${domene}/Innkommende/${filnavn.replace(/\.md$/, "")}]]`;
  let innhold = "";
  try {
    innhold = await readFile(mocSti, "utf-8");
  } catch {
    innhold = `# MOC — ${domene}\n\n## Innkommende\n`;
  }
  if (innhold.includes(lenke)) return;
  if (innhold.includes("## Innkommende")) {
    innhold = innhold.replace("## Innkommende", `## Innkommende\n${lenke}`);
  } else {
    innhold = `${innhold.trimEnd()}\n\n## Innkommende\n${lenke}\n`;
  }
  await writeFile(mocSti, innhold, "utf-8");
}

/**
 * Tømmer inbox: klassifiserer hver .md-fil og flytter den til
 * <domene>/Innkommende/ + lenker den opp i MOC-en. Usikre noter blir liggende.
 * Mangler inbox-mappen helt, returneres tom rapport uten feil.
 */
export async function sorterInbox(akBrainPath: string): Promise<InboxRapport> {
  const inboxSti = path.join(akBrainPath, "inbox");
  const rapport: InboxRapport = { sortert: [], uavklart: [], feil: [] };

  let filer: string[];
  try {
    filer = (await readdir(inboxSti)).filter((f) => f.endsWith(".md"));
  } catch {
    console.log("[inbox] Ingen inbox-mappe funnet — hopper over sortering.");
    return rapport;
  }

  for (const fil of filer) {
    try {
      const tekst = await readFile(path.join(inboxSti, fil), "utf-8");
      let svar = await klassifiserMedOllama(tekst);
      // Sky-fallback kun med eksplisitt samtykke (PII + kostnad).
      if (!svar && process.env.MEG_INBOX_TILLAT_SKY === "1") {
        svar = await klassifiserMedClaude(tekst);
      }

      if (!svar || !svar.sikker) {
        rapport.uavklart.push(fil);
        continue;
      }

      const maalMappe = path.join(akBrainPath, svar.domene, "Innkommende");
      await mkdir(maalMappe, { recursive: true });
      await rename(path.join(inboxSti, fil), path.join(maalMappe, fil));
      await oppdaterMoc(akBrainPath, svar.domene, fil);
      rapport.sortert.push({ fil, domene: svar.domene });
      console.log(`[inbox] ${fil} → ${svar.domene}/Innkommende/`);
    } catch (err) {
      rapport.feil.push({ fil, melding: err instanceof Error ? err.message : String(err) });
    }
  }

  if (rapport.uavklart.length > 0) {
    console.log(`[inbox] ${rapport.uavklart.length} uavklarte noter ligger igjen i inbox.`);
  }
  return rapport;
}
