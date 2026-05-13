/**
 * WAGR-benchmark seed — 10 referansespillere (5 globalt topp + 5 norske topp).
 *
 * Data hentet manuelt fra wagr.com 12. mai 2026 (uke 18/2026).
 * Idempotent: upsert på wagrPlayerSlug, så kan kjøres flere ganger.
 *
 * Beregner også NGF-kategori (A-L) basert på ptsAvg.
 *
 * Kjør: npx tsx scripts/seed-wagr-benchmark.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * Map WAGR Pts Avg til NGF-kategori (A-L).
 * Kalibrert mot Øyvinds tabell + observerte topp-spillere mai 2026.
 */
function mapTilNgfKategori(ptsAvg: number): string {
  if (ptsAvg >= 1500) return "A"; // OWGR Top 150
  if (ptsAvg >= 1100) return "B"; // OWGR Top 400
  if (ptsAvg >= 900) return "C"; // OWGR Top 700 — Mjaaseth (989)
  if (ptsAvg >= 700) return "D"; // Am World 100
  if (ptsAvg >= 400) return "E"; // Am Europa 300 — Kuvaas/Herstad/Aase/Tegner
  if (ptsAvg >= 220) return "F"; // Junior WORLD
  if (ptsAvg >= 100) return "G"; // Junior EUROPE
  if (ptsAvg >= 50) return "H"; // Junior Nasjonal
  return "I"; // Junior Region/Klubb (I-L)
}

type WagrReference = {
  slug: string;
  fullName: string;
  country: string; // ISO 2-letter
  rank: number;
  moveDelta: number | null;
  ptsAvg: number;
  divisor: number;
  wins?: number;
  top10s?: number;
  bestRank?: number;
};

const REFERANSESPILLERE: WagrReference[] = [
  // --- Topp 5 menn globalt (uke 18/2026) ---
  {
    slug: "jackson-koivun-32509",
    fullName: "Jackson Koivun",
    country: "us",
    rank: 1,
    moveDelta: 0,
    ptsAvg: 1643.5694,
    divisor: 29.0754,
    wins: 9,
    top10s: 25,
    bestRank: 1,
  },
  {
    slug: "preston-stout-34568",
    fullName: "Preston Stout",
    country: "us",
    rank: 2,
    moveDelta: 0,
    ptsAvg: 1333.7693,
    divisor: 27.2264,
  },
  {
    slug: "benjamin-james-29941",
    fullName: "Benjamin James",
    country: "us",
    rank: 3,
    moveDelta: 0,
    ptsAvg: 1267.4682,
    divisor: 23.6037,
  },
  {
    slug: "christiaan-maas-31085",
    fullName: "Christiaan Maas",
    country: "za",
    rank: 4,
    moveDelta: 0,
    ptsAvg: 1217.6505,
    divisor: 29.2452,
  },
  {
    slug: "jase-summy-33816",
    fullName: "Jase Summy",
    country: "us",
    rank: 5,
    moveDelta: 0,
    ptsAvg: 1134.1081,
    divisor: 27.0943,
  },

  // --- Topp 5 norske gutter (uke 18/2026) ---
  {
    slug: "michael-alexander-mjaaseth",
    fullName: "Michael Alexander Mjaaseth",
    country: "no",
    rank: 17,
    moveDelta: -5,
    ptsAvg: 989.3215,
    divisor: 25.3018,
  },
  {
    slug: "kristoffer-kuvaas",
    fullName: "Kristoffer Kuvaas",
    country: "no",
    rank: 365,
    moveDelta: -9,
    ptsAvg: 579.1964,
    divisor: 23.9999,
  },
  {
    slug: "emil-borrestuen-herstad",
    fullName: "Emil Borrestuen Herstad",
    country: "no",
    rank: 375,
    moveDelta: 44,
    ptsAvg: 576.2624,
    divisor: 16.6603,
  },
  {
    slug: "mathias-aase-41993",
    fullName: "Mathias Aase",
    country: "no",
    rank: 697,
    moveDelta: 61,
    ptsAvg: 504.1956,
    divisor: 23.0754,
  },
  {
    slug: "joachim-larsen-tegner",
    fullName: "Joachim Larsen Tegner",
    country: "no",
    rank: 975,
    moveDelta: -56,
    ptsAvg: 470.5746,
    divisor: 25.3962,
  },
];

async function main() {
  console.log("WAGR-benchmark seed");
  console.log("===================\n");

  for (const ref of REFERANSESPILLERE) {
    const ngfCategory = mapTilNgfKategori(ref.ptsAvg);
    const result = await prisma.wagrSnapshot.upsert({
      where: { wagrPlayerSlug: ref.slug },
      update: {
        fullName: ref.fullName,
        country: ref.country,
        rank: ref.rank,
        moveDelta: ref.moveDelta,
        ptsAvg: ref.ptsAvg,
        divisor: ref.divisor,
        wins: ref.wins ?? 0,
        top10s: ref.top10s ?? 0,
        bestRank: ref.bestRank ?? null,
        ngfCategory,
        snapshotAt: new Date(),
      },
      create: {
        wagrPlayerSlug: ref.slug,
        fullName: ref.fullName,
        country: ref.country,
        rank: ref.rank,
        moveDelta: ref.moveDelta,
        ptsAvg: ref.ptsAvg,
        divisor: ref.divisor,
        wins: ref.wins ?? 0,
        top10s: ref.top10s ?? 0,
        bestRank: ref.bestRank ?? null,
        ngfCategory,
      },
    });
    console.log(
      `  ✓ ${result.rank}. ${result.fullName} (${result.country.toUpperCase()}) — ${result.ptsAvg.toFixed(2)} pts — Kategori ${ngfCategory}`,
    );
  }

  console.log("\nFerdig. 10 referansespillere seedet.");
}

main()
  .catch((err) => {
    console.error("FEIL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
