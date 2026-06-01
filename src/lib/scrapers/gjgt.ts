/**
 * Global Junior Golf (GJGT) scraper — internasjonal junior-tour.
 *
 * Datakilde (verifisert 2026-06-01):
 *   - Terminliste: WordPress "The Events Calendar" REST API
 *       /wp-json/tribe/events/v1/events
 *   - tournamentid (intern PHP-id): finnes i entryList-lenken på hver
 *       turneringsside (/tournament/<slug>/)
 *   - Deltakerliste: /gjgdb/2021entryList.php?tournamentid=N
 *       (HTML-tabell: Navn, Nasjon-flagg, Grad Year, HCP, AG)
 *   - Nasjon = flagg-bilde /data/nationen/<id>.gif (numerisk intern id,
 *       ingen ISO-tekst). Norge = id 128.
 *
 * Live-scoring (/gjgdb/YYYY_LiveScoringUXX.php) er JS-drevet og ofte tom
 * utenom aktiv spilledag — vi henter derfor deltakerlister, ikke scores.
 *
 * Pure-ish modul: kun fetch + parsing, ingen DB. Importeres fra script.
 */

const BASE = "https://globaljuniorgolflive.com";
const UA = "AKGolfBot/1.0 (+akgolf.no)";

/** Intern GJGT nasjon-id → ISO-2. Norge er den vi filtrerer på. */
export const GJGT_NATION_ISO: Record<string, string> = {
  "128": "NO", // Norge
  "165": "SE", // Sverige
  "47": "DK", // Danmark
  "60": "FI", // Finland
  "76": "IS", // Island
  "65": "DE", // Tyskland
  "166": "CH", // Sveits
  "10": "AT", // Østerrike
  "61": "FR", // Frankrike
  "159": "ZA", // Sør-Afrika
  "182": "US", // USA
  "32": "CA", // Canada
  "91": "KR", // Sør-Korea
};

export const NORWAY_NATION_ID = "128";

let lastFetch = 0;
const MIN_INTERVAL_MS = 400;

async function throttledFetch(url: string): Promise<Response> {
  const wait = lastFetch + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastFetch = Date.now();
  return fetch(url, { headers: { "User-Agent": UA } });
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#0?38;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&aring;/gi, "å")
    .replace(/&oslash;/gi, "ø")
    .replace(/&aelig;/gi, "æ");
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export type GjgtEvent = {
  wpId: number;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  venue: string | null;
  url: string;
};

/** Hent hele terminlisten fra WP Events Calendar REST (paginert). */
export async function getEvents(): Promise<GjgtEvent[]> {
  const all: GjgtEvent[] = [];
  let page = 1;
  let pages = 1;
  do {
    const res = await throttledFetch(
      `${BASE}/wp-json/tribe/events/v1/events?per_page=50&page=${page}`,
    );
    if (!res.ok) break;
    const json = (await res.json()) as {
      events?: Array<{
        id: number;
        title: string;
        start_date?: string;
        end_date?: string;
        url: string;
        venue?: { venue?: string };
      }>;
      total_pages?: number;
    };
    pages = json.total_pages ?? 1;
    for (const e of json.events ?? []) {
      all.push({
        wpId: e.id,
        name: decodeEntities(e.title),
        startDate: e.start_date ? new Date(e.start_date.replace(" ", "T")) : null,
        endDate: e.end_date ? new Date(e.end_date.replace(" ", "T")) : null,
        venue: e.venue?.venue ? decodeEntities(e.venue.venue) : null,
        url: e.url,
      });
    }
    page++;
  } while (page <= pages);
  return all;
}

/** Finn intern PHP tournamentid fra en turneringsside. Null hvis ikke publisert ennå. */
export async function getTournamentId(eventUrl: string): Promise<number | null> {
  const res = await throttledFetch(eventUrl);
  if (!res.ok) return null;
  const html = decodeEntities(await res.text());
  const m = html.match(/entryList\.php\?tournamentid=(\d+)/i);
  return m ? Number(m[1]) : null;
}

export type GjgtEntry = {
  name: string; // "Fornavn Etternavn"
  nationId: string | null;
  gradYear: number | null;
  hcp: string | null;
  ageGroup: string | null;
};

/** Hent deltakerliste for en turnering (HTML-tabell). */
export async function getEntryList(tournamentId: number): Promise<GjgtEntry[]> {
  const res = await throttledFetch(
    `${BASE}/gjgdb/2021entryList.php?tournamentid=${tournamentId}`,
  );
  if (!res.ok) return [];
  const html = await res.text();

  const entries: GjgtEntry[] = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let row: RegExpExecArray | null;
  while ((row = rowRe.exec(html))) {
    const cellsHtml = [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(
      (m) => m[1],
    );
    if (cellsHtml.length < 5) continue;

    const name = stripTags(cellsHtml[0]);
    // Hopp over header / tomme rader
    if (!name || /name,?\s*first/i.test(name)) continue;

    const nationMatch = cellsHtml[1].match(/nationen\/(\d+)\.gif/i);
    const gradYear = parseInt(stripTags(cellsHtml[2]), 10);
    const hcp = stripTags(cellsHtml[3]) || null;
    const ageGroup = stripTags(cellsHtml[4]) || null;

    // Navn er "Etternavn, Fornavn" → snu til "Fornavn Etternavn"
    let displayName = name;
    const comma = name.indexOf(",");
    if (comma > 0) {
      const last = name.slice(0, comma).trim();
      const first = name.slice(comma + 1).trim();
      displayName = `${first} ${last}`.trim();
    }

    entries.push({
      name: displayName,
      nationId: nationMatch ? nationMatch[1] : null,
      gradYear: isNaN(gradYear) ? null : gradYear,
      hcp,
      ageGroup,
    });
  }
  return entries;
}
