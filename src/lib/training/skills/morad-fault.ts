import type { SgCategory } from "@/generated/prisma/client";
import { sgTilMoradKandidater } from "@/lib/masterbrain";

// Koblingen SG-område → MORAD-svingfeil leses fra masterbrain-fasiten
// (`knowledge/concepts/sg-principles.json` → `sg_to_morad_faults`), som er den
// eneste gyldige kopien. Den gamle kilden, `src/lib/domain/rules/sg-to-morad-faults.json`,
// var en manuell kopi av materiale masterbrain arkiverte som utdatert, og er
// fjernet 2026-08-02.

const SG_TO_KEY: Record<SgCategory, string> = {
  OTT: "ott",
  APP: "app",
  ARG: "arg",
  PUTT: "putt",
};

/**
 * MORAD-kandidater for et SG-område — likestilte hypoteser, ikke en rangering.
 *
 * Et SG-tall alene identifiserer ikke en svingfeil. Kandidatene må bekreftes med
 * videoanalyse, kontroll av sikte og gjennomgang av køllevalg før de brukes i en
 * anbefaling. (Beslutning: Anders Kristiansen, 2026-07-31 — se masterbrains
 * MANIFEST.md.) PUTT gir alltid tom liste: MORAD er et posisjonssystem for
 * fullsving og dekker ikke putting.
 */
export function sgKandidatFeil(sgArea: SgCategory): string[] {
  return sgTilMoradKandidater[SG_TO_KEY[sgArea]] ?? [];
}

/**
 * Norsk formulering av kandidatene, klar til bruk i coach-vendt tekst. Returnerer
 * null når fasiten ikke har kandidater for området — da skal teksten utelate
 * svingfeil helt i stedet for å gjette.
 */
export function beskrivKandidatFeil(sgArea: SgCategory): string | null {
  const kandidater = sgKandidatFeil(sgArea);
  if (kandidater.length === 0) return null;
  return `SG peker mot ${kandidater.join(" eller ")} — må bekreftes med video, sikte og køllevalg`;
}
