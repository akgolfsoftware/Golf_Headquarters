/**
 * NGF/Golfbox-scraper — turneringskalender for norske amatør-turneringer.
 *
 * STATUS: STUB — krever videre research av Golfbox sin offentlig URL-struktur.
 * Golfbox er kompleks å scrape (JS-rendret, cookie-basert, ingen offentlig API).
 *
 * Planlagt strategi når aktivert:
 * 1. Bruk Playwright (ikke cheerio) for JS-rendret innhold
 * 2. Cache aggressivt — DOM-strukturen kan endres
 * 3. Fallback til e-postvarsel hvis parse feiler
 *
 * Inntil videre: returner tom liste. MVP bruker kun DataGolf-data.
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
  // TODO: implementer når Golfbox sin URL-struktur er kartlagt.
  // Forventet kilde: https://www.golfforbundet.no/turneringer/ eller
  // golfbox-iframe på samme side. Krever Playwright pga JS-rendering.
  console.warn("[ngf-scraper] STUB — returnerer tom liste");
  return [];
}
