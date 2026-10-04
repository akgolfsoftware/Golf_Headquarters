import { execFileSync } from 'node:child_process';
import { writeFileSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import Stripe from 'stripe';
import { assertLocalUsersTargets } from './local-users-target.mjs';
import { assertStripeTestSettings } from './local-stripe-target.mjs';
import { localStripeTestAuth } from '../src/lib/stripe/local-test-auth.ts';

// Export only the existing Stripe CLI's short-lived test credential. Never read
// refresh tokens, live keys, browser credentials or other Keychain services.
try {
  if (process.env.LOCAL_STRIPE_RUNNER !== '1' || process.platform !== 'darwin') throw new Error();
  assertLocalUsersTargets(process.env);
  const identity = JSON.parse(execFileSync(process.env.LOCAL_STRIPE_CLI || 'stripe', ['whoami', '--format', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  if (identity.mode !== 'test') throw new Error();
  const read = key => {
    const value = execFileSync('/usr/bin/security', ['find-generic-password', '-s', 'StripeCLI', '-a', key, '-w'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    for (const [prefix, encoding] of [['go-keyring-base64:', 'base64'], ['go-keyring-encoded:', 'hex']]) {
      if (value.startsWith(prefix)) return Buffer.from(value.slice(prefix.length), encoding).toString();
    }
    return value;
  };
  const context = JSON.parse(read('oauth_active_context'));
  if (context.livemode !== false || context.account_id !== identity.account_id) throw new Error();
  const settings = { LOCAL_STRIPE_OAUTH_TOKEN: read('uat'), LOCAL_STRIPE_ACCOUNT: context.account_id };
  assertStripeTestSettings(settings);
  const env = { ...process.env, ...settings, NODE_ENV: 'development', LOCAL_STRIPE_E2E: '1' };
  const stripe = new Stripe('', { ...localStripeTestAuth(env), timeout: 15_000, maxNetworkRetries: 0 });
  const sessions = await stripe.checkout.sessions.list({ limit: 1 });
  if (sessions.data.some(session => session.livemode)) throw new Error();
  const target = resolve(import.meta.dirname, '../.codex/environments/brukere/.env.stripe-test');
  writeFileSync(target, Object.entries(settings).map(([key, value]) => `${key}=${value}\n`).join(''), { mode: 0o600 });
  chmodSync(target, 0o600);
  console.log('Existing Stripe CLI test session prepared in the private local test file.');
} catch {
  console.error('Could not prepare a test-only Stripe session. Complete Stripe CLI test login first. No credentials were printed.');
  process.exitCode = 1;
}
