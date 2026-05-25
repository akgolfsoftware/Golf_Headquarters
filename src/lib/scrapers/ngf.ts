/**
 * NGF/Golfbox-scraper — turneringskalender for norske amatør-turneringer.
 *
 * STATUS: Live-scraping er STUB. Cron-baserte sync er erstattet av manuell
 * import via `scripts/import-norske-turneringer.ts` som leser ferdige
 * JSON-eksporter fra `~/My Drive/AK Golf Group/Data/` (Srixon, OLYO,
 * Norges Cup, Østlandstour).
 *
 * For å oppdatere norsk turneringsdata i DB:
 *   npx tsx scripts/import-norske-turneringer.ts
 *
 * Senere migrering: når akgolf-pipelines-repo er klart, byttes til
 * cron-pipeline med Playwright + automatisk Drive/Storage-sync.
 *
 * Golfbox er kompleks å scrape live (JS-rendret, cookie-basert, ingen
 * offentlig API), så manuell import er pragmatisk inntil pipeline-repo finnes.
 */

export type NgfTournament = {
  sourceId: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  course?: string;
  location?: string;
  officialUrl?: string;
};

export async function scrapeNgfSchedule(): Promise<NgfTournament[]> {
  // Live-scraping er ikke aktivert. Bruk import-scriptet for full norsk import.
  console.info(
    "[ngf-scraper] Live-scraping ikke aktivert — bruk `npx tsx scripts/import-norske-turneringer.ts`",
  );
  return [];
}
