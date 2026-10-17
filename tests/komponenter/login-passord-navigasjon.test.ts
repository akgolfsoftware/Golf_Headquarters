import assert from "node:assert/strict";
import { beforeEach, describe, mock, test } from "node:test";
import * as React from "react";
import { nodes, text, fyllId, send } from "./_flate-tre";

type PassordInput = { email: string; password: string };
type AuthSvar = { error: { message: string } | null };
const slots: unknown[] = [];
let cursor = 0;
const fullNavigasjoner: string[] = [];
let innlogging: (input: PassordInput) => Promise<AuthSvar>;
mock.module("react", { namedExports: { ...React, useState<T>(initial: T): [T, (value: T) => void] {
  const index = cursor++;
  if (!(index in slots)) slots[index] = initial;
  return [slots[index] as T, value => { slots[index] = value; }];
}, useEffect() {} } });
mock.module("@/lib/supabase/client", { namedExports: { createClient: () => ({ auth: { signInWithPassword: (input: PassordInput) => innlogging(input) } }) } });
mock.module("@/styles/flater-ny.css", { defaultExport: {} });
mock.module("@/styles/flater-ny-konto.css", { defaultExport: {} });
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "https://syntetisk.example", replace: (p: string) => fullNavigasjoner.push(p) } } });

beforeEach(() => {
  slots.length = 0; fullNavigasjoner.length = 0;
  innlogging = async () => ({ error: null });
});

describe("AU-01 innlogging med passord navigerer etter Auth-resultatet", async () => {
  const { Innlogging } = await import("@/components/auth/precision/KontoSkjermer");
  const render = (props: { next?: string; feilkode?: string } = {}) => { cursor = 0; return Innlogging(props); };
  function fyll(props: { next?: string } = {}) {
    fyllId(render(props), "le", "  syntetisk@example.invalid  ");
    fyllId(render(props), "lp", "syntetisk-passord");
  }

  test("viser bare Google og passord, ingen magisk lenke eller BankID", () => {
    const t = text(render());
    assert.match(t, /Logg inn med Google/);
    assert.doesNotMatch(t, /magisk|BankID|SMS|kode/i);
  });

  test("suksess venter på Auth og utløser én full sidenavigasjon", async () => {
    const ferdig: Array<(svar: AuthSvar) => void> = [];
    const mottatt: PassordInput[] = [];
    innlogging = (input) => { mottatt.push(input); return new Promise((resolve) => ferdig.push(resolve)); };
    fyll();
    const pending = send(render());
    assert.deepEqual(fullNavigasjoner, []);
    assert.deepEqual(mottatt, [{ email: "syntetisk@example.invalid", password: "syntetisk-passord" }]);
    ferdig[0]({ error: null }); await pending;
    assert.deepEqual(fullNavigasjoner, ["/auth/etter-innlogging"]);
  });

  test("next fra proxyen brukes etter innlogging", async () => {
    fyll({ next: "/portal/plan" });
    await send(render({ next: "/portal/plan" }));
    assert.deepEqual(fullNavigasjoner, ["/portal/plan"]);
  });

  test("avvist passord og Auth-unntak viser feil og navigerer ikke", async () => {
    innlogging = async () => ({ error: { message: "Invalid login credentials" } });
    fyll();
    await send(render());
    assert.match(text(render()), /stemmer ikke/);
    slots.length = 0;
    innlogging = async () => { throw new Error("Syntetisk Auth-feil"); };
    fyll();
    await send(render());
    assert.match(text(render()), /virket ikke/);
    assert.deepEqual(fullNavigasjoner, []);
  });

  test("feilkode fra oauth-callback vises", () => {
    assert.match(text(render({ feilkode: "invalid-code" })), /utløpt/);
    assert.equal(nodes(render()).some((n) => n.props.href === "/auth/forgot-password"), true);
  });
});
