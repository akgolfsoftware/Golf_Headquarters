/**
 * Tillatt datastruktur mot ekstern Caddie-modell.
 *
 * Verktøy- og databasesvar kan bare sende disse strengfeltene (etter
 * navne- og kontaktvask). Øvrig fritekst utelates. Brukerens egen
 * chat-melding er en separat kanal og går gjennom tekstvask, ikke denne listen.
 */
export const CADDIE_MODELL_STRENGFELT = new Set([
  "pyramidArea",
  "practiceType",
  "status",
  "axis",
  "lPhase",
  "club",
  "unit",
  "repType",
  "error",
  "userMessage",
  "toolName",
]);

export function erTillattCaddieModellStrengfelt(key: string): boolean {
  return CADDIE_MODELL_STRENGFELT.has(key);
}
