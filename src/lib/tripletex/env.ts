// src/lib/tripletex/env.ts
// Defensiv lesing av Tripletex-env, etter mønsteret i src/lib/meg/env.ts:
// zod-validering, returnerer null hvis ukonfigurert — resten av appen
// (lønns-sjekkliste, purring, månedsavslutning) krasjer aldri om
// Tripletex-integrasjonen ikke er satt opp ennå.
//
// Se .claude/rules/admin-tripletex.md: agenten logger ALDRI inn i Tripletex
// med brukernavn/passord — kun de to API-tokenene under (consumer + employee),
// som brukes til å opprette en midlertidig sesjonstoken (se client.ts).
import "server-only";
import { z } from "zod";

const tripletexEnvSchema = z.object({
  TRIPLETEX_CONSUMER_TOKEN: z.string().min(1),
  TRIPLETEX_EMPLOYEE_TOKEN: z.string().min(1),
  TRIPLETEX_BASE_URL: z.string().url().default("https://tripletex.no/v2"),
});

export type TripletexEnv = {
  consumerToken: string;
  employeeToken: string;
  baseUrl: string;
};

/**
 * Leser Tripletex-env defensivt. Returnerer null hvis ukonfigurert (mangler
 * consumer- eller employee-token) — kallere skal alltid håndtere null uten
 * å krasje, og aldri estimere tall i stedet.
 */
export function readTripletexEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): TripletexEnv | null {
  const parsed = tripletexEnvSchema.safeParse(source);
  if (!parsed.success) return null;
  return {
    consumerToken: parsed.data.TRIPLETEX_CONSUMER_TOKEN,
    employeeToken: parsed.data.TRIPLETEX_EMPLOYEE_TOKEN,
    baseUrl: parsed.data.TRIPLETEX_BASE_URL.replace(/\/$/, ""),
  };
}
