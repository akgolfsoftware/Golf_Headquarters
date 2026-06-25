#!/usr/bin/env tsx
/**
 * Retag ExerciseDefinition minKategori/maxKategori til snittscore A–K.
 *
 *   npm run retag:drills        # dry-run
 *   npm run retag:drills:apply  # skriv til DB
 */

import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  drillKategoriFraHcpRange,
  normaliserDrillKategoriRange,
} from "../src/lib/domain/spiller-kategori";

const apply = process.argv.includes("--apply");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const drills = await prisma.exerciseDefinition.findMany({
    select: {
      id: true,
      name: true,
      minKategori: true,
      maxKategori: true,
      minHcp: true,
      maxHcp: true,
    },
  });

  let fraHcp = 0;
  let swapped = 0;
  let uendret = 0;
  const updates: {
    id: string;
    name: string;
    before: string;
    after: string;
    reason: string;
    minKategori: typeof drills[0]["minKategori"];
    maxKategori: typeof drills[0]["maxKategori"];
  }[] = [];

  for (const d of drills) {
    let minK = d.minKategori;
    let maxK = d.maxKategori;
    const reason: string[] = [];

    if (d.minHcp != null || d.maxHcp != null) {
      const derived = drillKategoriFraHcpRange(d.minHcp, d.maxHcp);
      minK = derived.minKategori;
      maxK = derived.maxKategori;
      reason.push("hcp→snittscore");
      fraHcp++;
    } else {
      const norm = normaliserDrillKategoriRange(minK, maxK);
      if (norm.swapped) {
        swapped++;
        reason.push("swap");
      }
      minK = norm.minKategori;
      maxK = norm.maxKategori;
    }

    if (minK === d.minKategori && maxK === d.maxKategori) {
      uendret++;
      continue;
    }

    updates.push({
      id: d.id,
      name: d.name,
      before: `${d.minKategori ?? "—"}/${d.maxKategori ?? "—"}`,
      after: `${minK ?? "—"}/${maxK ?? "—"}`,
      reason: reason.join("+") || "normaliser",
      minKategori: minK,
      maxKategori: maxK,
    });
  }

  console.log(`\nRetag drill-kategorier (${apply ? "APPLY" : "DRY-RUN"})`);
  console.log(`Totalt: ${drills.length} · Oppdateres: ${updates.length} · Uendret: ${uendret}`);
  console.log(`  Fra HCP-spenn: ${fraHcp} · Swap-only: ${swapped}\n`);

  for (const u of updates.slice(0, 15)) {
    console.log(`  ${u.name}: ${u.before} → ${u.after} (${u.reason})`);
  }
  if (updates.length > 15) {
    console.log(`  … og ${updates.length - 15} til`);
  }

  if (!apply) {
    console.log("\nKjør med --apply for å skrive til databasen.");
    return;
  }

  for (const u of updates) {
    await prisma.exerciseDefinition.update({
      where: { id: u.id },
      data: { minKategori: u.minKategori, maxKategori: u.maxKategori },
    });
  }
  console.log(`\n✓ Oppdatert ${updates.length} drills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());