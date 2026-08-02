// Modellvalg i AgenticOS — på OPPGAVE, ikke på agent-identitet.
//
// Erstatter mønsteret i src/lib/ai/client.ts (`modelFor(agentId)`), der valget
// fulgte hvem som spurte i stedet for hvor vanskelig spørsmålet var. En triviell
// forespørsel til en Opus-agent kostet Opus.
//
// Regelen: Opus kun der en feil koster mer enn modellen — alt som treffer flere
// uker av en plan. Haiku for klassifisering, oppsummering og formatering. Sonnet
// er standard. Lokal (Ollama) når PII om mindreårige må vaskes før sky-kall.
//
// Trygg for klient — ingen server-only imports. Modell-ID-er speiler
// src/lib/ai/client.ts; endres de ett sted, endre begge.

import type { Intent, Klassifisering, Tier } from "./typer";

export const MODELLER: Record<Tier, string> = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-6",
  opus: "claude-opus-4-8",
  lokal: "llama3.1",
};

// Oppgaver der en feil forplanter seg over uker med trening.
const OPUS_INTENTS: ReadonlySet<Intent> = new Set<Intent>(["plan"]);

// Oppgaver som er mekaniske nok til billigste tier.
const HAIKU_INTENTS: ReadonlySet<Intent> = new Set<Intent>(["drift"]);

export type ModellValg = {
  tier: Tier;
  modell: string;
  begrunnelse: string;
};

/**
 * Velg modell for en klassifisert oppgave.
 *
 * `krevLokal` tvinger lokal modell — brukes når prompten inneholder PII om en
 * mindreårig som ikke kan sendes til sky uten anonymisering.
 */
export function velgModell(
  k: Klassifisering,
  opts: { krevLokal?: boolean } = {},
): ModellValg {
  if (opts.krevLokal) {
    return {
      tier: "lokal",
      modell: MODELLER.lokal,
      begrunnelse: "PII om mindreårig — behandles lokalt, aldri i sky-prompt",
    };
  }

  if (OPUS_INTENTS.has(k.intent)) {
    return {
      tier: "opus",
      modell: MODELLER.opus,
      begrunnelse: "Planendringer treffer flere uker — en feil koster mer enn modellen",
    };
  }

  if (HAIKU_INTENTS.has(k.intent)) {
    return {
      tier: "haiku",
      modell: MODELLER.haiku,
      begrunnelse: "Driftsoppgave — mekanisk nok til billigste tier",
    };
  }

  return {
    tier: "sonnet",
    modell: MODELLER.sonnet,
    begrunnelse: "Standard: tolkning, forklaring og forslag",
  };
}

const ESKALERING: Partial<Record<Tier, Tier>> = {
  haiku: "sonnet",
  sonnet: "opus",
};

/**
 * Ett tier opp ved lav confidence i svaret. Maks én gang per interaksjon —
 * kalleren er ansvarlig for å ikke loope. Returnerer null når det ikke finnes
 * et høyere tier (opus, lokal).
 */
export function eskaler(fra: Tier): ModellValg | null {
  const neste = ESKALERING[fra];
  if (!neste) return null;
  return {
    tier: neste,
    modell: MODELLER[neste],
    begrunnelse: `Eskalert fra ${fra} etter lav confidence i svaret`,
  };
}
