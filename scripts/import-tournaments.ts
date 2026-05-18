/**
 * Import turneringer fra data/tournaments-import.json til Tournament-tabellen.
 *
 * Kilder:
 * - Olyo Juniortour (6 kretser, 2025+)
 * - Srixon Tour (2025+)
 * - Titleist Østlandstour (2025+)
 *
 * Tour-info lagres i Tournament.notes som JSON: {"tour":"olyo","krets":"Midt","categories":[8363]}
 *
 * Kjør: npx tsx scripts/import-tournaments.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import fs from "fs";
import path from "path";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type ImportRow = {
  externalId: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  format: string;
  tour: "olyo" | "srixon" | "ostlandstour";
  krets?: string;
  categories?: number[];
};

async function main() {
  const file = path.resolve(__dirname, "../data/tournaments-import.json");
  if (!fs.existsSync(file)) {
    throw new Error(`Fant ikke ${file}`);
  }

  const rows: ImportRow[] = JSON.parse(fs.readFileSync(file, "utf-8"));
  console.log(`Leser ${rows.length} turneringer fra ${file}`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const notes = JSON.stringify({
        externalId: row.externalId,
        tour: row.tour,
        krets: row.krets ?? null,
        categories: row.categories ?? [],
      });

      const existing = await prisma.tournament.findFirst({
        where: { notes: { contains: row.externalId } },
      });

      const data = {
        name: row.name,
        startDate: new Date(row.startDate),
        endDate: row.endDate ? new Date(row.endDate) : null,
        format: row.format,
        notes,
      };

      if (existing) {
        await prisma.tournament.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      } else {
        await prisma.tournament.create({ data });
        created++;
      }
    } catch (err) {
      errors++;
      console.error(`Feil for ${row.name}:`, err);
    }
  }

  console.log(`\n✓ Ferdig:`);
  console.log(`  Opprettet: ${created}`);
  console.log(`  Oppdatert: ${updated}`);
  console.log(`  Feil:      ${errors}`);

  // Stats per tour
  const stats = await prisma.tournament.findMany({
    select: { notes: true },
  });
  const perTour: Record<string, number> = {};
  for (const t of stats) {
    try {
      const parsed = t.notes ? JSON.parse(t.notes) : null;
      const tour = parsed?.tour ?? "ukjent";
      perTour[tour] = (perTour[tour] ?? 0) + 1;
    } catch {
      perTour.ukjent = (perTour.ukjent ?? 0) + 1;
    }
  }
  console.log(`\nTotalt i DB per tour:`);
  for (const [tour, count] of Object.entries(perTour)) {
    console.log(`  ${tour}: ${count}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
