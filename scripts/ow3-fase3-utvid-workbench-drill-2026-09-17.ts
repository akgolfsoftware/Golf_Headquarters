/**
 * OW-3 fase 3 — kirurgisk DDL: additive dosefelt på workbench_drills.
 *
 * SessionDrill (den gamle tabellen) har tellemåte (repType/repAntall/repMinutter/
 * repSett/repReps), planlagt L-trapp (planRepsUtenBall/planRepsLavFart/planRepsAuto)
 * og teknisk-plan-kobling (positionTaskId) — WorkbenchDrill manglet alle ni.
 * Uten dem mister Workbench tellemåte, reps, L-trapp og koblingen til teknisk plan
 * når planleggeren re-implementeres mot workbench_drills.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 * Se docs/planer/ow-3-en-oekt-modell-2026-09-16.md for hele planen.
 *
 *   npx tsx scripts/ow3-fase3-utvid-workbench-drill-2026-09-17.ts
 *   npx tsx scripts/ow3-fase3-utvid-workbench-drill-2026-09-17.ts --rollback
 */
import "./_env";
import { Client } from "pg";

const NYE_KOLONNER = [
  "repType",
  "repAntall",
  "repMinutter",
  "repSett",
  "repReps",
  "planRepsUtenBall",
  "planRepsLavFart",
  "planRepsAuto",
  "positionTaskId",
];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const rollback = process.argv.includes("--rollback");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    if (rollback) {
      await client.query(`DROP INDEX IF EXISTS "workbench_drills_positionTaskId_idx";`);
      await client.query(`
        ALTER TABLE "workbench_drills"
          DROP COLUMN IF EXISTS "repType",
          DROP COLUMN IF EXISTS "repAntall",
          DROP COLUMN IF EXISTS "repMinutter",
          DROP COLUMN IF EXISTS "repSett",
          DROP COLUMN IF EXISTS "repReps",
          DROP COLUMN IF EXISTS "planRepsUtenBall",
          DROP COLUMN IF EXISTS "planRepsLavFart",
          DROP COLUMN IF EXISTS "planRepsAuto",
          DROP COLUMN IF EXISTS "positionTaskId";
      `);
      console.log("Ni dosefelt droppet fra workbench_drills");
      return;
    }

    await client.query(`
      ALTER TABLE "workbench_drills"
        ADD COLUMN IF NOT EXISTS "repType" TEXT,
        ADD COLUMN IF NOT EXISTS "repAntall" INTEGER,
        ADD COLUMN IF NOT EXISTS "repMinutter" INTEGER,
        ADD COLUMN IF NOT EXISTS "repSett" INTEGER,
        ADD COLUMN IF NOT EXISTS "repReps" INTEGER,
        ADD COLUMN IF NOT EXISTS "planRepsUtenBall" INTEGER,
        ADD COLUMN IF NOT EXISTS "planRepsLavFart" INTEGER,
        ADD COLUMN IF NOT EXISTS "planRepsAuto" INTEGER,
        ADD COLUMN IF NOT EXISTS "positionTaskId" TEXT;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "workbench_drills_positionTaskId_idx"
        ON "workbench_drills"("positionTaskId");
    `);

    const { rows } = await client.query(
      `
      select column_name from information_schema.columns
      where table_name = 'workbench_drills'
        and column_name = ANY($1)
      order by column_name
    `,
      [NYE_KOLONNER],
    );
    console.log(`OK — ${rows.length}/${NYE_KOLONNER.length} nye kolonner finnes på workbench_drills:`, rows.map((r) => r.column_name));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
