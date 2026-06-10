// src/lib/__tests__/meg-telegram.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { isAuthorizedUpdate, webhookSecretOk } from "@/lib/meg/telegram";

const cfg = { webhookSecret: "s3cret", allowedChatId: "999" };

test("webhookSecretOk: matcher riktig secret, avviser feil og null", () => {
  assert.equal(webhookSecretOk("s3cret", "s3cret"), true);
  assert.equal(webhookSecretOk("feil", "s3cret"), false);
  assert.equal(webhookSecretOk(null, "s3cret"), false);
});

test("godtar riktig secret + riktig chat-id", () => {
  const ok = isAuthorizedUpdate(
    { headerSecret: "s3cret", chatId: 999 },
    cfg,
  );
  assert.equal(ok, true);
});

test("avviser feil secret", () => {
  const ok = isAuthorizedUpdate({ headerSecret: "feil", chatId: 999 }, cfg);
  assert.equal(ok, false);
});

test("avviser feil chat-id", () => {
  const ok = isAuthorizedUpdate({ headerSecret: "s3cret", chatId: 111 }, cfg);
  assert.equal(ok, false);
});

test("avviser manglende secret", () => {
  const ok = isAuthorizedUpdate({ headerSecret: null, chatId: 999 }, cfg);
  assert.equal(ok, false);
});
