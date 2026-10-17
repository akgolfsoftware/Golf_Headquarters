import assert from "node:assert/strict";
import { beforeEach, describe, mock, test } from "node:test";
import * as React from "react";
import { nodes, text, fyllId, send } from "./_flate-tre";

const slots: unknown[] = [];
let cursor = 0;
const byttet: string[] = [];
const lagret: Record<string, string> = {};
type SignUpInput = { email: string; password: string; options: { data: Record<string, unknown>; emailRedirectTo: string } };
let signUp: (input: SignUpInput) => Promise<{ data: { session: object | null }; error: { message: string } | null }>;

mock.module("react", { namedExports: { ...React, useState<T>(initial: T): [T, (value: T) => void] {
  const index = cursor++;
  if (!(index in slots)) slots[index] = initial;
  return [slots[index] as T, value => { slots[index] = value; }];
}, useEffect() {}, useSyncExternalStore: (_s: unknown, hent: () => unknown) => hent() } });
mock.module("next/link", { defaultExport: "a" });
mock.module("@/lib/supabase/client", { namedExports: { createClient: () => ({ auth: {
  signUp: (input: SignUpInput) => signUp(input),
  signInWithOAuth: async () => ({ error: null }),
} }) } });
mock.module("@/styles/flater-ny.css", { defaultExport: {} });
mock.module("@/styles/flater-ny-konto.css", { defaultExport: {} });
Object.assign(globalThis, {
  window: { location: { origin: "http://127.0.0.1:3061", replace: (p: string) => byttet.push(p) } },
  sessionStorage: { setItem: (k: string, v: string) => { lagret[k] = v; }, getItem: (k: string) => lagret[k] ?? null },
});

function trykk(tree: React.ReactNode, tekst: string) {
  const knapp = nodes(tree).find(node => node.type === "button" && text(node).includes(tekst));
  (knapp!.props.onClick as () => void)();
}

beforeEach(() => {
  slots.length = 0; cursor = 0; byttet.length = 0;
  for (const k of Object.keys(lagret)) delete lagret[k];
  signUp = async () => ({ data: { session: null }, error: null });
});

describe("AU-02 registrering i nytt design", async () => {
  const { Registrering } = await import("@/components/auth/precision/KontoSkjermer");
  const render = (props: { subscribe?: string; kilde?: "talenthq" } = {}) => { cursor = 0; return Registrering(props); };
  function fyllGyldig(passord = "langt-passord") {
    fyllId(render(), "rn", "Syntetisk Spiller");
    fyllId(render(), "re", "syntetisk@example.invalid");
    fyllId(render(), "rp", passord);
    const boks = nodes(render()).find(node => node.type === "input" && node.props.type === "checkbox");
    (boks!.props.onChange as (event: { target: { checked: boolean } }) => void)({ target: { checked: true } });
  }

  test("under 10 tegn kaller ikke signUp", async () => {
    let kalt = 0;
    signUp = async () => { kalt += 1; return { data: { session: null }, error: null }; };
    fyllGyldig("kort12345");
    await send(render());
    assert.equal(kalt, 0);
    assert.match(text(render()), /minst 10 tegn/);
    assert.deepEqual(byttet, []);
  });

  test("gyldig konto går til sjekk-e-post, med e-posten i sessionStorage og aldri i adressen", async () => {
    const mottatt: SignUpInput[] = [];
    signUp = async (input) => { mottatt.push(input); return { data: { session: null }, error: null }; };
    fyllGyldig();
    await send(render());
    assert.equal(mottatt.length, 1);
    assert.equal(mottatt[0].options.data.role, "PLAYER");
    assert.equal(mottatt[0].options.data.tier, "GRATIS");
    assert.equal(mottatt[0].options.data.firstName, "Syntetisk");
    assert.equal(mottatt[0].options.data.lastName, "Spiller");
    assert.match(mottatt[0].options.emailRedirectTo, /\/api\/auth\/oauth-callback\?next=%2Fauth%2Fonboarding$/);
    assert.deepEqual(byttet, ["/auth/check-email"]);
    assert.equal(lagret["ak-registrert-epost"], "syntetisk@example.invalid");
  });

  test("Full sender planen videre til oppstarten, forelder får aldri plan", async () => {
    signUp = async () => ({ data: { session: { user: "syntetisk" } }, error: null });
    fyllGyldig();
    trykk(render(), "Full");
    await send(render());
    assert.deepEqual(byttet, ["/auth/onboarding?subscribe=pro"]);
    slots.length = 0; byttet.length = 0;
    const mottatt: SignUpInput[] = [];
    signUp = async (input) => { mottatt.push(input); return { data: { session: { user: "x" } }, error: null }; };
    fyllGyldig();
    trykk(render(), "Forelder");
    await send(render({ subscribe: "pro" }));
    assert.equal(mottatt[0].options.data.role, "PARENT");
    assert.deepEqual(byttet, ["/auth/onboarding"]);
  });

  test("manglende vilkår og eksisterende e-post stopper", async () => {
    fyllId(render(), "rn", "Syntetisk");
    fyllId(render(), "rp", "langt-passord");
    await send(render());
    assert.match(text(render()), /vilkårene/);
    slots.length = 0;
    signUp = async () => ({ data: { session: null }, error: { message: "User already registered" } });
    fyllGyldig();
    await send(render());
    assert.match(text(render()), /finnes allerede/);
    assert.deepEqual(byttet, []);
  });

  test("TalentHQ sender kilde og viser ikke nivåvalg", async () => {
    const mottatt: SignUpInput[] = [];
    signUp = async (input) => { mottatt.push(input); return { data: { session: null }, error: null }; };
    fyllGyldig();
    assert.doesNotMatch(text(render({ kilde: "talenthq" })), /Velg nivå/);
    await send(render({ kilde: "talenthq" }));
    assert.equal(mottatt[0].options.data.kilde, "talenthq");
    assert.equal(mottatt[0].options.data.tier, "GRATIS");
  });
});
