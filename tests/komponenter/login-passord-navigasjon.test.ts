import assert from "node:assert/strict";
import { after, beforeEach, describe, mock, test } from "node:test";
import * as React from "react";

const slots: unknown[] = [];
let cursor = 0;
const fullNavigasjoner: string[] = [];
const klientNavigasjoner: string[] = [];
type AuthSvar = { error: { message: string } | null };
type PassordInput = { email: string; password: string };
let innlogging: (input: PassordInput) => Promise<AuthSvar>;
const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { replace: (path: string) => fullNavigasjoner.push(path) } } });
after(() => {
  if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
  else Reflect.deleteProperty(globalThis, "window");
});
function useState<T>(initial: T): [T, (value: T) => void] {
  const index = cursor++;
  if (!(index in slots)) slots[index] = initial;
  return [slots[index] as T, value => { slots[index] = value; }];
}
mock.module("react", { namedExports: { ...React, useState } });
mock.module("next/link", { defaultExport: "a" });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ replace: (path: string) => klientNavigasjoner.push(path) }) } });
mock.module("@/lib/supabase/client", { namedExports: { createClient: () => ({ auth: { signInWithPassword: (input: PassordInput) => innlogging(input) } }) } });
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
function find(tree: React.ReactNode, predicate: (node: Node) => boolean): Node {
  const node = nodes(tree).find(predicate);
  assert.ok(node);
  return node;
}
beforeEach(() => {
  slots.length = 0; fullNavigasjoner.length = 0; klientNavigasjoner.length = 0;
  innlogging = async () => ({ error: null });
});
describe("ekte passordskjema navigerer etter Auth-resultatet", async () => {
  const { LoginView } = await import("@/components/auth/LoginView");
  const render = () => { cursor = 0; return LoginView(); };
  function skjema() {
    const metode = find(render(), node => node.type === "button" && text(node.props.children as React.ReactNode).trim() === "Logg inn med passord");
    (metode.props.onClick as () => void)();
    for (const [type, value] of [["email", "  syntetisk@example.invalid  "], ["password", "syntetisk-passord"]]) {
      const felt = find(render(), node => node.type === "input" && node.props.type === type);
      (felt.props.onChange as (event: { target: { value: string } }) => void)({ target: { value } });
    }
    const form = find(render(), node => node.type === "form");
    return () => (form.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
  }
  test("suksess venter på Auth og utløser nøyaktig én full sidenavigasjon", async () => {
    const ferdig: Array<(svar: AuthSvar) => void> = [];
    const mottatt: PassordInput[] = [];
    innlogging = input => { mottatt.push(input); return new Promise(resolve => ferdig.push(resolve)); };
    const pending = skjema()();
    assert.deepEqual(fullNavigasjoner, []);
    assert.deepEqual(klientNavigasjoner, []);
    assert.deepEqual(mottatt, [{ email: "syntetisk@example.invalid", password: "syntetisk-passord" }]);
    ferdig[0]({ error: null }); await pending;
    assert.deepEqual(fullNavigasjoner, ["/auth/etter-innlogging"]);
    assert.deepEqual(klientNavigasjoner, []);
  });
  test("avvist passord viser kjent feil og navigerer ikke", async () => {
    innlogging = async () => ({ error: { message: "Invalid login credentials" } });
    await skjema()();
    assert.match(text(render()), /Feil e-post eller passord/);
    assert.deepEqual(fullNavigasjoner, []); assert.deepEqual(klientNavigasjoner, []);
  });
  test("Auth-unntak viser generell feil og navigerer ikke", async () => {
    innlogging = async () => { throw new Error("Syntetisk Auth-feil"); };
    await skjema()();
    assert.match(text(render()), /Innlogging feilet. Prøv igjen/);
    assert.deepEqual(fullNavigasjoner, []); assert.deepEqual(klientNavigasjoner, []);
  });
});
