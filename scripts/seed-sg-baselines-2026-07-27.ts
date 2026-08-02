/**
 * Seed av sg_baselines fra MasterBrain-fasiten (approach-granular-5-bands.json).
 *
 * Fasiten har 5 grove APP-bånd, men leserne (same-distance-strategy.ts /
 * insight-engine) slår opp i 25-yards-buckets ("100-125y") — samme format som
 * datagolf-sync.ts skriver. Vi interpolerer derfor båndene lineært mellom
 * bånd-midtpunktene og seeder én rad per 25y-bucket (FAIRWAY, kategori APP).
 * Utenfor ytterste ankere klampes til nærmeste bånd-verdi.
 *
 * Idempotent (upsert). Kjøres DataGolf-syncen senere, overskriver den disse
 * radene med ferske verdier — ønsket oppførsel per fasitens egen note.
 * (Opprinnelig kjørt 2026-07-19; skriptet gjenskapes i git for reproduserbarhet.)
 *
 *   npx tsx scripts/seed-sg-baselines-2026-07-27.ts
 */
import "./_env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const MASTERBRAIN_DIR =
  process.env.MASTERBRAIN_DIR ?? join(homedir(), "Developer", "Masterbrain");

const BandsSchema = z.object({
  version: z.string(),
  bands: z.array(
    z.object({
      band: z.string(),
      min_yards: z.number(),
      max_yards: z.number(),
      lie: z.literal("fairway"),
      expected_strokes: z.number(),
    }),
  ),
});

function interpolate(anchors: Array<{ mid: number; strokes: number }>, yards: number): number {
  const sorted = [...anchors].sort((a, b) => a.mid - b.mid);
  if (yards <= sorted[0].mid) return sorted[0].strokes;
  const last = sorted[sorted.length - 1];
  if (yards >= last.mid) return last.strokes;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (yards >= a.mid && yards <= b.mid) {
      const t = (yards - a.mid) / (b.mid - a.mid);
      return a.strokes + t * (b.strokes - a.strokes);
    }
  }
  return last.strokes;
}

async function main() {
  const filePath = join(
    MASTERBRAIN_DIR,
    "processed",
    "sg-baselines",
    "approach-granular-5-bands.json",
  );
  const parsed = BandsSchema.safeParse(JSON.parse(readFileSync(filePath, "utf8")));
  if (!parsed.success) {
    throw new Error(`Ugyldig fasit-fil ${filePath}: ${parsed.error.message}`);
  }
  const { version, bands } = parsed.data;

  const anchors = bands.map((b) => ({
    mid: b.max_yards > 500 ? b.min_yards + 25 : (b.min_yards + b.max_yards) / 2,
    strokes: b.expected_strokes,
  }));

  const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
  const prisma = new PrismaClient({ adapter });
  const fetchedAt = new Date();
  const source = `masterbrain-approach-granular-5-bands-${version} (interpolert 25y)`;

  let upserted = 0;
  for (let low = 0; low < 250; low += 25) {
    const bucket = `${low}-${low + 25}y`;
    const expectedStrokes = Math.round(interpolate(anchors, low + 12.5) * 100) / 100;

    await prisma.sgBaseline.upsert({
      where: {
        category_distanceBucket_lie: {
          category: "APP",
          distanceBucket: bucket,
          lie: "FAIRWAY",
        },
      },
      update: { expectedStrokes, sampleSize: 0, source, fetchedAt },
      create: {
        category: "APP",
        distanceBucket: bucket,
        lie: "FAIRWAY",
        expectedStrokes,
        sampleSize: 0,
        source,
        fetchedAt,
      },
    });
    console.log(`  ${bucket.padEnd(9)} → ${expectedStrokes.toFixed(2)} slag`);
    upserted++;
  }

  const total = await prisma.sgBaseline.count();
  console.log(`\nUpsertet ${upserted} buckets. sg_baselines har nå ${total} rader.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
