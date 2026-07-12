/**
 * scripts/migrate-plan-action-coach-id-2026-07-12.ts
 *
 * Additiv, kirurgisk migrasjon (jf. gotchas.md): migrasjonsfilen
 * prisma/migrations/20260710100000_plan_action_coach_id/migration.sql ble
 * skrevet 2026-07-10 men aldri kjørt mot prod-databasen (migrate dev/db push
 * er begge blokkert, se gotcha). Resultat: /admin/agencyos har 500'et i
 * produksjon siden da — prisma.planAction.findMany() feiler med
 * "column plan_actions.coachId does not exist" (P2022).
 *
 * Kjører nøyaktig samme SQL som migration.sql, direkte mot DIRECT_URL.
 * Rører kun plan_actions-tabellen. Idempotent (IF NOT EXISTS / DO-blokk).
 *
 * Kjøres med: npx tsx scripts/migrate-plan-action-coach-id-2026-07-12.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const STATEMENTS: string[] = [
  `ALTER TABLE "plan_actions" ADD COLUMN IF NOT EXISTS "coachId" TEXT`,
  `CREATE INDEX IF NOT EXISTS "plan_actions_coachId_status_createdAt_idx"
    ON "plan_actions"("coachId", "status", "createdAt")`,
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'plan_actions_coachId_fkey'
     ) THEN
       ALTER TABLE "plan_actions"
         ADD CONSTRAINT "plan_actions_coachId_fkey"
         FOREIGN KEY ("coachId") REFERENCES "users"("id")
         ON DELETE SET NULL ON UPDATE CASCADE;
     END IF;
   END $$`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 90));
  }

  const kolonne = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'plan_actions' AND column_name = 'coachId'`,
  );
  if (kolonne.length !== 1) {
    throw new Error("Kolonne-verifisering feilet — coachId ble ikke lagt til");
  }
  console.log("Ferdig — plan_actions.coachId er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
