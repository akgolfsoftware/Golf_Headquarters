/**
 * Seed én dedikert SELVBETJENT (PLATFORM_ONLY) testspiller for I0-
 * negativtesten (lib/auth/coached.ts sitt tilgangsskille).
 *
 * Spilleren har ingen coach-relasjon: aktiv PlayerEnrollment med
 * program PLATFORM_ONLY, ingen gruppemedlemskap. `coachedPlayerWhere()`
 * skal derfor gjøre spilleren usynlig i hele AgencyOS — dette er nøyaktig
 * det e2e/i0-selvbetjent-gate.spec.ts verifiserer.
 *
 * Ingen Supabase auth-bruker opprettes — spilleren logger aldri selv inn
 * i denne testen, kun en coach som prøver å nå spilleren via direkte URL.
 * Idempotent (kan kjøres flere ganger). Rører aldri andre fixtures.
 *
 * Kjør: npx tsx scripts/seed-platform-only-player.ts
 */

import "./_env";

import { writeFileSync, mkdirSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Playwright sin transform klarer ikke parse den genererte Prisma-klienten
// hvis e2e-testen importerer @prisma/client selv — så id-en skrives til en
// gitignoret fixture-fil i stedet (samme mønster som andre midlertidige
// artefakter i tmp/, se .gitignore).
const FIXTURE_PATH = "tmp/e2e-fixtures.json";

const EMAIL = "selvbetjent-test@stall.akgolf.test";
const NAME = "Selvbetjent Testspiller";

async function main() {
  console.log("Seeder selvbetjent (PLATFORM_ONLY) testspiller...");

  const player = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { name: NAME, role: "PLAYER", tier: "GRATIS" },
    create: {
      authId: "stall-selvbetjent-test",
      email: EMAIL,
      name: NAME,
      role: "PLAYER",
      tier: "GRATIS",
    },
    select: { id: true },
  });

  // Sørg for at spilleren IKKE er i noen gruppe (ville gjort den coachet).
  await prisma.groupMember.deleteMany({ where: { userId: player.id } });

  // Aktiv PLATFORM_ONLY-enrollering — ingen coach, ingen gruppe.
  const activeEnrollment = await prisma.playerEnrollment.findFirst({
    where: { userId: player.id, endedAt: null },
    select: { id: true, program: true },
  });
  if (!activeEnrollment) {
    await prisma.playerEnrollment.create({
      data: { userId: player.id, program: "PLATFORM_ONLY" },
    });
  } else if (activeEnrollment.program !== "PLATFORM_ONLY") {
    // Avslutt en ev. feilaktig aktiv enrollering og opprett riktig.
    await prisma.playerEnrollment.update({
      where: { id: activeEnrollment.id },
      data: { endedAt: new Date() },
    });
    await prisma.playerEnrollment.create({
      data: { userId: player.id, program: "PLATFORM_ONLY" },
    });
  }

  mkdirSync("tmp", { recursive: true });
  writeFileSync(
    FIXTURE_PATH,
    JSON.stringify({ selvbetjentSpillerId: player.id, selvbetjentSpillerEmail: EMAIL }, null, 2),
  );

  console.log(`Selvbetjent testspiller klar: ${player.id} (${EMAIL})`);
  console.log(`Skrevet til ${FIXTURE_PATH} for e2e-testen.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
