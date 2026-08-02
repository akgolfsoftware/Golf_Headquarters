// GDPR-tiltak 2026-07-27: spillere skal ikke sendes til eksterne AI-leverandører
// (Anthropic, OpenAI m.fl.) med fullt navn når det ikke er nødvendig for at
// modellen skal løse oppgaven. Pseudonymet er deterministisk (samme spiller gir
// alltid samme pseudonym innenfor én prosess) slik at AI-teksten kan leses og
// den ekte navnet erstattes tilbake FØR coach eller spiller ser resultatet —
// det ekte navnet forlater aldri denne serveren.
//
// Ikke bruk til data som uansett må inneholde navnet i selve AI-outputen uten
// mulighet for etterprosessering (da må heller `substituerPseudonymer` kjøres
// på svaret før det lagres/vises).

import { createHash } from "crypto";

/** Deterministisk, ikke-reverserbart pseudonym for én bruker-id. */
export function pseudonymForId(userId: string): string {
  const hash = createHash("sha256").update(userId).digest("hex").slice(0, 6);
  return `Spiller-${hash}`;
}

/**
 * Bytter ut ett pseudonym med det ekte navnet i en AI-generert tekst.
 * Kjøres på responsen FØR den lagres eller vises til coach/spiller.
 */
export function substituerPseudonym(tekst: string, pseudonym: string, ektNavn: string): string {
  return tekst.split(pseudonym).join(ektNavn);
}

/** Som substituerPseudonym, men for flere spillere i én tekst (f.eks. daily brief). */
export function substituerPseudonymer(
  tekst: string,
  kart: Map<string, string> | Record<string, string>,
): string {
  const entries = kart instanceof Map ? Array.from(kart.entries()) : Object.entries(kart);
  return entries.reduce((acc, [pseudonym, ektNavn]) => acc.split(pseudonym).join(ektNavn), tekst);
}
