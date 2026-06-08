// src/lib/meg/router.ts
// Lett ruter foran den dyre Claude-agenten. Enkle logg-meldinger
// ("sov dårlig 5 timer") klassifiseres billig (lokal Ollama, ev. Haiku) og
// lagres direkte — sparer en full Sonnet-agentrunde. Alt som er spørsmål,
// handling eller komplekst returnerer null → route kjører Claude-agenten.
import "server-only";
import { classifyMessageWithEngine } from "@/lib/meg/classify";
import { storeLog } from "@/lib/meg/store";

// Passive datapunkter som trygt kan logges lokalt uten Claude-agent.
// task/person/goal utelates bevisst — de innebærer ofte handling (lag oppgave,
// følg opp person) og fortjener agenten.
const FAST_PATH_KINDS = new Set(["sleep", "training", "mood", "nutrition", "finance", "note"]);

const KIND_LABEL: Record<string, string> = {
  sleep: "søvn",
  training: "trening",
  mood: "humør",
  nutrition: "kosthold",
  finance: "økonomi",
  note: "notat",
};

// Ord som signaliserer spørsmål eller handling → må til Claude-agenten.
const COMPLEX_WORDS = [
  "hva", "hvordan", "hvorfor", "når", "hvor", "hvem", "hvilke", "hvilken",
  "kan du", "finn", "søk", "send", "lag", "opprett", "les", "sjekk",
  "oppsummer", "minn", "vis", "hjelp", "hent", "book", "endre", "slett",
];

/**
 * Grov heuristikk: ser meldingen ut som et enkelt datapunkt (ikke spørsmål/handling)?
 * Ren funksjon — testbar uten nettverk.
 */
export function looksSimple(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length === 0) return false;
  if (t.length > 140) return false; // lange meldinger er som regel komplekse
  if (t.includes("?")) return false;
  return !COMPLEX_WORDS.some((w) => t.startsWith(w + " ") || t.includes(" " + w + " "));
}

export type FastPathResult = { reply: string; engine: "lokal" | "claude" };

/**
 * Forsøker å håndtere meldingen lokalt (billig klassifisering + logg).
 * Returnerer et kort svar hvis håndtert, ellers null (→ kjør Claude-agenten).
 */
export async function tryLocalFastPath(opts: {
  text: string;
  subject: string;
}): Promise<FastPathResult | null> {
  if (!looksSimple(opts.text)) return null;

  const res = await classifyMessageWithEngine(opts.text);
  if (!res) return null;
  if (!FAST_PATH_KINDS.has(res.data.kind)) return null; // actionable → la agenten ta det

  const stored = await storeLog(opts.text, res.data, "telegram_text", opts.subject);
  if (!stored) return null; // DB nede → la agenten svare i stedet

  const label = KIND_LABEL[res.data.kind] ?? res.data.kind;
  return { reply: `Lagret (${label}): ${res.data.summary}`, engine: res.engine };
}
