import assert from "node:assert/strict";
import { beforeEach, describe, mock, test } from "node:test";
import * as React from "react";

const slots: unknown[] = [];
let cursor = 0;
const pushet: string[] = [];
const oppfrisket: number[] = [];
type SignUpInput = {
  email: string;
  password: string;
  options: { data: Record<string, unknown> };
};
let signUp: (input: SignUpInput) => Promise<{ data: { session: object | null }; error: { message: string } | null }>;

mock.module("react", { namedExports: { ...React, useState<T>(initial: T): [T, (value: T) => void] {
  const index = cursor++;
  if (!(index in slots)) slots[index] = initial;
  return [slots[index] as T, value => { slots[index] = value; }];
} } });
mock.module("next/link", { defaultExport: "a" });
mock.module("next/navigation", { namedExports: { useRouter: () => ({
  push: (path: string) => pushet.push(path),
  refresh: () => oppfrisket.push(1),
}) } });
mock.module("@/lib/supabase/client", { namedExports: { createClient: () => ({ auth: {
  signUp: (input: SignUpInput) => signUp(input),
  signInWithOAuth: async () => ({ error: null }),
} }) } });
mock.module("@/styles/precision-athletics.css", { defaultExport: {} });

type Node = React.ReactElement<Record<string, unknown>>;
function nodes(tree: React.ReactNode): Node[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!React.isValidElement<Record<string, unknown>>(tree)) return [];
  return [tree, ...nodes(tree.props.children as React.ReactNode)];
}
function text(tree: React.ReactNode): string {
  if (Array.isArray(tree)) return tree.map(text).join(" ");
  if (React.isValidElement<Record<string, unknown>>(tree)) return text(tree.props.children as React.ReactNode);
  return typeof tree === "string" ? tree : "";
}
function fyll(tree: React.ReactNode, verdi: string, type: string, indeks: number) {
  const felt = nodes(tree).filter(node => node.type === "input" && node.props.type === type);
  (felt[indeks].props.onChange as (event: { target: { value: string } }) => void)({ target: { value: verdi } });
}

beforeEach(() => {
  slots.length = 0;
  cursor = 0;
  pushet.length = 0;
  oppfrisket.length = 0;
  signUp = async () => ({ data: { session: null }, error: null });
});

describe("AU-02 registrering beholder eksisterende Auth-regler", async () => {
  const { SignupV2 } = await import("@/components/portal/v2/SignupV2");
  const { CheckEmailV2 } = await import("@/components/portal/v2/CheckEmailV2");
  const { BankIDV2 } = await import("@/components/portal/v2/BankIDV2");
  const render = (props?: { subscribe?: string; kilde?: "talenthq" }) => {
    cursor = 0;
    return SignupV2(props);
  };

  async function send(tree: React.ReactNode) {
    const form = nodes(tree).find(node => node.type === "form");
    await (form!.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
  }

  function fyllGyldig(passord = "uten-tall") {
    fyll(render(), "Syntetisk", "text", 0);
    fyll(render(), "Spiller", "text", 1);
    fyll(render(), "syntetisk@example.invalid", "email", 0);
    fyll(render(), passord, "password", 0);
    fyll(render(), passord, "password", 1);
    const boks = nodes(render()).find(node => node.type === "input" && node.props.type === "checkbox");
    (boks!.props.onChange as (event: { target: { checked: boolean } }) => void)({ target: { checked: true } });
  }

  test("under 8 tegn kaller ikke signUp", async () => {
    let kalt = 0;
    signUp = async () => { kalt += 1; return { data: { session: null }, error: null }; };
    fyllGyldig("kort1");
    await send(render());
    assert.equal(kalt, 0);
    assert.match(text(render()), /minst 8 tegn/);
    assert.deepEqual(pushet, []);
  });

  test("9 tegn uten tall oppretter konto og går til sjekk-e-post", async () => {
    const mottatt: SignUpInput[] = [];
    signUp = async (input) => { mottatt.push(input); return { data: { session: null }, error: null }; };
    fyllGyldig("uten-tall");
    await send(render());
    assert.equal(mottatt.length, 1);
    assert.equal(mottatt[0].email, "syntetisk@example.invalid");
    assert.equal(mottatt[0].password, "uten-tall");
    assert.equal(mottatt[0].options.data.package, "PERFORMANCE_PRO");
    assert.equal(mottatt[0].options.data.monthlyCredits, 4);
    assert.equal(mottatt[0].options.data.tier, "PRO");
    assert.equal(mottatt[0].options.data.role, "PLAYER");
    assert.deepEqual(pushet, ["/auth/check-email"]);
  });

  test("ulike passord, manglende samtykke og eksisterende e-post stopper", async () => {
    fyll(render(), "like-nok1", "password", 0);
    fyll(render(), "ikke-like", "password", 1);
    await send(render());
    assert.match(text(render()), /ikke like/);
    slots.length = 0;
    fyll(render(), "like-nok1", "password", 0);
    fyll(render(), "like-nok1", "password", 1);
    await send(render());
    assert.match(text(render()), /vilkårene/);
    slots.length = 0;
    signUp = async () => ({ data: { session: null }, error: { message: "User already registered" } });
    fyllGyldig();
    await send(render());
    assert.match(text(render()), /finnes allerede/);
    assert.deepEqual(pushet, []);
  });

  test("aktiv sesjon går til onboarding, og TalentHQ sender ikke pakke", async () => {
    signUp = async () => ({ data: { session: { user: "syntetisk" } }, error: null });
    fyllGyldig();
    await send(render({ subscribe: "pro" }));
    assert.deepEqual(pushet, ["/auth/onboarding?subscribe=pro"]);
    assert.equal(oppfrisket.length, 1);
    slots.length = 0;
    pushet.length = 0;
    const mottatt: SignUpInput[] = [];
    signUp = async (input) => { mottatt.push(input); return { data: { session: null }, error: null }; };
    fyllGyldig();
    await send(render({ kilde: "talenthq" }));
    assert.equal(mottatt[0].options.data.tier, "GRATIS");
    assert.equal(mottatt[0].options.data.kilde, "talenthq");
    assert.equal(mottatt[0].options.data.package, undefined);
    assert.deepEqual(pushet, ["/auth/check-email"]);
  });

  test("sjekk-e-post og BankID beholder ærlige handlinger", () => {
    const sjekk = CheckEmailV2();
    assert.match(text(sjekk), /Sjekk e-posten din/);
    assert.equal(nodes(sjekk).some(node => node.props.href === "/auth/signup"), true);
    assert.equal(nodes(sjekk).some(node => node.props.href === "/auth/login"), true);
    assert.doesNotMatch(text(sjekk), /24 timer/);
    const bank = BankIDV2();
    assert.match(text(bank), /ikke tilgjengelig|etter beta/i);
    assert.equal(nodes(bank).some(node => node.props.href === "/auth/login"), true);
  });
});
