import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import * as React from "react";
import { isoUkeIdentitet, tommeUkeplandetaljer } from "@/lib/workbench/ukeplan-schema";
import { syklusUker, type TreukerssyklusData, type LagreSyklusInput, type KopierSyklusInput, type SyklusUke } from "@/lib/workbench/treukerssyklus";
const states = new Map<string, unknown[]>(); let context = "", cursor = 0;
const effects: Array<() => void> = [];
function draw<T>(name: string, fn: () => T): T { context = name; cursor = 0; return fn(); }
function useState<T>(initial: T): [T, (value: T | ((old: T) => T)) => void] {
  const slots = states.get(context) ?? []; states.set(context, slots); const index = cursor++;
  if (!(index in slots)) slots[index] = initial;
  return [slots[index] as T, value => { slots[index] = typeof value === "function" ? (value as (old: T) => T)(slots[index] as T) : value; }];
}
mock.module("react", { namedExports: { ...React, useState, useEffect: (fn: () => void) => { if (!effects.length && !states.has("loaded")) { effects.push(fn); states.set("loaded", []); } } } });
mock.module("next/link", { defaultExport: "a" });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ replace() {} }) } });
for (const css of ["precision-a4.css", "precision-a9.css"]) mock.module(`@/styles/${css}`, { namedExports: {} });
mock.module("@/components/precision/pa", { namedExports: { Knapp: "button", Ikon: "i", AKSE_NAVN: {} } });
mock.module("@/components/precision/pa-a4", { namedExports: { Ark: "sheet" } });
mock.module("@/components/precision/pa-a5", { namedExports: { InlineVarsel: "warning" } });
mock.module("@/components/precision/pa-a2", { namedExports: { Sokefelt: "input" } });
mock.module("@/components/precision/pa-workbench", { namedExports: { AKSER: [], Caps: "small", Valgpille: "pill", akseFra: () => "fys", akseStil: () => ({}) } });
mock.module("@/components/workbench/OvelseSkjema", { namedExports: { OvelseSkjema: "exercise" } });
const anchor = "2032-12-20";
const fixture = (): TreukerssyklusData => { const weeks: SyklusUke[] = syklusUker(anchor).map((weekStart, i) => ({ weekStart, expected: "a".repeat(64), sessions: [], excludedSessions: 0, plan: { playerId: "syntetisk", ...isoUkeIdentitet(weekStart), weekType: "UTVIKLING", notes: [], planningDetails: { ...tommeUkeplandetaljer(), cycle: { version: 1, id: "00000000-0000-4000-8000-000000000001", anchorWeek: anchor, position: i, operationId: "00000000-0000-4000-8000-000000000001", fingerprint: "a".repeat(64) } } } })); return { weeks: [weeks[0], weeks[1], weeks[2]] }; };
let loaded = fixture();
const saves: LagreSyklusInput[] = [], copies: KopierSyklusInput[] = []; let fail = true;
mock.module("@/lib/workbench/treukerssyklus-actions", { namedExports: {
  lastTreukerssyklus: async (input: { targetWeek?: string }) => ({ ok: true, data: input.targetWeek ? { ...loaded, targets: loaded.weeks.map(w => ({ ...w, plan: null })) } : loaded }),
  lagreTreukerssyklus: async (input: LagreSyklusInput) => { saves.push(input); if (fail) return { ok: false, error: "Syntetisk konflikt" }; loaded = { weeks: loaded.weeks.map((w, i) => ({ ...w, plan: { ...w.plan!, ...input.weeks[i].fields, planningDetails: { ...input.weeks[i].fields.planningDetails!, cycle: w.plan!.planningDetails!.cycle } } })) as TreukerssyklusData["weeks"] }; return { ok: true, data: loaded }; },
  kopierTreukerssyklus: async (input: KopierSyklusInput) => { copies.push(input); return { ok: true, data: fixture() }; },
  opplosTreukerssyklus: async () => ({ ok: true, data: fixture() }),
} });
type Node = React.ReactElement<Record<string, unknown>>;
function nodes(n: React.ReactNode): Node[] { if (Array.isArray(n)) return n.flatMap(nodes); if (!React.isValidElement<Record<string, unknown>>(n)) return []; return [n, ...nodes(n.props.children as React.ReactNode), ...nodes(n.props.footer as React.ReactNode)]; }
function text(n: React.ReactNode): string { if (Array.isArray(n)) return n.map(text).join(" "); if (React.isValidElement<Record<string, unknown>>(n)) return text(n.props.children as React.ReactNode); return typeof n === "string" || typeof n === "number" ? String(n) : ""; }
function find(n: React.ReactNode, pred: (n: Node) => boolean): Node { const found = nodes(n).find(pred); assert.ok(found); return found; }
function button(n: React.ReactNode, label: string): Node { return find(n, el => el.type === "button" && text(el.props.children as React.ReactNode).replace(/\s+/g, " ").trim() === label); }
async function click(n: Node) { (n.props.onClick as () => void)(); await Promise.resolve(); await Promise.resolve(); }
describe("ekte treukerssyklus med eksisterende UkeplanArk", async () => {
  const { WorkbenchTreukerssyklus } = await import("@/components/workbench/WorkbenchTreukerssyklus");
  const { UkeplanArk } = await import("@/components/admin/precision/AG11Ark");
  test("rediger uke2, bevar utkast ved feil, retry samme id, les og forhåndsvis før kopi", async () => {
    const render = () => draw("cycle", () => WorkbenchTreukerssyklus({ playerId: "syntetisk", anchorWeek: anchor, onLukk() {}, onLagret() {} }));
    render(); effects.shift()?.(); await Promise.resolve(); await Promise.resolve();
    await click(button(render(), "Rediger uke 2"));
    const editor = find(render(), n => n.type === UkeplanArk);
    const edit = () => draw("week", () => UkeplanArk(editor.props as React.ComponentProps<typeof UkeplanArk>));
    const fys = find(edit(), n => n.props.label === "FYS timer");
    const input = find(fys.props.children as React.ReactNode, n => n.type === "input");
    (input.props.onChange as (e: { target: { value: string } }) => void)({ target: { value: "0" } });
    await click(button(edit(), "Lagre ukeplan"));
    await click(button(render(), "Lagre alle tre uker")); assert.match(text(render()), /Syntetisk konflikt/); assert.equal(saves[0].weeks[1].fields.plannedHoursFys, 0);
    fail = false; await click(button(render(), "Lagre alle tre uker")); assert.equal(saves[1].requestId, saves[0].requestId); assert.equal(saves[1].weeks[1].fields.plannedHoursFys, 0);
    const date = find(render(), n => n.type === "input" && n.props.type === "date"); (date.props.onChange as (e: { target: { value: string } }) => void)({ target: { value: "2033-01-17" } });
    await click(button(render(), "Forhåndsvis kopiering")); assert.equal(button(render(), "Kopier tre uker som utkast").props.disabled, true);
    const confirm = find(render(), n => n.type === "input" && n.props.type === "checkbox"); (confirm.props.onChange as (e: { target: { checked: boolean } }) => void)({ target: { checked: true } });
    await click(button(render(), "Kopier tre uker som utkast")); assert.equal(copies.length, 1); assert.equal(copies[0].confirmedFilledTargets, true);
  });
});
