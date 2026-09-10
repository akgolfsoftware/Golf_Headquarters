/**
 * Manuell gjenoppretting av historiske GolfBox-terminlister, bevart fra stash.
 * Standard: les offentlige terminlister og tell kandidater uten DB-tilkobling.
 * --apply oppretter/oppdaterer kalenderen via samme helper som den løpende syncen.
 * Resultater importeres separat; dette scriptet oppretter ingen planlagt jobb.
 *
 * npx tsx scripts/backfill-golfbox-sesonger.ts --from=2020 --to=2025
 * npx tsx scripts/backfill-golfbox-sesonger.ts --from=2020 --to=2025 --apply
 */
import "./_env";
import { getSchedule } from "../src/lib/scrapers/golfbox";
import { NO_TOUR_CUSTOMERS } from "../src/lib/scrapers/golfbox-customers";
import { upsertScheduleEvent } from "../src/lib/turneringer/golfbox-sync";
import { backfillGolfBoxSeasons, parseSeasonOptions } from "../src/lib/turneringer/golfbox-seasons";
import type { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const now = new Date();
  const options = parseSeasonOptions(process.argv.slice(2), now);
  let prisma: PrismaClient | undefined;
  try {
    if (options.apply) {
      if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL mangler. Ingen import er startet.");
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { PrismaClient } = await import("../src/generated/prisma/client");
      prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
    }
    console.log(`${options.apply ? "Import" : "Forhåndsvisning uten DB"}: GolfBox-sesonger ${options.from}–${options.to}`);
    const database = prisma;
    const report = await backfillGolfBoxSeasons(options, {
      sources: NO_TOUR_CUSTOMERS,
      getSchedule,
      now,
      saveEvent: database ? (source, event, date) => upsertScheduleEvent(database, source, event, date) : undefined,
    });
    for (const source of NO_TOUR_CUSTOMERS) {
      const rows = report.years.filter(row => row.customerId === source.customerId);
      console.log(`${source.label}: ${rows.reduce((sum, row) => sum + row.candidates, 0)} kandidater, ${rows.reduce((sum, row) => sum + row.saved, 0)} lagret.`);
    }
    if (!options.apply) console.log("Ingen database er åpnet. Kandidater er ikke kontrollert mot sammenslåtte eller eksisterende turneringer. --apply kreves for lagring.");
    if (report.failures.length) {
      console.error(`Ufullstendig: ${report.failures.map(failure => `kunde ${failure.customerId}, ${failure.year}`).join("; ")}. Kjøringen kan gjentas.`);
      process.exitCode = 1;
    }
  } finally {
    await prisma?.$disconnect();
  }
}

main().catch(() => {
  console.error("GolfBox-kjøringen feilet. Kontroller årstall, argumenter og miljø. Ingen resultater er importert av dette scriptet.");
  process.exitCode = 1;
});
