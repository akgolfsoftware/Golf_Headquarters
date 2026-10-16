import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import pg from 'pg';
import { assertLocalUsersTargets, assertLocalUsersDatabase, LOCAL_USERS_PROJECT } from './local-users-target.mjs';

assertLocalUsersTargets(process.env);
const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
const client = await pool.connect();
try {
  const existing = await client.query("SELECT count(*)::int AS count FROM pg_tables WHERE schemaname = 'public'");
  if (existing.rows[0].count !== 0) {
    await assertLocalUsersDatabase(client);
    console.log('Dedicated user-test schema already exists; no schema change performed.');
  } else {
    // Generate SQL from the current schema; do not replay incomplete migrations.
    const sql = execFileSync(process.execPath, [
      resolve('node_modules/prisma/build/index.js'), 'migrate', 'diff',
      '--config', '.codex/environments/brukere/prisma.config.ts',
      '--from-empty', '--to-schema', 'prisma/schema.prisma', '--script',
    ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    await client.query('BEGIN');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public');
    await client.query(sql);
    await client.query(`COMMENT ON DATABASE postgres IS '${LOCAL_USERS_PROJECT}'`);
    // Local defense only. App Prisma uses its server connection. Do not claim
    // these deny-by-default policies reproduce the hosted database policies.
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    for (const { tablename } of tables.rows) {
      const quoted = '"' + tablename.replaceAll('"', '""') + '"';
      await client.query(`ALTER TABLE public.${quoted} ENABLE ROW LEVEL SECURITY`);
    }
    await client.query('COMMIT');
    await assertLocalUsersDatabase(client);
    console.log(`Created ${tables.rows.length} tables in the empty dedicated local database; REST access denied by default.`);
  }
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  // No connection strings or query data in output.
  console.error('Local schema setup failed:', error?.code ?? error?.name ?? 'unknown', 'SQL position:', error?.position ?? 'none');
  if (error?.code === '42704') console.error('Missing local schema type:', error.message);
  process.exitCode = 1;
} finally { client.release(); await pool.end(); }
