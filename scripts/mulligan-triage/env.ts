/**
 * Miljøkonfigurasjon for Mulligan e-post-triage-scriptet. Defensivt: alt har
 * fornuftige defaults, scriptet krever ingen ny env-oppsett utover en
 * kjørende lokal Ollama + en eksisterende ADMIN Google-tilkobling
 * (samme som Meg-boten allerede bruker).
 */

export const MULLIGAN_OLLAMA_MODEL_DEFAULT = "qwen2.5:7b";
export const MULLIGAN_GMAIL_QUERY_DEFAULT = "is:unread newer_than:2d";

export type MulliganTriageEnv = {
  /** Ollama-serverens URL. Default matcher inbox-sortering.ts (samme lokale server). */
  ollamaUrl: string;
  /** Modellnavn — samme default som resten av Meg/inbox-pipelinen. */
  ollamaModel: string;
  /**
   * Gmail-søket som avgjør hvilke e-poster som vurderes denne kjøringen.
   * Anders bør snevre inn med et faktisk Mulligan-relevant søk (f.eks. et
   * label-filter) når innboks-strukturen er kjent — default er bevisst bredt.
   */
  gmailQuery: string;
};

export function lesMulliganTriageEnv(): MulliganTriageEnv {
  return {
    ollamaUrl: (process.env.MULLIGAN_OLLAMA_URL ?? "http://localhost:11434").replace(/\/$/, ""),
    ollamaModel: process.env.MULLIGAN_OLLAMA_MODEL ?? MULLIGAN_OLLAMA_MODEL_DEFAULT,
    gmailQuery: process.env.MULLIGAN_GMAIL_QUERY ?? MULLIGAN_GMAIL_QUERY_DEFAULT,
  };
}
