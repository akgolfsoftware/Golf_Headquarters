/** Additive, idempotent DDL for private per-attempt TN test photos.
 * Run only after explicitly matching TN_TEST_PHOTOS_EXPECT_TARGET against
 * host:port/database from DIRECT_URL:
 *   TN_TEST_PHOTOS_EXPECT_TARGET=127.0.0.1:56022/testbatteri_20261002 npx tsx scripts/add-tn-test-photos-2026-10-02.ts
 * Never use migrate dev, db push, or migrate deploy for this project.
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const parsed = new URL(url);
  const target = `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`.replace(/^\//, "");
  const expected = process.env.TN_TEST_PHOTOS_EXPECT_TARGET;
  if (!expected || expected !== target) throw new Error("DIRECT_URL samsvarer ikke med TN_TEST_PHOTOS_EXPECT_TARGET.");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "test_session_photos" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "testSessionId" TEXT NOT NULL,
        "attemptNumber" INTEGER NOT NULL CHECK ("attemptNumber" BETWEEN 1 AND 200),
        "storagePath" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "test_session_photos_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "test_session_photos_testSessionId_fkey"
          FOREIGN KEY ("testSessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE,
        CONSTRAINT "test_session_photos_session_attempt_key"
          UNIQUE ("testSessionId", "attemptNumber")
      );
    `);
    await client.query(`ALTER TABLE "test_session_photos" ENABLE ROW LEVEL SECURITY;`);
    await client.query(`CREATE INDEX IF NOT EXISTS "test_session_photos_userId_createdAt_idx" ON "test_session_photos"("userId", "createdAt");`);
    const { rows } = await client.query(`
      SELECT current_database() AS database,
        (SELECT count(*)::int FROM "test_session_photos") AS photos,
        (SELECT relrowsecurity FROM pg_class WHERE oid = 'test_session_photos'::regclass) AS rls_enabled
    `);
    if (rows[0]?.rls_enabled !== true) throw new Error("RLS ble ikke aktivert for test_session_photos.");
    console.log(`test_session_photos klar — ${rows[0].photos} bilder i ${rows[0].database}; RLS aktiv`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  // Error details omit connection strings and user data.
  console.error(error instanceof Error ? error.message : "Kunne ikke opprette bildemodellen.");
  process.exit(1);
});
