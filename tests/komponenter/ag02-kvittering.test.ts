import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import * as React from "react";
import { nodes, text } from "./_flate-tre";
import type { KoResultat } from "@/components/admin/precision/ag02-handlinger";

const slots: unknown[] = [];
let cursor = 0;
let refresh = 0;
let run: () => Promise<KoResultat>;
const transitions: Promise<void>[] = [];
mock.module("react", { namedExports: { ...React,
  useState<T>(initial: T | (() => T)): [T, (next: T | ((old: T) => T)) => void] {
    const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === "function" ? (initial as () => T)() : initial;
    return [slots[i] as T, next => { slots[i] = typeof next === "function" ? (next as (old: T) => T)(slots[i] as T) : next; }];
  },
  useMemo: (fn: () => unknown) => fn(),
  useTransition: () => [false, (fn: () => Promise<void>) => { transitions.push(fn()); }],
} });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ refresh: () => { refresh++; } }) } });
mock.module("@/components/admin/precision/ag02-handlinger", { namedExports: {
  KO_UKJENT_UTFALL: "Handlingen kunne ikke bekreftes. Oppdater oversikten før du prøver igjen.",
  utforKoHandling: () => run(),
} });
mock.module("@/components/admin/agencyos-ny/ny", { namedExports: {
  Knapp: "button", KnappLenke: "a", Feil: "section", Laster: "section", Nokkelverdier: "section", Pille: "span", Seksjon: "section", Tom: "section", Topp: "header",
  Varsel: ({ tittel, children }: { tittel?: string; children?: React.ReactNode }) => React.createElement("div", { role: "alert" }, tittel, children),
} });
for (const css of ["agencyos-ny-mer.css", "agencyos-ny-ko.css"]) mock.module(`@/styles/${css}`, { namedExports: {} });
let AG02Ko: typeof import("@/components/admin/precision/AG02Ko").AG02Ko;
before(async () => { ({ AG02Ko } = await import("@/components/admin/precision/AG02Ko")); });
beforeEach(() => { slots.length = 0; transitions.length = 0; refresh = 0; run = async () => ({ ok: true }); });
const render = () => {
  cursor = 0;
  return AG02Ko({ data: { godkjenninger: [{ id: "synthetic", who: "Syntetisk spiller", title: "Syntetisk forslag", kind: "PlanAction", from: "Agent", at: "I dag", status: "Venter", kilde: "agent" }], agentko: [], tester: [], dubletter: [], moderering: [], epost: [] } });
};
function button(label: string) { return nodes(render()).find(n => n.type === "button" && text(n).trim() === label); }
async function click(label: string) {
  const b = button(label); assert.ok(b); (b.props.onClick as () => void)(); await Promise.all(transitions);
}
test("known no-op refreshes without removing the proposal or showing success", async () => {
  run = async () => ({ ok: false, feil: "Forslaget er allerede behandlet eller erstattet.", oppdater: true });
  await click("Godkjenn");
  assert.ok(button("Godkjenn")); assert.match(text(render()), /allerede behandlet/);
  assert.doesNotMatch(text(render()), /Forslaget er godkjent|Ingenting er lagret/);
  assert.equal(refresh, 1);
  await click("Avvis"); assert.ok(button("Avvis")); assert.equal(refresh, 2);
});
test("unknown returned or thrown outcome keeps the proposal and never claims nothing was saved", async () => {
  run = async () => ({ ok: false, feil: "Handlingen kunne ikke bekreftes." });
  await click("Avvis"); assert.ok(button("Avvis")); assert.equal(refresh, 0);
  run = async () => { throw Error("synthetic private detail"); };
  await click("Godkjenn");
  assert.ok(button("Godkjenn")); assert.match(text(render()), /Handlingen kunne ikke bekreftes/);
  assert.doesNotMatch(text(render()), /private detail|Ingenting er lagret|Forslaget er godkjent/);
  assert.equal(refresh, 0);
});
test("only a confirmed success removes the proposal and refreshes", async () => {
  let resolve!: (result: KoResultat) => void;
  run = () => new Promise(done => { resolve = done; });
  const pending = click("Godkjenn");
  assert.ok(button("Godkjenn")); assert.equal(refresh, 0);
  resolve({ ok: true }); await pending;
  assert.equal(button("Godkjenn"), undefined);
  assert.match(text(render()), /Forslaget er godkjent/); assert.equal(refresh, 1);
});
