/**
 * MASTERPLAN STEG 17.1/17.2 — kirurgisk DDL for Team Norway-poster
 * (TnPost, TnPostAttachment, TnPostLesekvittering).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase). CHECK-constraint
 * håndhever «nøyaktig én av groupId/mottakerUserId» på DB-nivå, ikke bare
 * i domenelaget (src/lib/domain/tn-post.ts).
 *
 *   npx tsx scripts/add-tn-post-2026-09-01.ts
 *   npx tsx scripts/add-tn-post-2026-09-01.ts --rollback
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
      await client.query(`DROP TABLE IF EXISTS "tn_post_lesekvitteringer";`);
      await client.query(`DROP TABLE IF EXISTS "tn_post_vedlegg";`);
      await client.query(`DROP TABLE IF EXISTS "tn_posts";`);
      console.log("tn_post_lesekvitteringer, tn_post_vedlegg, tn_posts droppet");
      return;
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "tn_posts" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "groupId" TEXT,
        "mottakerUserId" TEXT,
        "authorUserId" TEXT NOT NULL,
        "tekst" TEXT NOT NULL,
        "kind" TEXT NOT NULL DEFAULT 'TEKST',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tn_posts_nettopp_en_mottaker_check" CHECK (
          ("groupId" IS NOT NULL AND "mottakerUserId" IS NULL)
          OR ("groupId" IS NULL AND "mottakerUserId" IS NOT NULL)
        )
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "tn_posts_groupId_createdAt_idx"
        ON "tn_posts"("groupId", "createdAt");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "tn_posts_mottakerUserId_createdAt_idx"
        ON "tn_posts"("mottakerUserId", "createdAt");
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "tn_post_vedlegg" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "postId" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileType" TEXT,
        "fileSize" INTEGER,
        "path" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tn_post_vedlegg_postId_fkey" FOREIGN KEY ("postId")
          REFERENCES "tn_posts"("id") ON DELETE CASCADE
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "tn_post_vedlegg_postId_idx"
        ON "tn_post_vedlegg"("postId");
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "tn_post_lesekvitteringer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "postId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tn_post_lesekvitteringer_postId_fkey" FOREIGN KEY ("postId")
          REFERENCES "tn_posts"("id") ON DELETE CASCADE
      );
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "tn_post_lesekvitteringer_postId_userId_key"
        ON "tn_post_lesekvitteringer"("postId", "userId");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "tn_post_lesekvitteringer_postId_idx"
        ON "tn_post_lesekvitteringer"("postId");
    `);

    const { rows } = await client.query(
      `select
         (select count(*)::int from "tn_posts") as poster,
         (select count(*)::int from "tn_post_vedlegg") as vedlegg,
         (select count(*)::int from "tn_post_lesekvitteringer") as kvitteringer`,
    );
    console.log(
      `tn_posts klar — ${rows[0].poster} poster, ${rows[0].vedlegg} vedlegg, ${rows[0].kvitteringer} kvitteringer`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
