/**
 * prisma/seed-drills.ts
 *
 * Seeder ExerciseDefinition fra prisma/seed-data/drills-raw.json.
 * Mappet fra ak-second-brain via Agent 11 (2026-05-20).
 *
 * Kjør: npx tsx prisma/seed-drills.ts
 *
 * Idempotent: upsert basert på navn — kjør på nytt for å oppdatere.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "node:fs";
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
  totalDrills: number;
  sources: string[];
  drills: RawDrill[];
};

// EQ-disipliner fra rå-data mappes til TEK (utstyrs-relatert teknikk-trening)
function mapDiscipline(d: RawDrill["disciplin"]): "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" {
  return d === "EQ" ? "TEK" : d;
}

async function main() {
  const path = resolve(process.cwd(), "prisma/seed-data/drills-raw.json");
  const raw: RawData = JSON.parse(readFileSync(path, "utf-8"));

  console.log(`Seeder ${raw.drills.length} drills fra ${raw.sources.join(", ")}…`);

  let inserted = 0;
  let updated = 0;

  for (const d of raw.drills) {
    const existing = await prisma.exerciseDefinition.findFirst({
      where: { name: d.navn },
    });

    const data = {
      name: d.navn,
      description: d.beskrivelse,
      videoUrl: d.videoUrl,
      pyramidArea: mapDiscipline(d.disciplin),
      skillArea: d.skillArea as "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL",
      minKategori: d.minKategori as
        | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L",
      maxKategori: d.maxKategori as
        | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L",
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
  }

  console.log(`Ferdig. Insert: ${inserted}, Update: ${updated}, Total: ${inserted + updated}.`);

  // Verifiser fordeling
  const byDiscipline = await prisma.exerciseDefinition.groupBy({
    by: ["pyramidArea"],
    _count: true,
  });
  console.log("\nFordeling per disiplin:");
  for (const g of byDiscipline) {
    console.log(`  ${g.pyramidArea}: ${g._count}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
