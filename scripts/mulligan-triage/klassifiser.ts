/**
 * Klassifiserer en innkommende Mulligan-e-post til booking/drift/generelt.
 *
 * PII-ARKITEKTURBESLUTNING (jf. .claude/rules/mulligan-drift.md,
 * "Begrensninger": kundedata er PII og skal behandles lokalt): dette
 * scriptet gjør INGEN sky-AI-kall i det hele tatt. Rå e-posttekst med
 * kundenavn/telefon/e-post går KUN til en lokal Ollama-modell på Mac
 * Mini-en — aldri til Anthropic API eller noen annen sky-tjeneste. Dette er
 * bevisst strengere enn inbox-sortering.ts (som har en opt-in Claude-
 * fallback via MEG_INBOX_TILLAT_SKY): Mulligan-kunders data har ingen
 * sky-fallback, punktum. Klarer ikke Ollama klassifiseringen, returneres
 * null og e-posten logges for manuell oppfølging — vi gjetter aldri.
 *
 * HTTP-mønsteret følger samme konvensjon som ollamaChatJson() i
 * src/lib/meg/ollama.ts / klassifiserMedOllama() i
 * scripts/meg-tilbakeskriving/inbox-sortering.ts (Ollama /api/chat med
 * `format`-JSON-schema, AbortController-timeout). Koden er IKKE importert
 * derfra: src/lib/meg/ollama.ts har `import "server-only"` og kan ikke
 * lastes av et rent tsx-script uten Next sin react-server-condition
 * (se .claude/rules/gotchas.md-stilen på dette — samme begrensning gjelder
 * her som for Google-tilkoblingen, se google-tilkobling.ts).
 */
import { lesMulliganTriageEnv } from "./env";

export type TriageKlasse = "booking" | "drift" | "generelt";

const TRIAGE_KLASSER = ["booking", "drift", "generelt"] as const;

const SYSTEM_PROMPT = `Du klassifiserer en innkommende e-post til Mulligan Indoor Golf (simulatorsenter, Fredrikstad) til ETT av tre kategorier:
- booking: kunden spør om å booke en simulatortime, ledig tid, eller vil endre/avbestille en eksisterende booking.
- drift: feilmelding eller driftsavvik — noe fungerer ikke eller trenger vedlikehold (projektor, sensor, matte, PC, dør, lys, internett, rengjøring).
- generelt: alt annet — generelle spørsmål, tilbakemeldinger, samarbeidsforespørsler, nyhetsbrev, spam.
Svar KUN med JSON: {"klasse": "<ett av: booking|drift|generelt>"}.`;

const klassifiserJsonSchema = {
  type: "object",
  properties: {
    klasse: { type: "string", enum: [...TRIAGE_KLASSER] },
  },
  required: ["klasse"],
} as const;

function parseKlasse(raa: unknown): TriageKlasse | null {
  if (!raa || typeof raa !== "object") return null;
  const obj = raa as { klasse?: unknown };
  if (typeof obj.klasse !== "string") return null;
  return (TRIAGE_KLASSER as readonly string[]).includes(obj.klasse)
    ? (obj.klasse as TriageKlasse)
    : null;
}

/**
 * Klassifiserer en e-post (emne + tekst) lokalt via Ollama.
 * Returnerer null ved feil/timeout/ikke-installert Ollama — ALDRI en gjettet
 * klasse. Kaller ALDRI en sky-AI (se filhode).
 */
export async function klassifiserEpost(emne: string, tekst: string): Promise<TriageKlasse | null> {
  const { ollamaUrl, ollamaModel } = lesMulliganTriageEnv();
  const kontroller = new AbortController();
  const timer = setTimeout(() => kontroller.abort(), 8000);
  try {
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: kontroller.signal,
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        format: klassifiserJsonSchema,
        options: { temperature: 0 },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Emne: ${emne}\n\n${tekst}`.slice(0, 4000) },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("[mulligan-triage/klassifiser] Ollama svarte ikke OK:", res.status);
      return null;
    }
    const json = (await res.json()) as { message?: { content?: string } };
    const innhold = json.message?.content;
    if (!innhold) return null;
    return parseKlasse(JSON.parse(innhold));
  } catch (err) {
    console.warn(
      "[mulligan-triage/klassifiser] Ollama utilgjengelig (behandles som uklassifisert):",
      err instanceof Error ? err.message : err,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
