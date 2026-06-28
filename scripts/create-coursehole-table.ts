/**
 * Additiv DDL for baneguide-geometri (gotcha: migrate dev / db push er blokkert).
 * Lager course_holes + legger geometri-kolonner på baner. Idempotent.
 *
 *   npx tsx scripts/create-coursehole-table.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS course_holes (
      id            text PRIMARY KEY,
      "baneId"      text NOT NULL,
      "holeNumber"  integer NOT NULL,
      par           integer,
      "lengthMeter" integer,
      "handicapIndex" integer,
      "teeLat"      double precision,
      "teeLng"      double precision,
      "greenLat"    double precision,
      "greenLng"    double precision,
      "pinLat"      double precision,
      "pinLng"      double precision,
      geojson       jsonb,
      "osmWayId"    text,
      "createdAt"   timestamptz NOT NULL DEFAULT now(),
      "updatedAt"   timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT course_holes_bane_hole_unique UNIQUE ("baneId", "holeNumber"),
      CONSTRAINT course_holes_bane_fk FOREIGN KEY ("baneId")
        REFERENCES baner(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS course_holes_bane_idx ON course_holes ("baneId");`,
  );

  // Geometri-kolonner på baner
  for (const col of [
    `ADD COLUMN IF NOT EXISTS geojson jsonb`,
    `ADD COLUMN IF NOT EXISTS "osmRelationId" text`,
    `ADD COLUMN IF NOT EXISTS "geometrySource" text`,
    `ADD COLUMN IF NOT EXISTS "geometryUpdatedAt" timestamptz`,
  ]) {
    await prisma.$executeRawUnsafe(`ALTER TABLE baner ${col};`);
  }

  console.log("course_holes + baner-geometri-kolonner OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
