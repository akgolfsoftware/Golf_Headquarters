import { readFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve, dirname, delimiter } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { parse } from 'dotenv';
import { assertLocalUsersRuntime, assertLocalUsersPorts, LOCAL_USERS_PROJECT } from './local-users-target.mjs';
import { redactLocalUsersOutput } from './local-users-output.mjs';

const root = resolve(import.meta.dirname, '..');
if (!process.versions.node.startsWith('24.')) throw new Error('Use the project Node.js 24 runtime');
const local = parse(readFileSync(resolve(root, '.codex/environments/brukere/.env.runtime')));
const appEnvFiles = ['.env', '.env.local', '.env.development', '.env.development.local', '.env.production', '.env.production.local', '.env.test', '.env.test.local']
  .filter(file => existsSync(resolve(root, file)));
assertLocalUsersRuntime(local, appEnvFiles);
for (const [service, port] of [['db', 55622], ['kong', 55621], ['inbucket', 55624]]) {
  const ports = JSON.parse(execFileSync('docker', ['inspect', '--format', '{{json .NetworkSettings.Ports}}',
    `supabase_${service}_${LOCAL_USERS_PROJECT}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  assertLocalUsersPorts(ports, port);
}
// No inherited provider secrets, hosted database defaults or .env copies.
const env = Object.fromEntries(['PATH', 'TMPDIR', 'LANG', 'SHELL'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
Object.assign(env, local, { NEXT_TELEMETRY_DISABLED: '1' });
// The global maintenance sign would hide every local app page. This is only
// the already validated synthetic environment, with all access guards intact.
if (['dev', 'users', 'e2e', 'stripe'].includes(process.argv[2])) { env.VEDLIKEHOLD = '0'; env.BOOKING_PUBLIC = 'true'; }
if (['stripe', 'stripe-auth'].includes(process.argv[2])) {
  env.LOCAL_STRIPE_RUNNER = '1';
  if (process.env.LOCAL_STRIPE_CLI) env.LOCAL_STRIPE_CLI = process.env.LOCAL_STRIPE_CLI;
}
// The unit suite deliberately verifies the default app origin, not this dev URL.
if (['verify', 'static', 'test', 'build', 'typegen'].includes(process.argv[2])) {
  delete env.NEXT_PUBLIC_APP_URL;
  // Match CI's allowance for the combined source tree, without inherited options.
  env.NODE_OPTIONS = '--max-old-space-size=5120';
}
env.PATH = dirname(process.execPath) + delimiter + (env.PATH ?? '');
const actions = {
  bootstrap: ['node', 'scripts/local-users-bootstrap.mjs'],
  seed: ['node', '--import', 'tsx', 'scripts/local-users-seed.ts'],
  dev: ['node', 'node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3061'],
  users: ['node', 'node_modules/@playwright/test/cli.js', 'test', '-c', 'tests/local-users/playwright.config.ts'],
  e2e: ['node', 'node_modules/@playwright/test/cli.js', 'test', '-c', 'tests/local-users/e2e.config.ts'],
  stripe: ['node', 'scripts/local-stripe-run.mjs'],
  'stripe-auth': ['node', 'scripts/local-stripe-auth.mjs'],
  'priority-journeys': ['node', '--import', 'tsx', '--conditions=react-server', '--experimental-test-module-mocks', '--test', 'tests/local-users/priority-journeys.test.ts'],
  journeys: ['node', '--import', 'tsx', '--conditions=react-server', '--experimental-test-module-mocks', '--test', 'tests/local-users/storage-journeys.test.ts'],
  verify: ['npm', 'run', 'verify'],
  static: ['npm', 'run', 'verify:static'],
  test: ['npm', 'test'],
  build: ['npm', 'run', 'build'],
  typegen: ['node', 'node_modules/next/dist/bin/next', 'typegen'],
};
const command = actions[process.argv[2]];
if (!command) throw new Error('Choose bootstrap, seed, dev, users, e2e, stripe, stripe-auth, journeys, priority-journeys, static, verify, test, build or typegen');
const args = command.slice(1);
if (['users', 'e2e', 'stripe'].includes(process.argv[2])) args.push(...process.argv.slice(3));
const credentialsFile = resolve(root, '.codex/environments/brukere/.env.users');
const credentials = existsSync(credentialsFile) ? parse(readFileSync(credentialsFile)) : {};
const secrets = [local.DATABASE_URL, local.DIRECT_URL, local.NEXT_PUBLIC_SUPABASE_ANON_KEY, local.SUPABASE_SERVICE_ROLE_KEY,
  ...Object.entries(credentials).filter(([key]) => key.endsWith('_PASSWORD')).map(([, value]) => value)];
const child = spawn(command[0] === 'node' ? process.execPath : command[0], args, { cwd: root, env, stdio: ['inherit', 'pipe', 'pipe'] });
for (const [stream, output] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
  createInterface({ input: stream }).on('line', line => output.write(redactLocalUsersOutput(line, secrets) + '\n'));
}
child.on('error', () => { console.error('Local test command could not start'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
