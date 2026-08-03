/**
 * Additiv DDL for PlayerHQ-funksjonspakken (onboarding/planlegging/live/analyse,
 * 2026-07-27): player_facilities + nye kolonner på økt/drill/fys/bruker + enum-verdi.
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk DDL mot DIRECT_URL. Idempotent.
 *
 *   npx tsx scripts/migrate-playerhq-funksjonspakke-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Enum-verdi for plattform-delte spillerdrills (kan ikke kjøres i transaksjon).
  await prisma.$executeRawUnsafe(
    `ALTER TYPE "ExerciseVisibility" ADD VALUE IF NOT EXISTS 'PLATFORM';`,
  );

  // Spillerens navngitte treningsfasiliteter (onboarding).
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS player_facilities (
      id             text PRIMARY KEY,
      "userId"       text NOT NULL,
      name           text NOT NULL,
      "isIndoor"     boolean NOT NULL DEFAULT false,
      capabilities   "DrillFasilitet"[] NOT NULL DEFAULT '{}',
      notes          text,
      "sortOrder"    integer NOT NULL DEFAULT 0,
      "createdAt"    timestamp(3) NOT NULL DEFAULT now(),
      "updatedAt"    timestamp(3) NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "player_facilities_userId_idx" ON player_facilities ("userId");`,
  );
  // FK med cascade: uten den blir fasilitetsrader (persondata) liggende igjen når
  // en bruker slettes — GDPR-kravet i docs/runbook.md. Samme mønster som gameplan_hull.
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE player_facilities
        ADD CONSTRAINT player_facilities_user_fk FOREIGN KEY ("userId")
        REFERENCES users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Økt: lokasjon + målsetning (speiles mellom kanon og V2).
  await prisma.$executeRawUnsafe(
    `ALTER TABLE training_plan_sessions
       ADD COLUMN IF NOT EXISTS location text,
       ADD COLUMN IF NOT EXISTS maalsetning text;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE training_sessions_v2
       ADD COLUMN IF NOT EXISTS location text,
       ADD COLUMN IF NOT EXISTS maalsetning text;`,
  );

  // Drill: planlagt L-trapp (kanon + V2), faktisk tid + bibliotek-kobling (V2).
  await prisma.$executeRawUnsafe(
    `ALTER TABLE session_drills
       ADD COLUMN IF NOT EXISTS "planRepsUtenBall" integer,
       ADD COLUMN IF NOT EXISTS "planRepsLavFart" integer,
       ADD COLUMN IF NOT EXISTS "planRepsAuto" integer;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE training_drills_v2
       ADD COLUMN IF NOT EXISTS "planRepsUtenBall" integer,
       ADD COLUMN IF NOT EXISTS "planRepsLavFart" integer,
       ADD COLUMN IF NOT EXISTS "planRepsAuto" integer,
       ADD COLUMN IF NOT EXISTS "actualDurationSec" integer,
       ADD COLUMN IF NOT EXISTS "exerciseId" text;`,
  );

  // Bibliotek-drill: L-trapp-defaults for prefill.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE exercise_definitions
       ADD COLUMN IF NOT EXISTS "defaultRepsUtenBall" integer,
       ADD COLUMN IF NOT EXISTS "defaultRepsLavFart" integer,
       ADD COLUMN IF NOT EXISTS "defaultRepsAuto" integer;`,
  );

  // Fys-økt: gjennomføringsstempel for felles treningshistorikk.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE fys_okter
       ADD COLUMN IF NOT EXISTS "gjennomfortAt" timestamp(3),
       ADD COLUMN IF NOT EXISTS "faktiskMinutter" integer;`,
  );

  // Bruker: samtykke til deling av egne drills.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users
       ADD COLUMN IF NOT EXISTS "drillDelingGodtatt" boolean NOT NULL DEFAULT false;`,
  );

  console.log("PlayerHQ-funksjonspakke DDL OK (alle statements idempotente)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
