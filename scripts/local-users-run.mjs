import { readFileSync } from 'node:fs';
import { resolve, dirname, delimiter } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { parse } from 'dotenv';
import { assertLocalUsersTargets, assertLocalUsersPorts, LOCAL_USERS_PROJECT } from './local-users-target.mjs';

const root = resolve(import.meta.dirname, '..');
if (!process.versions.node.startsWith('24.')) throw new Error('Use the project Node.js 24 runtime');
const local = parse(readFileSync(resolve(root, '.codex/environments/brukere/.env.runtime')));
assertLocalUsersTargets(local);
for (const [service, port] of [['db', 55622], ['kong', 55621], ['inbucket', 55624]]) {
  const ports = JSON.parse(execFileSync('docker', ['inspect', '--format', '{{json .NetworkSettings.Ports}}',
    `supabase_${service}_${LOCAL_USERS_PROJECT}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  assertLocalUsersPorts(ports, port);
}
// No inherited provider secrets, hosted database defaults or .env copies.
const env = Object.fromEntries(['PATH', 'TMPDIR', 'LANG', 'SHELL'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
Object.assign(env, local, { NEXT_TELEMETRY_DISABLED: '1' });
// The unit suite deliberately verifies the default app origin, not this dev URL.
if (['verify', 'static'].includes(process.argv[2])) delete env.NEXT_PUBLIC_APP_URL;
env.PATH = dirname(process.execPath) + delimiter + (env.PATH ?? '');
const actions = {
  bootstrap: ['node', 'scripts/local-users-bootstrap.mjs'],
  seed: ['node', '--import', 'tsx', 'scripts/local-users-seed.ts'],
  dev: ['node', 'node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3061'],
  users: ['node', 'node_modules/@playwright/test/cli.js', 'test', '-c', 'tests/local-users/playwright.config.ts'],
  verify: ['npm', 'run', 'verify'],
  static: ['npm', 'run', 'verify:static'],
};
const command = actions[process.argv[2]];
if (!command) throw new Error('Choose bootstrap, seed, dev, users, static or verify');
const args = command.slice(1);
if (process.argv[2] === 'users') args.push(...process.argv.slice(3));
const child = spawn(command[0] === 'node' ? process.execPath : command[0], args, { cwd: root, env, stdio: 'inherit' });
child.on('error', () => { console.error('Local test command could not start'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
