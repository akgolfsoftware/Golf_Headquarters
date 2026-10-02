/** Runs only against the separately provisioned Workbench loopback environment. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, delimiter } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { parse } from 'dotenv';
import { homedir } from 'node:os';
const root = resolve(import.meta.dirname, '..');
if (!process.versions.node.startsWith('24.')) throw new Error('Node.js 24 required');
const appRoot = process.argv[2] === 'dev' ? resolve(homedir(), 'Developer/akgolf-hq-workbench-local-qa-20261002') : root;
const local = parse(readFileSync(resolve(root, '.codex/environments/workbench/.env.runtime')));
const allowed = new Set(['LOCAL_WORKBENCH_PROJECT', 'DATABASE_URL', 'DIRECT_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_APP_URL']);
const db = new URL(local.DATABASE_URL);
if (Object.keys(local).some(k => !allowed.has(k)) || local.LOCAL_WORKBENCH_PROJECT !== 'ak-hq-workbench-20261002' ||
    !['postgres:', 'postgresql:'].includes(db.protocol) || db.hostname !== '127.0.0.1' || db.port !== '55722' || db.pathname !== '/postgres' || db.search ||
    local.DIRECT_URL !== local.DATABASE_URL || local.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:55721' || local.NEXT_PUBLIC_APP_URL !== 'http://127.0.0.1:3072' ||
    (process.argv[2] === 'dev' && ['.env', '.env.local', '.env.development', '.env.development.local', '.env.test', '.env.test.local'].some(file => existsSync(resolve(appRoot, file))))) {
  throw new Error('Only the isolated Workbench runtime without app env files is allowed');
}
for (const [service, port] of [['db', '55722'], ['auth', '55729']]) {
  const ports = JSON.parse(execFileSync('docker', ['inspect', '--format', '{{json .NetworkSettings.Ports}}', `ak-hq-workbench-20261002-${service}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  const published = Object.values(ports).flatMap(p => p ?? []);
  if (published.length !== 1 || published[0].HostIp !== '127.0.0.1' || published[0].HostPort !== port) throw new Error('Dedicated loopback binding required');
}
const env = Object.fromEntries(['PATH', 'TMPDIR', 'LANG', 'SHELL'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
Object.assign(env, local, { NEXT_TELEMETRY_DISABLED: '1', VEDLIKEHOLD: '0' });
env.PATH = dirname(process.execPath) + delimiter + (env.PATH ?? '');
const mode = process.argv[2];
const args = mode === 'test' ? ['--import', 'tsx', '--conditions=react-server', '--experimental-test-module-mocks', '--test', 'tests/local-workbench/week-plan-persistence.test.ts'] :
  mode === 'ui' ? ['node_modules/@playwright/test/cli.js', 'test', '-c', 'tests/local-workbench/playwright.config.ts'] :
  mode === 'dev' ? ['node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3072'] : null;
if (!args) throw new Error('Choose test, ui or dev');
if (mode === 'ui') args.push(...process.argv.slice(3));
const child = spawn(process.execPath, args, { cwd: appRoot, env, stdio: ['inherit', 'pipe', 'pipe'] });
const secrets = [local.DATABASE_URL, local.NEXT_PUBLIC_SUPABASE_ANON_KEY, local.SUPABASE_SERVICE_ROLE_KEY, db.password];
for (const stream of [child.stdout, child.stderr]) createInterface({ input: stream }).on('line', line => {
  for (const secret of secrets) line = line.replaceAll(secret, '[local setting redacted]');
  process.stdout.write(line + '\n');
});
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
