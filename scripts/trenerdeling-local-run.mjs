// Avgrenset til nattens separate, syntetiske IUP-app. Ingen .env-filer lastes.
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const url = new URL(config.DATABASE_URL);
if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.port !== '55822' || url.pathname !== '/postgres' || url.search || url.hash) throw new Error('Ukjent testmål');
const ports = JSON.parse(execFileSync('docker', ['inspect', '--format', '{{json .NetworkSettings.Ports}}', 'supabase_db_ak-hq-iup-app-20261002'], { encoding: 'utf8' }));
if (!ports['5432/tcp']?.length || !ports['5432/tcp'].every((p) => p.HostIp === '127.0.0.1' && p.HostPort === '55822')) throw new Error('Krever lokal portbinding');
const db = new pg.Client({ connectionString: config.DATABASE_URL });
try {
  await db.connect();
  const r = await db.query("SELECT shobj_description(oid, 'pg_database') AS marker FROM pg_database WHERE datname=current_database()");
  if (r.rows[0]?.marker !== 'ak-hq-iup-app-20261002') throw new Error('Ukjent databaseidentitet');
  if (process.argv.includes('--opprett-testskjema')) await db.query(readFileSync(path.join(root, 'scripts/sql/navngitt-trenerdeling.sql'), 'utf8'));
} finally { await db.end(); }
const r = spawnSync(process.execPath, ['--import', 'tsx', '--conditions=react-server', '--experimental-test-module-mocks', '--test', 'tests/iup-local/trenerdeling.test.ts'], {
  cwd: root, encoding: 'utf8', timeout: 120_000, maxBuffer: 5 * 1024 * 1024,
  env: { HOME: process.env.HOME, PATH: process.env.PATH, NODE_OPTIONS: '--max-old-space-size=4096', DATABASE_URL: config.DATABASE_URL },
});
const rediger = (s) => (s ?? '').replaceAll(config.DATABASE_URL, '[lokal database]').replaceAll(url.password, '[skjult]');
process.stdout.write(rediger(r.stdout)); process.stderr.write(rediger(r.stderr));
if (r.error) process.stderr.write('Lokal delingsprøve kunne ikke fullføres.\n');
process.exitCode = r.status ?? 1;
