// src/lib/__tests__/meg-env.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readMegEnv } from "@/lib/meg/env";

test("readMegEnv returnerer null når vars mangler", () => {
  const env = readMegEnv({});
  assert.equal(env, null);
});

test("readMegEnv returnerer config når alle vars finnes", () => {
  const env = readMegEnv({
    MEG_SUPABASE_URL: "https://x.supabase.co",
    MEG_SUPABASE_SERVICE_ROLE_KEY: "key",
    MEG_TELEGRAM_BOT_TOKEN: "tok",
    MEG_TELEGRAM_WEBHOOK_SECRET: "sec",
    MEG_TELEGRAM_ALLOWED_CHAT_ID: "12345",
  });
  assert.ok(env);
  assert.equal(env.allowedChatId, "12345");
  assert.equal(env.supabaseUrl, "https://x.supabase.co");
});
