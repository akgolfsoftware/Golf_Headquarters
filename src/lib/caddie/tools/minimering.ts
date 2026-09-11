/**
 * R-A/R-B (2026-09-11): dataminimering FØR utgående AI-kall for Caddie.
 *
 * Alle andre AI-inngangene i repoet (daily-brief, coach-ai-chat, sg-tolkning,
 * live-coach-agent) bytter ekte spillernavn med et pseudonym FØR teksten går
 * til Anthropic (se `src/lib/ai/anonymiser.ts`). Caddie-verktøyene
 * (`tools/read.ts`) gjorde det ALDRI — `getPlayer`, `getUpcomingBookings`,
 * `getOutstandingInvoices`, `getActiveSubscriptions` og `getRound` returnerte
 * ekte navn (og for flere av dem: ekte e-post) direkte som tool-resultat, og
 * et tool-resultat blir en del av samtale-konteksten AI SDK sender til modellen
 * i neste steg i samme kall — altså en reell, upseudonymisert utgang.
 *
 * Denne modulen er den FELLES grensen alle read-tools nå går gjennom:
 * - `name` erstattes ALLTID med et deterministisk, ikke-reverserbart
 *   pseudonym (`pseudonymForId`) FØR verdien returneres fra et tool.
 * - `email` fjernes ALLTID — den trengs aldri av modellen (kun til søk, som
 *   allerede skjer server-side i `searchPlayers` sin WHERE-klausul).
 * - Treningsdata (SG, tester, økter, planer) rører vi IKKE — kun identitet.
 *
 * Pseudonym → ekte navn-koblingen lever KUN i `register` (et vanlig
 * in-memory Map opprettet på server for ÉN chat-request, aldri sendt noe
 * sted) — route.ts bruker den til å skrive ekte navn tilbake i teksten FØR
 * den persisteres til `CaddieMessage`, slik at coachen fortsatt ser ekte
 * navn i historikken uten at navnet noensinne forlot serveren mot Anthropic.
 */
import { pseudonymForId } from "@/lib/ai/anonymiser";

/** pseudonym → ekte navn. Opprettes én gang per chat-request (route.ts). */
export type SpillerRegister = Map<string, string>;

export function nyttSpillerRegister(): SpillerRegister {
  return new Map();
}

/**
 * Erstatt et spiller-navn med et stabilt pseudonym, og husk koblingen i
 * registeret slik at den kan skrives tilbake i modellens svar senere.
 * `null`/tomt navn gir samme pseudonym (deterministisk på id), men
 * registrerer ingen tilbake-kobling — det er ikke noe ekte navn å vise.
 */
export function pseudonymiserNavn(
  register: SpillerRegister,
  id: string,
  ektNavn: string | null | undefined,
): string {
  const pseudonym = pseudonymForId(id);
  if (ektNavn && ektNavn.trim().length > 0) {
    register.set(pseudonym, ektNavn);
  }
  return pseudonym;
}
