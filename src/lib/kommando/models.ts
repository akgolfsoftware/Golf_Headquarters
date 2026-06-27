// Delte modell-definisjoner for AK Agency OS (Kommando). Trygg for klient —
// ingen server-only imports. Speiler de 4 agentene fra mockup-en.

export type KommandoModelId = "claude" | "gemini" | "grok" | "ollama";

export type KommandoModel = {
  id: KommandoModelId;
  label: string;
  role: string;
  provider: "anthropic" | "gemini" | "grok" | "ollama";
  /** Provider-spesifikk modell-id. */
  modelName: string;
};

export const KOMMANDO_MODELS: KommandoModel[] = [
  // Claude bruker den bekreftede Sonnet-id-en mot api.anthropic.com (jf. gotchas.md).
  { id: "claude", label: "Claude · Sonnet 4.6", role: "Kode & bygg", provider: "anthropic", modelName: "claude-sonnet-4-6" },
  { id: "gemini", label: "Gemini 2.5", role: "Research", provider: "gemini", modelName: "gemini-2.5-flash" },
  { id: "grok", label: "Grok", role: "Marked & nyheter", provider: "grok", modelName: "grok-2-latest" },
  { id: "ollama", label: "Ollama · lokal", role: "Privat / raskt", provider: "ollama", modelName: "llama3.1" },
];

export const DEFAULT_MODEL: KommandoModelId = "claude";

export function getKommandoModel(id: string): KommandoModel | undefined {
  return KOMMANDO_MODELS.find((m) => m.id === id);
}

export function isKommandoModelId(id: unknown): id is KommandoModelId {
  return typeof id === "string" && KOMMANDO_MODELS.some((m) => m.id === id);
}

// ── Agent-team (Etappe 3) ──
// Fast oppskrift: tre AI-er jobber sekvensielt på én oppgave. Output fra ett
// steg mates inn i neste. Modeller uten konfigurert nøkkel hoppes over.
export type KommandoTeamStep = { model: KommandoModelId; role: string; instruction: string };

export const KOMMANDO_TEAM: KommandoTeamStep[] = [
  {
    model: "grok",
    role: "Research",
    instruction:
      "Du er research-agent i et AI-team. Samle relevante fakta, markedsinnsikt og kontekst for oppgaven. Vær konkret og konsis — punktliste er greit. Svar på norsk.",
  },
  {
    model: "claude",
    role: "Utkast",
    instruction:
      "Du er hovedforfatter i et AI-team. Bruk research-en til å lage et konkret, godt strukturert utkast eller leveranse for oppgaven. Svar på norsk.",
  },
  {
    model: "gemini",
    role: "Gjennomgang",
    instruction:
      "Du er kvalitetssikrer i et AI-team. Gå gjennom utkastet, stram det opp, fyll hull og lever en forbedret endelig versjon. Svar på norsk.",
  },
];
