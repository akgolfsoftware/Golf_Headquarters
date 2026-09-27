/**
 * Team Norway testdag — kirurgisk DDL for TestDay, TestDayParticipant og
 * TestResult.recordedById.
 *
 * Modellene ble lagt i `prisma/schema.prisma` 14.09.2026 uten at DDL-en ble
 * kjørt. Uten dette skriptet erklærer skjemaet tabeller som ikke finnes i
 * basen, og fire kodestier som allerede spør mot dem feiler i drift:
 *   - src/app/team-norway/tn-testdag-actions.ts
 *   - src/app/team-norway/tn-testforing-actions.ts
 *   - src/app/portal/tren/tester/team-norway/{page,actions}.ts
 *   - src/lib/domain/tn-arbeidsflate.ts
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 * Idempotent: kan kjøres flere ganger. Rent additivt — ingen eksisterende
 * tabell, kolonne eller rad endres. `recordedById` er nullbar, så all
 * eksisterende `test_results`-data er uberørt og fortsatt gyldig
 * (null = spilleren registrerte selv).
 *
 * Kolonnenavn matcher Prisma (camelCase). Enum-typene får PascalCase-navn,
 * slik Prisma genererer dem (verifisert mot basen 17.09.2026: TestSessionStatus,
 * TestAssignmentStatus, TestVisibility).
 *
 *   npx tsx scripts/add-tn-testdag-2026-09-17.ts
 *   npx tsx scripts/add-tn-testdag-2026-09-17.ts --rollback
 *
 * Rollback dropper KUN de to nye tabellene og den nye kolonnen. Enum-typene
 * og all eksisterende testdata blir stående.
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const rollback = process.argv.includes("--rollback");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    if (rollback) {
      await client.query(`DROP TABLE IF EXISTS "test_day_participants";`);
      await client.query(`DROP TABLE IF EXISTS "test_days";`);
      await client.query(
        `ALTER TABLE "test_results" DROP COLUMN IF EXISTS "recordedById";`,
      );
      console.log(
        "test_day_participants, test_days droppet; test_results.recordedById fjernet",
      );
      return;
    }

    // Enum-typene. CREATE TYPE har ingen IF NOT EXISTS, så de pakkes i en
    // DO-blokk som svelger duplicate_object.
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TestDayStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TestDayParticipantStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED', 'ABSENT');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // TestResult.recordedById — coachen som førte testen PÅ VEGNE AV spilleren.
    // `userId` er alltid spilleren/subjektet, aldri coachen. Null = egenført.
    await client.query(`
      ALTER TABLE "test_results"
        ADD COLUMN IF NOT EXISTS "recordedById" TEXT;
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "test_results"
          ADD CONSTRAINT "test_results_recordedById_fkey"
          FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "test_results_recordedById_idx"
        ON "test_results"("recordedById");
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "test_days" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "groupId" TEXT NOT NULL,
        "coachId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "location" TEXT,
        "scheduledAt" TIMESTAMP(3) NOT NULL,
        "testDefinitionId" TEXT NOT NULL,
        "status" "TestDayStatus" NOT NULL DEFAULT 'PLANNED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "test_days_groupId_fkey" FOREIGN KEY ("groupId")
          REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "test_days_coachId_fkey" FOREIGN KEY ("coachId")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "test_days_testDefinitionId_fkey" FOREIGN KEY ("testDefinitionId")
          REFERENCES "test_definitions"("id") ON DELETE CASCADE
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "test_days_groupId_status_idx"
        ON "test_days"("groupId", "status");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "test_days_coachId_idx"
        ON "test_days"("coachId");
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "test_day_participants" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "testDayId" TEXT NOT NULL,
        "playerId" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "status" "TestDayParticipantStatus" NOT NULL DEFAULT 'PENDING',
        "sessionId" TEXT,
        "resultId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "test_day_participants_testDayId_fkey" FOREIGN KEY ("testDayId")
          REFERENCES "test_days"("id") ON DELETE CASCADE,
        CONSTRAINT "test_day_participants_playerId_fkey" FOREIGN KEY ("playerId")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "test_day_participants_sessionId_fkey" FOREIGN KEY ("sessionId")
          REFERENCES "test_sessions"("id") ON DELETE SET NULL,
        CONSTRAINT "test_day_participants_resultId_fkey" FOREIGN KEY ("resultId")
          REFERENCES "test_results"("id") ON DELETE SET NULL
      );
    `);
    // @unique på sessionId/resultId: én økt eller ett resultat kan aldri
    // gjenbrukes av to deltakerrader.
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "test_day_participants_sessionId_key"
        ON "test_day_participants"("sessionId");
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "test_day_participants_resultId_key"
        ON "test_day_participants"("resultId");
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "test_day_participants_testDayId_playerId_key"
        ON "test_day_participants"("testDayId", "playerId");
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "test_day_participants_testDayId_order_key"
        ON "test_day_participants"("testDayId", "order");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "test_day_participants_testDayId_status_idx"
        ON "test_day_participants"("testDayId", "status");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "test_day_participants_playerId_idx"
        ON "test_day_participants"("playerId");
    `);

    const { rows } = await client.query(
      `select
         (select count(*)::int from "test_days") as testdager,
         (select count(*)::int from "test_day_participants") as deltakere,
         (select count(*)::int from "test_results" where "recordedById" is not null) as trenerfoert`,
    );
    console.log(
      `test_days klar — ${rows[0].testdager} testdager, ${rows[0].deltakere} deltakere, ${rows[0].trenerfoert} trenerførte resultater`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
