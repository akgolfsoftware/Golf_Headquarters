/**
 * prisma/seed-drills-expansion.ts
 *
 * Seeder ExerciseDefinition fra prisma/seed-data/drills-expansion/*.json
 * (5 filer: putting, naerspill, wedger, approach, driver).
 *
 * Resultat: ~649 nye drills på toppen av eksisterende 138.
 *
 * Kjør: npx tsx prisma/seed-drills-expansion.ts
 *
 * Idempotent: upsert basert på navn — kjør på nytt for å oppdatere.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

type RawDrill = {
  navn: string;
  beskrivelse: string;
  disciplin: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" | "EQ";
  skillArea: "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL";
  minKategori: string;
  maxKategori: string;
  minHcp: number;
  maxHcp: number;
  environment: string[];
  utstyr: string[];
  fasilitetKrav?: string[]; // Valgfritt — settes av enrichment-script hvis utelatt
  treningstype?: "BLOKK" | "VARIABEL" | "KONKURRANSE" | "SPILL_TEST"; // Valgfritt
  varighetMin: number;
  intensitet: number;
  lPhase: string[];
  morad: boolean;
  prerequisites: string[];
  defaultSets: number | null;
  defaultReps: number | null;
  csTargetByKategori: Record<string, number>;
  videoUrl: string | null;
  kilde: string;
  tags: string[];
  coachNotater: string;
};

type RawData = {
  version: string;
  generatedAt: string;
  fokusOmrade?: string;
  totalDrills: number;
  sources: string[];
  drills: RawDrill[];
};

// EQ-disipliner mappes til TEK (utstyrs-relatert teknikk-trening)
function mapDiscipline(d: RawDrill["disciplin"]): "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" {
  return d === "EQ" ? "TEK" : d;
}

async function main() {
  const expansionDir = resolve(process.cwd(), "prisma/seed-data/drills-expansion");
  const files = readdirSync(expansionDir).filter((f) => f.endsWith(".json"));

  console.log(`Fant ${files.length} JSON-filer i drills-expansion/`);

  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  const perFile: Array<{ file: string; inserted: number; updated: number; skipped: number }> = [];

  for (const f of files) {
    const raw: RawData = JSON.parse(readFileSync(`${expansionDir}/${f}`, "utf-8"));
    console.log(`\n${f}: ${raw.drills.length} drills (fokus: ${raw.fokusOmrade ?? "?"})`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const d of raw.drills) {
      try {
        const existing = await prisma.exerciseDefinition.findFirst({
          where: { name: d.navn },
        });

        const data = {
          name: d.navn,
          description: d.beskrivelse,
          videoUrl: d.videoUrl,
          pyramidArea: mapDiscipline(d.disciplin),
          skillArea: d.skillArea as
            | "TEE_TOTAL"
            | "TILNAERMING"
            | "AROUND_GREEN"
            | "PUTTING"
            | "SPILL",
          minKategori: d.minKategori as
            | "A" | "B" | "C" | "D" | "E" | "F"
            | "G" | "H" | "I" | "J" | "K" | "L",
          maxKategori: d.maxKategori as
            | "A" | "B" | "C" | "D" | "E" | "F"
            | "G" | "H" | "I" | "J" | "K" | "L",
          minHcp: d.minHcp,
          maxHcp: d.maxHcp,
          environment: d.environment as ("RANGE" | "BANE" | "STUDIO" | "HJEM" | "SIMULATOR")[],
          utstyr: d.utstyr,
          intensitet: d.intensitet,
          lPhases: d.lPhase as ("GRUNN" | "SPESIAL" | "TURNERING")[],
          morad: d.morad,
          prerequisites: d.prerequisites,
          tags: d.tags,
          coachNotes: d.coachNotater,
          kilde: d.kilde,
          defaultSets: d.defaultSets,
          defaultReps: d.defaultReps,
          durationMin: d.varighetMin,
          csTargetByKategori: d.csTargetByKategori,
          // fasilitetKrav er valgfritt i JSON — settes av enrichment-script hvis utelatt
          ...(d.fasilitetKrav !== undefined && d.fasilitetKrav.length > 0
            ? { fasilitetKrav: d.fasilitetKrav as ("RADAR" | "MAT_NET" | "BUNKER" | "KAMERA" | "PUTTING_GREEN_KORT" | "PUTTING_GREEN_LANG" | "SHORT_GAME_AREA" | "DRIVING_RANGE" | "BANE" | "SIMULATOR" | "VEKTSTANG" | "TRAPBAR" | "LOPEBANE" | "MED_BALL")[] }
            : {}),
          // treningstype er valgfritt — settes av enrichment-script hvis utelatt
          ...(d.treningstype !== undefined
            ? { treningstype: d.treningstype as "BLOKK" | "VARIABEL" | "KONKURRANSE" | "SPILL_TEST" }
            : {}),
        };

        if (existing) {
          await prisma.exerciseDefinition.update({
            where: { id: existing.id },
            data,
          });
          updated++;
        } else {
          await prisma.exerciseDefinition.create({ data });
          inserted++;
        }
      } catch (e) {
        console.error(`  Feil på drill "${d.navn}":`, e instanceof Error ? e.message : e);
        skipped++;
      }
    }

    perFile.push({ file: f, inserted, updated, skipped });
    totalInserted += inserted;
    totalUpdated += updated;
    totalSkipped += skipped;
    console.log(`  Insert: ${inserted} · Update: ${updated} · Skip: ${skipped}`);
  }

  console.log("\n=== Totalt ===");
  console.table(perFile);
  console.log(`Insert: ${totalInserted} · Update: ${totalUpdated} · Skip: ${totalSkipped}`);

  // Verifiser fordeling
  const byDiscipline = await prisma.exerciseDefinition.groupBy({
    by: ["pyramidArea"],
    _count: true,
  });
  console.log("\nFordeling per disiplin (alle drills):");
  for (const g of byDiscipline) {
    console.log(`  ${g.pyramidArea}: ${g._count}`);
  }

  const bySkillArea = await prisma.exerciseDefinition.groupBy({
    by: ["skillArea"],
    _count: true,
  });
  console.log("\nFordeling per skillArea:");
  for (const g of bySkillArea) {
    console.log(`  ${g.skillArea ?? "(null)"}: ${g._count}`);
  }

  const byMinKategori = await prisma.exerciseDefinition.groupBy({
    by: ["minKategori"],
    _count: true,
    orderBy: { minKategori: "asc" },
  });
  console.log("\nFordeling per minKategori:");
  for (const g of byMinKategori) {
    console.log(`  ${g.minKategori ?? "(null)"}: ${g._count}`);
  }

  const total = await prisma.exerciseDefinition.count();
  console.log(`\nTotalt drills i DB: ${total}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
