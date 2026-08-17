// src/lib/__tests__/meg-shortcut-env.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readMegShortcutEnv } from "@/lib/meg/env";

test("readMegShortcutEnv returnerer null når token mangler", () => {
  const env = readMegShortcutEnv({});
  assert.equal(env, null);
});

test("readMegShortcutEnv returnerer null når token er tom streng", () => {
  const env = readMegShortcutEnv({ MEG_SHORTCUT_TOKEN: "" });
  assert.equal(env, null);
});

test("readMegShortcutEnv returnerer token når satt", () => {
  const env = readMegShortcutEnv({ MEG_SHORTCUT_TOKEN: "hemmelig-token" });
  assert.ok(env);
  assert.equal(env.token, "hemmelig-token");
});
