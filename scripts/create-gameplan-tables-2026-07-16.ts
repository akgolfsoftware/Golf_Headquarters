/**
 * Additiv DDL for Gameplan (B39/C7) — gameplan_hull + gameplan_sone.
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL. Idempotent.
 *
 *   npx tsx scripts/create-gameplan-tables-2026-07-16.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS gameplan_hull (
      id          text PRIMARY KEY,
      "holeId"    text NOT NULL,
      "userId"    text NOT NULL,
      "siktLat"   double precision NOT NULL,
      "siktLng"   double precision NOT NULL,
      notat       text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT gameplan_hull_hole_user_unique UNIQUE ("holeId", "userId"),
      CONSTRAINT gameplan_hull_hole_fk FOREIGN KEY ("holeId")
        REFERENCES course_holes(id) ON DELETE CASCADE,
      CONSTRAINT gameplan_hull_user_fk FOREIGN KEY ("userId")
        REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS gameplan_hull_user_idx ON gameplan_hull ("userId");`,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS gameplan_sone (
      id            text PRIMARY KEY,
      "holeId"      text NOT NULL,
      "userId"      text NOT NULL,
      type          text NOT NULL,
      "senterLat"   double precision NOT NULL,
      "senterLng"   double precision NOT NULL,
      "radiusMeter" double precision NOT NULL,
      laast         boolean NOT NULL DEFAULT false,
      "createdAt"   timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT gameplan_sone_hole_fk FOREIGN KEY ("holeId")
        REFERENCES course_holes(id) ON DELETE CASCADE,
      CONSTRAINT gameplan_sone_user_fk FOREIGN KEY ("userId")
        REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS gameplan_sone_hole_user_idx ON gameplan_sone ("holeId", "userId");`,
  );

  console.log("gameplan_hull + gameplan_sone OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
