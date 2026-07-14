/**
 * scripts/migrate-groups-maxparticipants-2026-07-13.ts
 *
 * Kirurgisk additiv migrasjon (gotchas.md): schema.prisma har hatt
 * Group.maxParticipants, men kolonnen ble aldri opprettet i prod —
 * /admin/grupper/[id] har kræsjet (P2022 «groups.maxParticipants does not
 * exist») og gruppe-detalj/timeplan har vært utilgjengelig. Samme feilklasse
 * som plan_actions.coachId (fikset 12. juli).
 *
 * Kjøres med: npx tsx scripts/migrate-groups-maxparticipants-2026-07-13.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "groups" ADD COLUMN IF NOT EXISTS "maxParticipants" INTEGER`,
  );
  const kolonne = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'maxParticipants'`,
  );
  if (kolonne.length !== 1) throw new Error("Verifisering feilet");
  console.log("Ferdig — groups.maxParticipants er på plass.");
}

main()
  .catch((e) => { console.error("FEIL:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
