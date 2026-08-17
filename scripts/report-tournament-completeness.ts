/**
 * Data-kvalitetsrapport: prosentandel COMPLETED-turneringer UTEN resultater,
 * per sourceOrigin. Ren rapport, skriver aldri til DB. Kjøres manuelt for å
 * fange opp fremtidige hull i turneringsdata-pipelinen (samme klasse feil som
 * 7-dagers-vindu-fellen i syncGolfBoxLeaderboards, fikset 2026-08-17).
 *
 * Bruk:
 *   npx tsx scripts/report-tournament-completeness.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const rows = await prisma.tournament.groupBy({
    by: ["sourceOrigin", "status"],
    where: { status: "COMPLETED" },
    _count: { _all: true },
  });

  type Row = { sourceOrigin: string | null; total: number; utenResultater: number };
  const perOrigin = new Map<string, Row>();

  for (const r of rows) {
    const key = r.sourceOrigin ?? "UKJENT";
    perOrigin.set(key, { sourceOrigin: key, total: r._count._all, utenResultater: 0 });
  }

  // Tell "uten resultater" separat per sourceOrigin (groupBy kan ikke uttrykke
  // "COMPLETED uten publicEntries" i én spørring på tvers av relasjon).
  for (const key of perOrigin.keys()) {
    const utenResultater = await prisma.tournament.count({
      where: { sourceOrigin: key, status: "COMPLETED", publicEntries: { none: {} } },
    });
    perOrigin.get(key)!.utenResultater = utenResultater;
  }

  console.log("=== Turneringsdekning: % COMPLETED uten resultater, per sourceOrigin ===\n");
  const sorted = [...perOrigin.values()].sort((a, b) => b.utenResultater - a.utenResultater);

  const header = `${"sourceOrigin".padEnd(14)}${"total".padStart(8)}${"uten res.".padStart(12)}${"andel".padStart(10)}`;
  console.log(header);
  console.log("-".repeat(header.length));

  let totalAll = 0;
  let utenAll = 0;
  for (const row of sorted) {
    const pct = row.total > 0 ? (row.utenResultater / row.total) * 100 : 0;
    console.log(
      `${(row.sourceOrigin ?? "UKJENT").padEnd(14)}${String(row.total).padStart(8)}${String(row.utenResultater).padStart(12)}${(pct.toFixed(1) + " %").padStart(10)}`,
    );
    totalAll += row.total;
    utenAll += row.utenResultater;
  }
  console.log("-".repeat(header.length));
  const totalPct = totalAll > 0 ? (utenAll / totalAll) * 100 : 0;
  console.log(
    `${"TOTALT".padEnd(14)}${String(totalAll).padStart(8)}${String(utenAll).padStart(12)}${(totalPct.toFixed(1) + " %").padStart(10)}`,
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal feil:", err);
  process.exit(1);
});
