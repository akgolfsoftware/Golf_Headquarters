/**
 * Global Junior Golf Tour (GJGT) import (STUB — krever research)
 *
 * Status: Skjelett klar. Trenger research-fase før implementasjon.
 *
 * RESEARCH SOM MÅ GJØRES FØRST:
 *   1. Hvor finnes offisiell GJGT-data?
 *      - Sjekk https://www.gjgt.com / .org / .net
 *      - Andre alternative tour-navn: AJGA (American Junior Golf Association),
 *        IJGA (International Junior Golf Academy)
 *      - Avklare hvilken vi sikter på
 *   2. API eller scraping?
 *      - Mange amerikanske junior-tourer har lukket API
 *      - Scraping krever Playwright pga JS-rendring
 *   3. Hvordan identifisere norske spillere?
 *      - Filter på country/nationality i player-listen
 *      - Cross-match mot eksisterende PublicPlayer i DB
 *   4. Hva er datavolum?
 *      - Estimere antall events/år, antall norske deltakere
 *
 * NÅR KILDE ER AVKLART:
 *   - Bygg parser tilsvarende scripts/scrape-wagr-rounds.ts
 *   - Upsert som Tournament (sourceOrigin="GJGT", tour="junior-int")
 *   - PublicPlayerEntry med rounds-JSON
 *
 * SE OGSÅ:
 *   - scripts/import-norske-turneringer.ts for mønster på upsert-flow
 *   - prisma/schema.prisma — Tournament + PublicPlayer + PublicPlayerEntry
 *
 * KOMMANDO NÅR FERDIG:
 *   npx tsx scripts/import-gjgt.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

async function main() {
  console.log("GJGT-import STUB — krever research-fase.");
  console.log("");
  console.log("Neste steg:");
  console.log("  1. Avklare hvilken tour (GJGT vs AJGA vs IJGA)");
  console.log("  2. Sjekke API/scraping-strategi");
  console.log("  3. Identifisere norske spillere i kilden");
  console.log("  4. Estimere datavolum");
  console.log("");
  console.log(
    "Se kommentaren i scripts/import-gjgt.ts for full research-plan.",
  );
}

main();
