/**
 * Additiv DDL for helsedata-samtykke (GDPR art. 9-2 a) — helse_samtykker.
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL. Idempotent.
 *
 * Tabellen er APPEND-ONLY: samtykke og tilbaketrekking er hver sin rad, slik
 * at beviskjeden art. 7-1 krever holder. Gjeldende status = nyeste rad per
 * ("userId", type) — se src/lib/health/samtykke-regler.ts.
 *
 *   npx tsx scripts/create-helse-samtykker-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS helse_samtykker (
      id             text PRIMARY KEY,
      "userId"       text NOT NULL,
      type           text NOT NULL,
      gitt           boolean NOT NULL,
      "tekstVersjon" text NOT NULL,
      "gittAvUserId" text NOT NULL,
      "gittAvRolle"  text NOT NULL,
      "createdAt"    timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT helse_samtykker_user_fk FOREIGN KEY ("userId")
        REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Oppslaget vi faktisk gjør: alle rader for én bruker, nyeste først.
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS helse_samtykker_user_type_idx
       ON helse_samtykker ("userId", type, "createdAt");`,
  );

  const [{ count }] = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT count(*)::bigint AS count FROM helse_samtykker;`,
  );
  console.log(`helse_samtykker OK — ${count} rader.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
