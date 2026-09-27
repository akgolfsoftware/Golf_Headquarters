/**
 * Team Norway dokumenter — kirurgisk DDL for TnPostAttachment.category
 * (TN-14, Anders 27.09.2026: dokumentene skal ha kategori som i tegningen).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Idempotent og rent additivt: én nullbar kolonne. Eksisterende vedlegg
 * får null og vises uten kategori.
 *
 *   npx tsx scripts/add-tn-vedlegg-kategori-2026-09-27.ts
 *   npx tsx scripts/add-tn-vedlegg-kategori-2026-09-27.ts --rollback
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
      await client.query(`ALTER TABLE "tn_post_vedlegg" DROP COLUMN IF EXISTS "category";`);
      console.log("tn_post_vedlegg.category fjernet");
      return;
    }
    await client.query(`ALTER TABLE "tn_post_vedlegg" ADD COLUMN IF NOT EXISTS "category" TEXT;`);
    const { rows } = await client.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'tn_post_vedlegg' AND column_name = 'category';`,
    );
    console.log("tn_post_vedlegg.category:", rows);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
