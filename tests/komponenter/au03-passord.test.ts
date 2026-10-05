import assert from "node:assert/strict";
import { beforeEach, describe, mock, test } from "node:test";
import * as React from "react";

const slots: unknown[] = [];
let cursor = 0;
const pushet: string[] = [];
const oppfrisket: number[] = [];
let oppdater: (input: { password: string }) => Promise<{ error: { message: string } | null }>;
let reset: (email: string, opts: { redirectTo: string }) => Promise<{ error: { message: string } | null }>;
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
  updateUser: (input: { password: string }) => oppdater(input),
  resetPasswordForEmail: (email: string, opts: { redirectTo: string }) => reset(email, opts),
} }) } });
mock.module("@/styles/precision-athletics.css", { defaultExport: {} });
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "https://syntetisk.example" } } });

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
beforeEach(() => {
  slots.length = 0; cursor = 0; pushet.length = 0; oppfrisket.length = 0;
  oppdater = async () => ({ error: null });
  reset = async () => ({ error: null });
});

describe("AU-03 passord beholder eksisterende Auth-regler", async () => {
  const { ResetPasswordV2 } = await import("@/components/portal/v2/ResetPasswordV2");
  const { ForgotPasswordV2 } = await import("@/components/portal/v2/ForgotPasswordV2");
  const renderReset = () => { cursor = 0; return ResetPasswordV2(); };
  const renderGlemt = () => { cursor = 0; return ForgotPasswordV2(); };

  function fyll(tree: React.ReactNode, verdi: string, indeks: number) {
    const felt = nodes(tree).filter(node => node.type === "input" && (node.props.type === "password" || node.props.type === "text"));
    (felt[indeks].props.onChange as (event: { target: { value: string } }) => void)({ target: { value: verdi } });
  }

  test("under 8 tegn lagres ikke, selv om tegningen ber om 10", async () => {
    let kalt = 0;
    oppdater = async () => { kalt += 1; return { error: null }; };
    fyll(renderReset(), "kort1", 0);
    fyll(renderReset(), "kort1", 1);
    const form = nodes(renderReset()).find(node => node.type === "form");
    await (form!.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
    assert.equal(kalt, 0);
    assert.match(text(renderReset()), /minst 8 tegn/);
    assert.deepEqual(pushet, []);
  });

  test("8 tegn uten tall lagres og åpner portalen", async () => {
    const mottatt: string[] = [];
    oppdater = async (input) => { mottatt.push(input.password); return { error: null }; };
    fyll(renderReset(), "uten-tall", 0);
    fyll(renderReset(), "uten-tall", 1);
    const form = nodes(renderReset()).find(node => node.type === "form");
    await (form!.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
    assert.deepEqual(mottatt, ["uten-tall"]);
    assert.deepEqual(pushet, ["/portal"]);
    assert.equal(oppfrisket.length, 1);
  });

  test("ulike passord og utløpt lenke navigerer ikke", async () => {
    fyll(renderReset(), "like-nok", 0);
    fyll(renderReset(), "ikke-like", 1);
    let form = nodes(renderReset()).find(node => node.type === "form");
    await (form!.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
    assert.match(text(renderReset()), /ikke like/);
    slots.length = 0;
    oppdater = async () => ({ error: { message: "Auth session missing" } });
    fyll(renderReset(), "like-nok", 0);
    fyll(renderReset(), "like-nok", 1);
    form = nodes(renderReset()).find(node => node.type === "form");
    await (form!.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
    assert.match(text(renderReset()), /utløpt/);
    assert.deepEqual(pushet, []);
  });

  test("glemt passord sender reset til samme origin og reset-rute", async () => {
    const mottatt: Array<{ email: string; redirectTo: string }> = [];
    reset = async (email, opts) => { mottatt.push({ email, redirectTo: opts.redirectTo }); return { error: null }; };
    const felt = nodes(renderGlemt()).find(node => node.type === "input" && node.props.type === "email");
    (felt!.props.onChange as (event: { target: { value: string } }) => void)({ target: { value: "syntetisk@example.invalid" } });
    const form = nodes(renderGlemt()).find(node => node.type === "form");
    await (form!.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
    assert.deepEqual(mottatt, [{ email: "syntetisk@example.invalid", redirectTo: "https://syntetisk.example/auth/reset-password" }]);
    assert.match(text(renderGlemt()), /Sjekk e-posten/);
  });
});
