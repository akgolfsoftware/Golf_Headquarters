/**
 * Seed realistiske FYS-testverdier (RÅverdier: kg/cm/mph) for et knippe spillere, slik at
 * den stall-relative FYS-scoren (src/lib/domain/fys-score.ts) blir meningsfull.
 *
 * Dette er EKTE måleverdier (som rounds/sessions), ikke fabrikerte «scores» — TestResult.score
 * lagrer råverdien per testens scoringRule (Trapbar Deadlift/Benkpress = kg, Standing Long Jump/
 * Ball Throw = cm, Clubhead Speed = mph). Pluss en HealthEntry-kroppsvekt for relativ styrke.
 *
 * Idempotent (sletter + setter på nytt for de berørte spillerne/testene). Kjør:
 *   npx tsx scripts/seed-fys-testdata.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const FYS_TESTS = [
  "Trapbar Deadlift",
  "Benkpress",
  "Standing Long Jump",
  "Ball Throw",
  "Clubhead Speed (CHS)",
] as const;

// Realistiske FYS-profiler (RÅverdier). screentest = elite-junior.
// [trapbar kg, benk kg, lengde cm, ballkast cm, chs mph, kroppsvekt kg]
const PROFILER: Record<string, [number, number, number, number, number, number]> = {
  elite: [165, 110, 268, 660, 120, 79],
  sterk: [150, 100, 255, 620, 116, 84],
  middels: [130, 88, 240, 580, 110, 80],
  utvikling: [115, 78, 225, 540, 105, 75],
  ung: [95, 62, 210, 500, 99, 68],
};

async function main() {
  console.log("Seeder realistiske FYS-testverdier...");

  const defs = await prisma.testDefinition.findMany({
    where: { name: { in: FYS_TESTS as unknown as string[] } },
    select: { id: true, name: true },
  });
  if (defs.length < 5) {
    throw new Error(`Fant bare ${defs.length}/5 FYS-testdefinisjoner: ${defs.map((d) => d.name).join(", ")}`);
  }
  const byName = new Map(defs.map((d) => [d.name, d.id]));

  // Velg screentest + opptil 4 andre PLAYER-brukere for en meningsfull stall-spredning.
  const screentest = await prisma.user.findUnique({
    where: { email: "screentest@akgolf.test" },
    select: { id: true, name: true },
  });
  if (!screentest) throw new Error("Fant ikke screentest@akgolf.test — kjør seed-screentest.ts først.");

  const andre = await prisma.user.findMany({
    where: { role: "PLAYER", id: { not: screentest.id } },
    select: { id: true, name: true },
    take: 4,
    orderBy: { createdAt: "asc" },
  });

  const tildeling: Array<{ id: string; name: string; profil: keyof typeof PROFILER }> = [
    { id: screentest.id, name: screentest.name, profil: "elite" },
    ...andre.map((u, i) => ({
      id: u.id,
      name: u.name,
      profil: (["sterk", "middels", "utvikling", "ung"] as const)[i] ?? "middels",
    })),
  ];

  const takenAt = new Date();
  const fysTestIds = [...byName.values()];

  for (const t of tildeling) {
    const [trapbar, benk, lengde, ballkast, chs, vekt] = PROFILER[t.profil];
    const verdier: Record<string, number> = {
      "Trapbar Deadlift": trapbar,
      Benkpress: benk,
      "Standing Long Jump": lengde,
      "Ball Throw": ballkast,
      "Clubhead Speed (CHS)": chs,
    };

    // Rydd gamle FYS-resultater for disse testene, sett ferske RÅverdier.
    await prisma.testResult.deleteMany({ where: { userId: t.id, testId: { in: fysTestIds } } });
    await prisma.testResult.createMany({
      data: FYS_TESTS.map((navn) => ({
        userId: t.id,
        testId: byName.get(navn)!,
        takenAt,
        score: verdier[navn], // RÅverdi (kg/cm/mph) per testens scoringRule
        notes: "FYS-baseline (seed)",
      })),
    });

    // Kroppsvekt for relativ styrke (siste HealthEntry; @@unique([userId, date])).
    await prisma.healthEntry.upsert({
      where: { userId_date: { userId: t.id, date: takenAt } },
      update: { weightKg: vekt },
      create: { userId: t.id, date: takenAt, weightKg: vekt },
    });

    console.log(`  ${t.name} (${t.profil}): trapbar ${trapbar} · benk ${benk} · lengde ${lengde} · ballkast ${ballkast} · chs ${chs} · vekt ${vekt}`);
  }

  console.log(`\n✓ Ferdig. ${tildeling.length} spillere har realistiske FYS-baselines.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
