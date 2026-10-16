import test from "node:test";
import assert from "node:assert/strict";
import { localStripeTestAuth } from "./local-test-auth";

const env = {
  NODE_ENV: "development", LOCAL_STRIPE_E2E: "1", LOCAL_USERS_PROJECT: "ak-hq-brukere-20261001",
  LOCAL_STRIPE_OAUTH_TOKEN: "oak_synthetic", LOCAL_STRIPE_ACCOUNT: "acct_synthetic",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3061", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:55621",
  DATABASE_URL: "postgresql://synthetic:synthetic@127.0.0.1:55622/postgres",
  DIRECT_URL: "postgresql://synthetic:synthetic@127.0.0.1:55622/postgres",
};
test("normal Stripe key authentication has no local override", () => {
  assert.deepEqual(localStripeTestAuth({ STRIPE_SECRET_KEY: "sk_test_synthetic" }), {});
});
test("local OAuth forces the selected account and test mode on every request", async () => {
  const request = { host: "api.stripe.com", port: "443", protocol: "https", path: "/v1/checkout/sessions", method: "GET", body: "", headers: {} };
  await localStripeTestAuth(env).authenticator!(request);
  assert.deepEqual(request.headers, { Authorization: "Bearer oak_synthetic", "Stripe-Context": "acct_synthetic", "Stripe-Livemode": "false" });
});
test("OAuth cannot activate on production, hosted data, mixed keys or a different local stack", () => {
  for (const change of [
    { NODE_ENV: "production" }, { LOCAL_STRIPE_E2E: "0" }, { STRIPE_SECRET_KEY: "sk_live_synthetic" },
    { DATABASE_URL: "postgresql://synthetic:synthetic@db.example.com:55622/postgres" },
    { DIRECT_URL: env.DIRECT_URL + "?host=example.com" }, { LOCAL_USERS_PROJECT: "other" },
    { NEXT_PUBLIC_APP_URL: "https://akgolf.no" }, { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" },
  ]) assert.throws(() => localStripeTestAuth({ ...env, ...change }));
});
test("OAuth does not disclose the token to a different API host or HTTP", async () => {
  for (const change of [{ host: "example.com" }, { protocol: "http" }, { port: "8443" }]) {
    const request = { host: "api.stripe.com", port: "443", protocol: "https", path: "/", method: "GET", body: "", headers: {}, ...change };
    await assert.rejects(localStripeTestAuth(env).authenticator!(request));
    assert.deepEqual(request.headers, {});
  }
});
