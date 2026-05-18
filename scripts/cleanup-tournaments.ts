/**
 * Rydd opp Tournament-tabellen:
 * - Slett avlyste turneringer (navn inneholder "avlyst", "kansel", "cancel" eller "AVLYST")
 * - Slett turneringer som er utgått (endDate eller startDate < i dag)
 *
 * Kjør: npx tsx scripts/cleanup-tournaments.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const AVLYST_REGEX = /avlyst|kansel|cancel/i;

async function main() {
  const naa = new Date();
  naa.setHours(0, 0, 0, 0); // Start på dagen

  const alle = await prisma.tournament.findMany({
    select: { id: true, name: true, startDate: true, endDate: true },
  });

  console.log(`Totalt før rydding: ${alle.length}`);

  // Finn kandidater for sletting
  const skalSlettes: { id: string; navn: string; aarsak: string }[] = [];

  for (const t of alle) {
    const sluttDato = t.endDate ?? t.startDate;
    if (sluttDato < naa) {
      skalSlettes.push({ id: t.id, navn: t.name, aarsak: "utgått" });
      continue;
    }
    if (AVLYST_REGEX.test(t.name)) {
      skalSlettes.push({ id: t.id, navn: t.name, aarsak: "avlyst" });
      continue;
    }
  }

  console.log(`\nFinner ${skalSlettes.length} turneringer som skal slettes:`);
  const grupperPerAarsak = skalSlettes.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.aarsak] = (acc[t.aarsak] ?? 0) + 1;
      return acc;
    },
    {},
  );
  console.log(`  Avlyste:  ${grupperPerAarsak.avlyst ?? 0}`);
  console.log(`  Utgåtte:  ${grupperPerAarsak.utgått ?? 0}`);

  if (skalSlettes.length === 0) {
    console.log("\n✓ Ingenting å rydde.");
    await prisma.$disconnect();
    return;
  }

  // Vis noen eksempler
  console.log("\nFørste 10 som slettes:");
  for (const t of skalSlettes.slice(0, 10)) {
    console.log(`  [${t.aarsak}] ${t.navn}`);
  }

  // Slett — onDelete: Cascade på TournamentResult og TournamentEntry vil håndtere resten
  const result = await prisma.tournament.deleteMany({
    where: { id: { in: skalSlettes.map((t) => t.id) } },
  });

  console.log(`\n✓ Slettet ${result.count} turneringer.`);

  const igjen = await prisma.tournament.count();
  console.log(`Totalt igjen: ${igjen}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
