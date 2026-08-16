// src/lib/__tests__/meg-shortcut-auth.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { extractBearerToken, shortcutTokenOk } from "@/lib/meg/shortcut-auth";

test("extractBearerToken: plukker tokenet ut av 'Bearer <token>'", () => {
  assert.equal(extractBearerToken("Bearer abc123"), "abc123");
});

test("extractBearerToken: godtar små bokstaver i 'bearer'", () => {
  assert.equal(extractBearerToken("bearer abc123"), "abc123");
});

test("extractBearerToken: null ved manglende header", () => {
  assert.equal(extractBearerToken(null), null);
});

test("extractBearerToken: null uten Bearer-prefiks", () => {
  assert.equal(extractBearerToken("abc123"), null);
  assert.equal(extractBearerToken("Basic abc123"), null);
});

test("extractBearerToken: null når det ikke er noe token etter 'Bearer '", () => {
  assert.equal(extractBearerToken("Bearer "), null);
  assert.equal(extractBearerToken("Bearer    "), null);
});

test("shortcutTokenOk: matcher riktig token", () => {
  assert.equal(shortcutTokenOk("Bearer s3cret-token", "s3cret-token"), true);
});

test("shortcutTokenOk: avviser feil token", () => {
  assert.equal(shortcutTokenOk("Bearer feil-token", "s3cret-token"), false);
});

test("shortcutTokenOk: avviser token med annen lengde (ingen krasj i timingSafeEqual)", () => {
  assert.equal(shortcutTokenOk("Bearer kort", "et-mye-lengre-hemmelig-token"), false);
});

test("shortcutTokenOk: avviser manglende header", () => {
  assert.equal(shortcutTokenOk(null, "s3cret-token"), false);
});

test("shortcutTokenOk: avviser tomt token", () => {
  assert.equal(shortcutTokenOk("Bearer ", "s3cret-token"), false);
});
