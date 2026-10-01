import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { createConnection } from 'node:net';
import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { parse } from 'dotenv';
import pg from 'pg';
import Stripe from 'stripe';
import { assertLocalUsersTargets, assertLocalUsersDatabase } from './local-users-target.mjs';
import { assertStripeTestSettings, isOwnStripeCheckout } from './local-stripe-target.mjs';
import { redactLocalUsersOutput } from './local-users-output.mjs';
import { localStripeTestAuth } from '../src/lib/stripe/local-test-auth.ts';

// Enter through local-users-run: it checks runtime files and Docker bindings.
if (process.env.LOCAL_STRIPE_RUNNER !== '1') throw new Error('Use local-users-run.mjs stripe');
const root = resolve(import.meta.dirname, '..');
const targets = assertLocalUsersTargets(process.env);
const settings = parse(readFileSync(resolve(root, '.codex/environments/brukere/.env.stripe-test')));
assertStripeTestSettings(settings);
const testEnv = { ...process.env, ...settings, NODE_ENV: 'development', LOCAL_E2E: '1', LOCAL_STRIPE_E2E: '1' };
const stripe = new Stripe(settings.STRIPE_SECRET_KEY ?? '', { timeout: 15_000, maxNetworkRetries: 0, ...localStripeTestAuth(testEnv) });
const db = new pg.Pool({ connectionString: targets.database.toString() });
const secrets = [...Object.values(settings), process.env.DATABASE_URL, process.env.DIRECT_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY];
const children = [];
let signingSecret;
let relay;
let interrupted = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  interrupted = true;
  for (const child of children) child.kill('SIGTERM');
});
const safeOutput = line => console.log(redactLocalUsersOutput(line, secrets));
function child(command, args, env, onLine = safeOutput) {
  const process = spawn(command, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(process);
  for (const stream of [process.stdout, process.stderr]) createInterface({ input: stream }).on('line', onLine);
  process.on('error', () => { interrupted = true; console.error('A Stripe test subprocess could not start'); });
  return process;
}
async function freeAppPort() {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: '127.0.0.1', port: 3061 });
    socket.on('connect', () => { socket.destroy(); reject(new Error('Stop your local app on port 3061 before running stripe')); });
    socket.on('error', error => error.code === 'ECONNREFUSED' ? resolve() : reject(new Error('Cannot check local app port')));
  });
}
try {
  await assertLocalUsersDatabase(db);
  // Fail before creating bookings or starting the app when CLI credentials expire.
  try { await stripe.checkout.sessions.list({ limit: 1 }); }
  catch { throw new Error('Stripe test authentication failed; renew the test key before running payment tests'); }
  await freeAppPort();
  relay = createServer(async (req, res) => {
    try {
      if (req.method !== 'POST' || req.url !== '/stripe') { res.writeHead(404).end(); return; }
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 1_000_000) { res.writeHead(413).end(); return; }
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks);
      const signature = req.headers['stripe-signature'];
      if (!signingSecret || typeof signature !== 'string') { res.writeHead(400).end(); return; }
      const event = stripe.webhooks.constructEvent(raw, signature, signingSecret);
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const booking = typeof bookingId === 'string' ? (await db.query(
        'SELECT id, "serviceTypeId", "guestEmail", "stripeCheckoutSessionId" FROM bookings WHERE id=$1', [bookingId])).rows[0] : undefined;
      if (!isOwnStripeCheckout(event, booking)) { res.writeHead(200).end('Ignored unrelated event'); return; }
      // Preserve the exact Stripe CLI bytes and signature. The app verifies again.
      const response = await fetch(`${targets.app.origin}/api/stripe/webhook`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': signature },
        body: raw, signal: AbortSignal.timeout(60_000),
      });
      console.log(`Synthetic checkout webhook: HTTP ${response.status}`);
      res.writeHead(response.status).end(await response.text());
    } catch { res.writeHead(400).end('Local relay rejected the event'); }
  });
  relay.listen(55625, '127.0.0.1');
  await once(relay, 'listening');
  const cliEnv = { ...process.env };
  if (settings.STRIPE_SECRET_KEY) cliEnv.STRIPE_API_KEY = settings.STRIPE_SECRET_KEY;
  const listener = child(process.env.LOCAL_STRIPE_CLI || 'stripe', ['listen', '--events', 'checkout.session.completed',
    '--events-from', '@self', '--forward-to', 'http://127.0.0.1:55625/stripe', '--skip-update'], cliEnv, line => {
    const found = line.match(/whsec_[A-Za-z0-9]+/);
    if (found) { signingSecret = found[0]; secrets.push(signingSecret); }
    // CLI event bodies and authentication material are never written to logs.
  });
  const deadline = Date.now() + 45_000;
  while (!signingSecret && Date.now() < deadline && listener.exitCode === null && !interrupted) await delay(200);
  if (!signingSecret) throw new Error('Stripe CLI did not establish the test webhook listener');
  console.log('Stripe test listener ready; only this local synthetic service is forwarded');
  const env = { ...testEnv, STRIPE_WEBHOOK_SECRET: signingSecret };
  delete env.LOCAL_STRIPE_CLI;
  const app = child(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3061'], env);
  let ready = false;
  const appDeadline = Date.now() + 120_000;
  while (Date.now() < appDeadline && app.exitCode === null && !interrupted) {
    try { ready = (await fetch(`${targets.app.origin}/booking`, { signal: AbortSignal.timeout(10_000) })).ok; } catch { /* starting */ }
    if (ready) break;
    await delay(500);
  }
  if (!ready) throw new Error('Local payment-test app did not become ready');
  const tests = child(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '-c', 'tests/local-users/stripe.config.ts',
    ...process.argv.slice(2)], env);
  const [code] = await once(tests, 'exit');
  process.exitCode = code ?? 1;
} catch (error) {
  safeOutput(error instanceof Error ? error.message : 'Stripe test run failed');
  process.exitCode = 1;
} finally {
  for (const process of children) if (process.exitCode === null) process.kill('SIGTERM');
  if (relay) { relay.closeAllConnections(); await new Promise(resolve => relay.close(resolve)); }
  await db.end();
}
