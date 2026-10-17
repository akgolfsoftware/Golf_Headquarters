import assert from "node:assert/strict";
import { beforeEach, describe, mock, test } from "node:test";
import * as React from "react";
import { nodes, text, fyllId, send } from "./_flate-tre";

const slots: unknown[] = [];
let cursor = 0;
const byttet: string[] = [];
let oppdater: (input: { password: string }) => Promise<{ error: { message: string } | null }>;
let reset: (email: string, opts: { redirectTo: string }) => Promise<{ error: { message: string } | null }>;
mock.module("react", { namedExports: { ...React, useState<T>(initial: T): [T, (value: T) => void] {
  const index = cursor++;
  if (!(index in slots)) slots[index] = initial;
  return [slots[index] as T, value => { slots[index] = value; }];
}, useEffect() {}, useSyncExternalStore: (_s: unknown, hent: () => unknown) => hent() } });
mock.module("next/link", { defaultExport: "a" });
mock.module("@/lib/supabase/client", { namedExports: { createClient: () => ({ auth: {
  updateUser: (input: { password: string }) => oppdater(input),
  resetPasswordForEmail: (email: string, opts: { redirectTo: string }) => reset(email, opts),
} }) } });
mock.module("@/styles/flater-ny.css", { defaultExport: {} });
mock.module("@/styles/flater-ny-konto.css", { defaultExport: {} });
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "https://syntetisk.example", replace: (p: string) => byttet.push(p) } } });

beforeEach(() => {
  slots.length = 0; cursor = 0; byttet.length = 0;
  oppdater = async () => ({ error: null });
  reset = async () => ({ error: null });
});

describe("AU-03 passord i nytt design", async () => {
  const { NyttPassord, GlemtPassord } = await import("@/components/auth/precision/KontoSkjermer");
  const renderReset = () => { cursor = 0; return NyttPassord(); };
  const renderGlemt = () => { cursor = 0; return GlemtPassord(); };

  test("under 10 tegn lagres ikke", async () => {
    let kalt = 0;
    oppdater = async () => { kalt += 1; return { error: null }; };
    fyllId(renderReset(), "np1", "kort12345");
    fyllId(renderReset(), "np2", "kort12345");
    await send(renderReset());
    assert.equal(kalt, 0);
    assert.match(text(renderReset()), /minst 10 tegn/);
    assert.deepEqual(byttet, []);
  });

  test("gyldig passord lagres og sender videre etter rolle", async () => {
    const mottatt: string[] = [];
    oppdater = async (input) => { mottatt.push(input.password); return { error: null }; };
    fyllId(renderReset(), "np1", "langt-passord");
    fyllId(renderReset(), "np2", "langt-passord");
    await send(renderReset());
    assert.deepEqual(mottatt, ["langt-passord"]);
    assert.deepEqual(byttet, ["/auth/etter-innlogging"]);
  });

  test("ulike passord og utløpt lenke navigerer ikke", async () => {
    fyllId(renderReset(), "np1", "langt-passord");
    fyllId(renderReset(), "np2", "annet-passord");
    await send(renderReset());
    assert.match(text(renderReset()), /ikke like/);
    slots.length = 0;
    oppdater = async () => ({ error: { message: "Auth session missing" } });
    fyllId(renderReset(), "np1", "langt-passord");
    fyllId(renderReset(), "np2", "langt-passord");
    await send(renderReset());
    assert.match(text(renderReset()), /utløpt/);
    assert.deepEqual(byttet, []);
  });

  test("glemt passord sender reset til samme origin og viser samme svar uansett konto", async () => {
    const mottatt: Array<{ email: string; redirectTo: string }> = [];
    reset = async (email, opts) => { mottatt.push({ email, redirectTo: opts.redirectTo }); return { error: null }; };
    fyllId(renderGlemt(), "ge", "syntetisk@example.invalid");
    await send(renderGlemt());
    assert.deepEqual(mottatt, [{ email: "syntetisk@example.invalid", redirectTo: "https://syntetisk.example/auth/reset-password" }]);
    assert.match(text(renderGlemt()), /Lenken er sendt/);
    assert.equal(nodes(renderGlemt()).some((n) => n.props.href === "/auth/login"), true);
  });
});
