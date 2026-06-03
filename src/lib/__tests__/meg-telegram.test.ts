// src/lib/__tests__/meg-telegram.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { isAuthorizedUpdate } from "@/lib/meg/telegram";

const cfg = { webhookSecret: "s3cret", allowedChatId: "999" };

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
