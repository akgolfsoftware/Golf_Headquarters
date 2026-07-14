/**
 * scripts/migrate-teknisk-plan-automatikk-2026-07-14.ts
 *
 * Additiv, kirurgisk migrasjon (jf. gotchas.md — migrate dev/db push blokkert):
 * - Ny enum-type TaskKategori (Teknisk/Taktisk/Mentalt/Sosialt — eget felt
 *   ved siden av pyramide-aksen, aldri erstatter den).
 * - position_tasks.kategori (nullable — aldri en sperre).
 * - session_drills.positionTaskId + training_drills_v2.positionTaskId
 *   (nullable kobling drill → teknisk oppgave, for automatisk repslogging).
 *
 * Kjøres med: npx tsx scripts/migrate-teknisk-plan-automatikk-2026-07-14.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const CREATE_ENUM = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskKategori') THEN
    CREATE TYPE "TaskKategori" AS ENUM ('TEKNISK', 'TAKTISK', 'MENTALT', 'SOSIALT');
  END IF;
END $$;`;

const ALTERS: string[] = [
  `ALTER TABLE "position_tasks" ADD COLUMN IF NOT EXISTS "kategori" "TaskKategori"`,
  `ALTER TABLE "session_drills" ADD COLUMN IF NOT EXISTS "positionTaskId" TEXT`,
  `ALTER TABLE "training_drills_v2" ADD COLUMN IF NOT EXISTS "positionTaskId" TEXT`,
];

// Ekte FK-constraints (onDelete SET NULL) — matcher Prisma-relasjonene i
// schema.prisma. Guardet med IF NOT EXISTS via information_schema siden
// ALTER TABLE ... ADD CONSTRAINT ikke har en nativ IF NOT EXISTS.
const FK_CONSTRAINTS: { table: string; constraint: string; sql: string }[] = [
  {
    table: "session_drills",
    constraint: "session_drills_positionTaskId_fkey",
    sql: `ALTER TABLE "session_drills" ADD CONSTRAINT "session_drills_positionTaskId_fkey"
      FOREIGN KEY ("positionTaskId") REFERENCES "position_tasks"("id") ON DELETE SET NULL`,
  },
  {
    table: "training_drills_v2",
    constraint: "training_drills_v2_positionTaskId_fkey",
    sql: `ALTER TABLE "training_drills_v2" ADD CONSTRAINT "training_drills_v2_positionTaskId_fkey"
      FOREIGN KEY ("positionTaskId") REFERENCES "position_tasks"("id") ON DELETE SET NULL`,
  },
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  await prisma.$executeRawUnsafe(CREATE_ENUM);
  console.log("OK: TaskKategori-enum bekreftet/opprettet");

  const types = await prisma.$queryRawUnsafe<{ typname: string }[]>(
    `SELECT typname FROM pg_type WHERE typname = 'TaskKategori'`,
  );
  if (types.length !== 1) throw new Error(`Enum-type "TaskKategori" mangler i DB — avbryter`);

  for (const sql of ALTERS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 90));
  }

  for (const fk of FK_CONSTRAINTS) {
    const exists = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::int AS count FROM information_schema.table_constraints
       WHERE table_name = $1 AND constraint_name = $2`,
      fk.table,
      fk.constraint,
    );
    if (Number(exists[0]?.count ?? 0) > 0) {
      console.log("OK (finnes fra før):", fk.constraint);
      continue;
    }
    await prisma.$executeRawUnsafe(fk.sql);
    console.log("OK:", fk.constraint);
  }

  const pt = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'position_tasks' AND column_name = 'kategori'`,
  );
  const sd = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'session_drills' AND column_name = 'positionTaskId'`,
  );
  const tv2 = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'training_drills_v2' AND column_name = 'positionTaskId'`,
  );
  console.log(`position_tasks.kategori: ${pt.length}/1 · session_drills.positionTaskId: ${sd.length}/1 · training_drills_v2.positionTaskId: ${tv2.length}/1`);
  if (pt.length !== 1 || sd.length !== 1 || tv2.length !== 1) {
    throw new Error("Kolonne-verifisering feilet");
  }

  console.log("Ferdig — teknisk-plan-automatikk-kolonnene er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
