/**
 * NGF/GolfBox-scraper — turneringskalender for norske amatør-turneringer.
 *
 * Live-kilde: scores.golfbox.dk ScheduleHandler (offentlig JSON).
 * Se docs/turnering-datakilder.md (§ VERIFISERT) og golfbox-customers.ts.
 *
 * Prefer `syncGolfBoxSchedules` (src/lib/turneringer/golfbox-sync.ts) for
 * full upsert. Denne funksjonen returnerer et tynt DTO for bakoverkompatibilitet.
 */

import { getSchedule } from "@/lib/scrapers/golfbox";
import { NO_TOUR_CUSTOMERS } from "@/lib/scrapers/golfbox-customers";

export type NgfTournament = {
  sourceId: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  course?: string;
  location?: string;
  officialUrl?: string;
  /** ISO-dato YYYY-MM-DD når GolfBox har EntryCloses. */
  entryCloses?: string;
};

/**
 * Hent kommende + historiske events fra alle kuraterte norske GolfBox-kunder.
 * Filtrerer onlyMatching (Olyo-regioner). Krever startDate.
 */
export async function scrapeNgfSchedule(): Promise<NgfTournament[]> {
  const out: NgfTournament[] = [];
  const seen = new Set<string>(); // competitionId — unngå dublett på tvers av kunder

  for (const src of NO_TOUR_CUSTOMERS) {
    let sched;
    try {
      sched = await getSchedule(src.customerId);
    } catch (err) {
      console.error(
        `[ngf-scraper] GetSchedule feilet for ${src.label} (${src.customerId}):`,
        err instanceof Error ? err.message : err,
      );
      continue;
    }

    for (const e of sched) {
      if (!e.startDate) continue;
      if (src.onlyMatching && !src.onlyMatching.test(e.name)) continue;
      const sourceId = String(e.competitionId);
      if (seen.has(sourceId)) continue;
      seen.add(sourceId);

      out.push({
        sourceId,
        name: e.name,
        startDate: e.startDate,
        endDate: e.endDate ?? undefined,
        course: e.venue ?? undefined,
        location: e.venue ?? undefined,
        entryCloses: e.entryCloses
          ? e.entryCloses.toISOString().slice(0, 10)
          : undefined,
      });
    }
  }

  console.info(
    `[ngf-scraper] Hentet ${out.length} events fra ${NO_TOUR_CUSTOMERS.length} GolfBox-kunder`,
  );
  return out;
}
