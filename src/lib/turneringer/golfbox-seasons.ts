import type { GolfBoxScheduleEvent } from "@/lib/scrapers/golfbox";
import type { GolfBoxCustomerSource } from "@/lib/scrapers/golfbox-customers";

export type SeasonOptions = { apply: boolean; from: number; to: number };

/** Hele, avsluttede sesonger; avvis skrivefeil før nettverk eller database åpnes. */
export function parseSeasonOptions(args: string[], now: Date = new Date()): SeasonOptions {
  const currentYear = Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Europe/Oslo" }).format(now));
  const options: SeasonOptions = { apply: false, from: 2010, to: currentYear - 1 };
  const seen = new Set<string>();
  for (const arg of args) {
    const key = arg.split("=")[0];
    if (seen.has(key)) throw new Error(`Argumentet ${key} er oppgitt flere ganger.`);
    seen.add(key);
    if (arg === "--apply") options.apply = true;
    else if (/^--(from|to)=\d{4}$/.test(arg)) {
      options[key === "--from" ? "from" : "to"] = Number(arg.split("=")[1]);
    } else throw new Error(`Ukjent eller ugyldig argument: ${arg}`);
  }
  if (options.from < 2010 || options.from > options.to || options.to >= currentYear) {
    throw new Error(`Velg avsluttede sesonger mellom 2010 og ${currentYear - 1}, med from <= to.`);
  }
  return options;
}

type SeasonDependencies = {
  sources: GolfBoxCustomerSource[];
  getSchedule: (customerId: number, season: number) => Promise<GolfBoxScheduleEvent[]>;
  saveEvent?: (source: GolfBoxCustomerSource, event: GolfBoxScheduleEvent, now: Date) => Promise<{ upserted: boolean }>;
  now: Date;
};

/** Dry-run henter kun offentlige terminlister og teller kandidater; den åpner ikke databasen. */
export async function backfillGolfBoxSeasons(options: SeasonOptions, deps: SeasonDependencies) {
  if (options.apply && !deps.saveEvent) throw new Error("Import krever en eksplisitt lagringsfunksjon.");
  const years: { customerId: number; year: number; found: number; candidates: number; saved: number }[] = [];
  const failures: { customerId: number; year: number }[] = [];
  for (const source of deps.sources) {
    // Tomme år avbryter ikke søket: eldre sesonger kan ha data på tross av hull.
    for (let year = options.to; year >= options.from; year--) {
      const row = { customerId: source.customerId, year, found: 0, candidates: 0, saved: 0 };
      years.push(row);
      try {
        const events = await deps.getSchedule(source.customerId, year);
        row.found = events.length;
        const seen = new Set<number>();
        for (const event of events) {
          // Beskytter mot at kilden ignorerer Season og sender årets kalender.
          if (event.startDate?.getUTCFullYear() !== year) continue;
          if (source.onlyMatching && !source.onlyMatching.test(event.name)) continue;
          if (seen.has(event.competitionId)) continue;
          seen.add(event.competitionId);
          row.candidates++;
          if (options.apply && (await deps.saveEvent!(source, event, deps.now)).upserted) row.saved++;
        }
      } catch {
        failures.push({ customerId: source.customerId, year });
      }
    }
  }
  return { years, failures };
}
