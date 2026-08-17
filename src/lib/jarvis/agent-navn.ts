// Kanoniske AgentRun-navn for Jarvis' innsamlere — delt mellom de lokale
// scriptene (scripts/saker-innsamling/*.ts, kjører på Mac Mini via
// LaunchAgent) som SKRIVER radene og repository.ts (Vercel) som LESER dem
// for Maskinrommet-skjermen. Én kilde til navnene hindrer at skriver og
// leser sklir fra hverandre.
export const JARVIS_AGENT_NAVN = {
  gmail: "jarvis-gmail-innsamling",
  imessage: "jarvis-imessage-innsamling",
} as const;
