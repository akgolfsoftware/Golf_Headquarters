import assert from "node:assert/strict";
import { test } from "node:test";
import {
  erHemmeligFelt,
  sanitizeMessage,
  sanitizeMeta,
} from "./error-sanitize";

const EPOST = "anders@akgolf.no";
const TLF = "90012345";
const DB_URL =
  "postgresql://produser:SuperHemmeligPassord@db.dcnxoztjtdqoidaekxry.supabase.co:5432/postgres";
const STRIPE = "sk_test_51HemmeligNokkelXYZABC";
const WHSEC = "whsec_abcHemmeligWebhook123";
const BEARER = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc";

function inneholderHemmelighet(s: string): string[] {
  return [EPOST, TLF, DB_URL, STRIPE, WHSEC, "SuperHemmeligPassord", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"].filter(
    (h) => s.includes(h),
  );
}

test("sanitizeMessage fjerner e-post, db-url, nøkler og bearer", () => {
  const raw = `Feil for ${EPOST} mot ${DB_URL} med ${STRIPE} og ${WHSEC} ${BEARER}`;
  const clean = sanitizeMessage(raw);
  assert.deepEqual(inneholderHemmelighet(clean), []);
  assert.match(clean, /e-post-fjernet/);
  assert.match(clean, /db-url-fjernet/);
  assert.match(clean, /nøkkel-fjernet/);
  assert.match(clean, /Bearer \[nøkkel-fjernet\]/);
});

test("sanitizeMessage fjerner telefonnummer", () => {
  const clean = sanitizeMessage(`Ring ${TLF} ved feil`);
  assert.equal(clean.includes(TLF), false);
  assert.match(clean, /tlf-fjernet/);
});

test("erHemmeligFelt treffer kjente og normaliserte navn", () => {
  assert.equal(erHemmeligFelt("password"), true);
  assert.equal(erHemmeligFelt("DATABASE_URL"), true);
  assert.equal(erHemmeligFelt("stripeSecretKey"), true);
  assert.equal(erHemmeligFelt("refresh_token"), true);
  assert.equal(erHemmeligFelt("bookingId"), false);
  assert.equal(erHemmeligFelt("context"), false);
  assert.equal(erHemmeligFelt("userId"), false);
});

test("sanitizeMeta redigerer hemmelige felt og bevarer trygge", () => {
  const clean = sanitizeMeta({
    email: EPOST,
    password: "passord-verdi-xyz",
    DATABASE_URL: DB_URL,
    stripeSecretKey: STRIPE,
    bookingId: "bk_ok",
    note: `bruker ${EPOST} ${DB_URL}`,
    nested: { accessToken: "abc", count: 2 },
  }) as Record<string, unknown>;
  const dump = JSON.stringify(clean);
  assert.deepEqual(inneholderHemmelighet(dump), []);
  assert.equal(dump.includes("passord-verdi-xyz"), false);
  assert.equal(clean.email, "[REDACTED]");
  assert.equal(clean.password, "[REDACTED]");
  assert.equal(clean.DATABASE_URL, "[REDACTED]");
  assert.equal(clean.stripeSecretKey, "[REDACTED]");
  assert.equal(clean.bookingId, "bk_ok");
  assert.equal((clean.nested as { accessToken: string; count: number }).count, 2);
  assert.equal((clean.nested as { accessToken: string }).accessToken, "[REDACTED]");
  assert.match(String(clean.note), /e-post-fjernet/);
  assert.match(String(clean.note), /db-url-fjernet/);
});
