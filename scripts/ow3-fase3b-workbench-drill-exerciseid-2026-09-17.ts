/**
 * OW-3 fase 3 (tillegg) — kirurgisk DDL: exerciseId på workbench_drills.
 *
 * Anders 17.09.2026: «Vi trenger kun en database for øvelser — WorkbenchDrills
 * og øvelser skal være det eksakt samme.» WorkbenchDrill manglet en ekte kobling
 * til øvelsesbanken (exercise_definitions) — hadde kun løs sourceId/akFormel-JSON.
 * Denne kolonnen speiler SessionDrill.exerciseId, men er nullbar (nye drills fra
 * en øvelse skal alltid sette den; frittstående/egendefinerte drills kan stå uten).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 *   npx tsx scripts/ow3-fase3b-workbench-drill-exerciseid-2026-09-17.ts
 *   npx tsx scripts/ow3-fase3b-workbench-drill-exerciseid-2026-09-17.ts --rollback
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
      await client.query(`DROP INDEX IF EXISTS "workbench_drills_exerciseId_idx";`);
      await client.query(`ALTER TABLE "workbench_drills" DROP COLUMN IF EXISTS "exerciseId";`);
      console.log("exerciseId droppet fra workbench_drills");
      return;
    }

    await client.query(`
      ALTER TABLE "workbench_drills"
        ADD COLUMN IF NOT EXISTS "exerciseId" TEXT;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "workbench_drills_exerciseId_idx"
        ON "workbench_drills"("exerciseId");
    `);

    const { rows } = await client.query(`
      select column_name from information_schema.columns
      where table_name = 'workbench_drills' and column_name = 'exerciseId'
    `);
    console.log(`OK — exerciseId ${rows.length === 1 ? "finnes" : "MANGLER"} på workbench_drills`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
