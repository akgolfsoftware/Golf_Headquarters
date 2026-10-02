import { beforeEach, describe, test, mock } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WeekViewModel } from "@/lib/domain/workbench/types";
import type { SaveWeekPlanInput } from "@/lib/workbench/wb-actions";
import { buildWeekViewModel, createSession } from "@/lib/domain/workbench/operations";
import { parsePlanKontekst } from "@/lib/workbench/plan-kontekst";
import { tommeUkeplandetaljer, UKEPLAN_TYPER } from "@/lib/workbench/ukeplan-schema";

// En liten hook-runner lar hendelsene kjøre ekte komponent-/hookkode uten DOM.
// Tilstand lagres per komponent; servergrensen og designkomponentene er stubber.
const states = new Map<string, unknown[]>();
let context = "", cursor = 0;
const transitions: Promise<unknown>[] = [];
function draw<T>(id: string, render: () => T): T {
  context = id; cursor = 0;
  return render();
}
function useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void] {
  const slots = states.get(context) ?? [];
  states.set(context, slots);
  const index = cursor++;
  if (!(index in slots)) slots[index] = typeof initial === "function" ? (initial as () => T)() : initial;
  return [slots[index] as T, (next) => {
    slots[index] = typeof next === "function" ? (next as (prev: T) => T)(slots[index] as T) : next;
  }];
}
mock.module("react", { namedExports: {
  ...React, useState, useMemo: (fn: () => unknown) => fn(), useCallback: (fn: unknown) => fn,
  useRef: (initial: unknown) => ({ current: initial }), useEffect() {},
  useTransition: () => [false, (run: () => Promise<unknown>) => { transitions.push(run()); }],
} });
const pushes: string[] = [], replacements: string[] = [];
mock.module("next/navigation", { namedExports: { useRouter: () => ({ push: (url: string) => pushes.push(url), replace: (url: string) => replacements.push(url) }) } });
mock.module("next/link", { defaultExport: "a" });
mock.module("sonner", { namedExports: { toast: { success() {}, error() {} } } });
for (const css of ["precision-a4.css", "precision-a9.css"]) mock.module(`@/styles/${css}`, { namedExports: {} });
mock.module("@/components/precision/pa", { namedExports: {
  Ikon: "i", Knapp: "button", KnappLenke: "a", TomTilstand: "empty",
  AKSE_NAVN: { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" },
} });
mock.module("@/components/precision/pa-a4", { namedExports: { Ark: "sheet", Dialogboks: "dialog", Nokkelverdi: "values", Side: "main", SideHode: "header" } });
mock.module("@/components/precision/pa-a5", { namedExports: { InlineVarsel: "warning" } });
mock.module("@/components/precision/pa-a2", { namedExports: { Sokefelt: "input" } });
mock.module("@/components/precision/pa-workbench", { namedExports: {
  AKSER: ["fys", "tek", "slag", "spill", "turn"], Aksestang: "axes", Caps: "small", Fremdrift: "progress",
  Listerad: "row", Oktkort: "session", Valgpille: "pill", Velger: "chooser",
  akseFra: (p: string) => p?.toLowerCase() ?? "tek", akseStil: () => ({}),
} });
mock.module("@/components/workbench/Ukeforslag", { namedExports: { Ukeforslag: "suggestion" } });
mock.module("@/components/workbench/OvelseSkjema", { namedExports: { OvelseSkjema: "exercise" } });
mock.module("@/components/workbench/WeekGrid", { namedExports: { osloIdag: () => "2026-10-02" } });
mock.module("@/components/v2/inspektorpanel", { namedExports: {
  Inspektorpanel: "inspector", InspektorBlokk: "block", InspektorLinje: "inspector-line", InspektorTom: "empty",
} });
mock.module("@/components/ui/input", { namedExports: { Input: "input" } });
mock.module("@/components/ui/select", { namedExports: { Select: "select" } });
mock.module("@/components/v2/core", { namedExports: { Knapp: "button" } });
mock.module("@/components/v2/icon", { namedExports: { Icon: "i" } });
mock.module("@/components/workbench/DrillListEditor", { namedExports: { DrillListEditor: "drills" } });

let loadedWeek: WeekViewModel;
const saved: SaveWeekPlanInput[] = [];
let saveResult: { ok: false; error: string } | { ok: true; data: unknown } = { ok: false, error: "Lagring feilet" };
let saveThrows = false;
const unused = async () => { throw new Error("Uventet handling"); };
mock.module("@/lib/workbench/wb-actions", { namedExports: {
  addDrill: unused, addDrillFromSource: unused, createSession: unused, createSessionFromSource: unused,
  createSessionSeries: unused, deleteSession: unused, deleteSessionSeries: unused, moveSession: unused,
  publishSessions: unused, removeDrill: unused, reorderDrills: unused, setSessionTemplate: unused,
  unpublishSession: unused, updateSessionEffort: unused,
  loadWeek: async () => ({ ok: true, data: loadedWeek }),
  saveWeekPlan: async (input: SaveWeekPlanInput) => {
    saved.push(input);
    if (saveThrows) throw new Error("Nettfeil");
    return saveResult;
  },
} });
describe("Precision Workbench: ekte integrasjon", async () => {
const { useUkeMotor } = await import("@/components/workbench/useUkeMotor");
const { AG11Workbench } = await import("@/components/admin/precision/AG11Workbench");
const { UkeplanArk, CoachnotatArk, OktArk } = await import("@/components/admin/precision/AG11Ark");
const { VisningPiller } = await import("@/components/workbench/VisningPiller");
const { SessionInspector } = await import("@/components/workbench/SessionInspector");
type Node = React.ReactElement<Record<string, unknown>>;
function nodes(node: React.ReactNode): Node[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!React.isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...nodes(node.props.children as React.ReactNode), ...nodes(node.props.footer as React.ReactNode)];
}
function find(node: React.ReactNode, predicate: (n: Node) => boolean): Node {
  const found = nodes(node).find(predicate);
  assert.ok(found, "Kontrollen finnes i den faktiske komponenten");
  return found;
}
function click(node: Node) { (node.props.onClick as () => void)(); }
function change(node: Node, value: string) { (node.props.onChange as (e: { target: { value: string } }) => void)({ target: { value } }); }
function field(node: React.ReactNode, label: string): Node {
  const wrapper = find(node, (n) => n.props.label === label);
  return find(wrapper.props.children as React.ReactNode, (n) => n.type === "input" || n.type === "textarea" || n.type === "select");
}
async function settle() { while (transitions.length) await transitions.shift(); }
function week(date = "2026-09-28") {
  return buildWeekViewModel(date, [], [], { kind: "PLAYER", subjectId: "syntetisk-p1", sources: [] });
}
beforeEach(() => {
  states.clear(); transitions.length = 0; saved.length = 0; pushes.length = 0; replacements.length = 0;
  loadedWeek = week(); saveResult = { ok: false, error: "Lagring feilet" }; saveThrows = false;
});

test("ekte OktArk skiller ukjent, null og registrerte minutter fra planlagt tid", () => {
  const base = createSession({ playerId: "syntetisk-p1", coachId: "syntetisk-c1", date: "2026-10-02",
    startMinute: 600, durationMinutes: 60, title: "Syntetisk økt", pyramid: "TEK", createdBy: "COACH" });
  const writes: { id: string; rpe: number | null; minutes?: number | null }[] = [];
  for (const actualMinutes of [null, 0, 45]) {
    states.clear();
    const motor = draw("motor", () => useUkeMotor({ playerId: "syntetisk-p1", uke: loadedWeek }));
    const render = () => draw("okt-ark", () => OktArk({ session: { ...base, actualMinutes }, spillerNavn: "Syntetisk spiller",
      motor: { ...motor, oppdaterAnstrengelse: (id, rpe, minutes) => { writes.push({ id, rpe, minutes }); } },
      onLukk() {}, onApneOkt() {}, onNyOvelse() {} }));
    const items = find(render(), (n) => Array.isArray(n.props.items) && (n.props.items as unknown[][]).some((item) => item[0] === "Faktisk tid")).props.items as unknown[][];
    assert.equal(items.find((item) => item[0] === "Faktisk tid")?.[1], actualMinutes === null ? "Ikke registrert" : `${actualMinutes} min`);
    assert.equal(items.find((item) => item[0] === "Planlagt tid")?.[1], "60 min");
    const input = field(render(), "Faktisk min");
    assert.equal(input.props.min, 0); assert.equal(input.props.max, 1440); assert.equal(input.props.step, 1);
    assert.equal(input.props.value, actualMinutes === null ? "" : String(actualMinutes));
    click(find(render(), (n) => n.props.children === "Lagre belastning"));
    assert.equal(writes.at(-1)?.minutes, actualMinutes);
    for (const invalid of ["-1", "0.5", "45.9", "1441", "NaN"]) {
      change(field(render(), "Faktisk min"), invalid);
      const button = find(render(), (n) => n.props.children === "Lagre belastning");
      assert.equal(button.props.disabled, true);
      const count = writes.length; click(button); assert.equal(writes.length, count);
    }
    for (const [value, expected] of [["0", 0], ["45", 45], ["1440", 1440], ["", null]] as const) {
      change(field(render(), "Faktisk min"), value);
      const button = find(render(), (n) => n.props.children === "Lagre belastning");
      assert.equal(button.props.disabled, false); click(button);
      assert.equal(writes.at(-1)?.minutes, expected);
    }
  }
});

test("ekte SessionInspector skiller null, 0 og 45 og lagrer bare hele minutter 0–1440", () => {
  const base = createSession({ playerId: "syntetisk-p1", coachId: "syntetisk-c1", date: "2026-10-02",
    startMinute: 600, durationMinutes: 60, title: "Syntetisk økt", pyramid: "TEK", createdBy: "COACH" });
  const writes: (number | null | undefined)[] = [];
  for (const actualMinutes of [null, 0, 45]) {
    states.clear();
    const render = () => draw("inspector", () => SessionInspector({ session: { ...base, actualMinutes }, travel: false,
      onFlytt() {}, onPubliser() {}, onTrekkTilbake() {}, onSlett() {}, onLagreSomMal() {},
      onLeggTilDrill() {}, onFlyttDrill() {}, onFjernDrill() {}, onOppdaterAnstrengelse: (_rpe, minutes) => { writes.push(minutes); } }));
    assert.equal(find(render(), (n) => n.type === "inspector-line" && n.props.label === "Faktisk tid").props.verdi,
      actualMinutes === null ? "Ikke registrert" : `${actualMinutes} min`);
    assert.equal(find(render(), (n) => n.type === "inspector-line" && n.props.label === "Planlagt tid").props.verdi, "60 min");
    const input = field(render(), "Faktisk min");
    assert.equal(input.props.min, 0); assert.equal(input.props.max, 1440); assert.equal(input.props.step, 1);
    assert.equal(input.props.value, actualMinutes === null ? "" : String(actualMinutes));
    click(find(render(), (n) => n.props.children === "Lagre belastning")); assert.equal(writes.at(-1), actualMinutes);
    for (const invalid of ["-1", "45.9", "1441", "NaN"]) {
      change(field(render(), "Faktisk min"), invalid);
      const button = find(render(), (n) => n.props.children === "Lagre belastning");
      assert.equal(button.props.disabled, true);
      const count = writes.length; click(button); assert.equal(writes.length, count);
    }
    for (const [value, expected] of [["0", 0], ["45", 45], ["1440", 1440], ["", null]] as const) {
      change(field(render(), "Faktisk min"), value);
      const button = find(render(), (n) => n.props.children === "Lagre belastning");
      assert.equal(button.props.disabled, false); click(button); assert.equal(writes.at(-1), expected);
    }
  }
});

test("ekte hook lagrer riktig ISO-ukeår ved årsskifte", async () => {
  loadedWeek = week("2026-12-28");
  const motor = draw("motor", () => useUkeMotor({ playerId: "syntetisk-p1", uke: loadedWeek }));
  motor.lagreUkeplan({ customNotes: null });
  await settle();
  assert.equal(saved[0].isoYear, 2026);
  assert.equal(saved[0].weekNumber, 53);
  states.clear(); loadedWeek = week("2024-12-30");
  draw("motor", () => useUkeMotor({ playerId: "syntetisk-p1", uke: loadedWeek })).lagreUkeplan({});
  await settle();
  assert.equal(saved[1].isoYear, 2025);
  assert.equal(saved[1].weekNumber, 1);
});

test("ekte hook viderefører planningDetails og skiller null, undefined og utelatt", async () => {
  const motor = draw("motor", () => useUkeMotor({ playerId: "syntetisk-p1", uke: loadedWeek }));
  const details = tommeUkeplandetaljer();
  details.weekType = "tmed"; details.location = "Testanlegg";
  details.areas.TEK = { priority: "UTVIKLE", focus: "Syntetisk fokus", sessionBudget: 0 };
  for (const input of [{ planningDetails: details }, { planningDetails: null }, { planningDetails: undefined }, { customNotes: null }]) {
    motor.lagreUkeplan(input); await settle();
  }
  assert.deepEqual(saved[0].planningDetails, details);
  assert.equal(saved[1].planningDetails, null);
  assert.equal(saved[2].planningDetails, undefined);
  assert.equal(Object.hasOwn(saved[3], "planningDetails"), false);
  assert.equal(saved[3].customNotes, null);
});

const reference = parsePlanKontekst({ uke: "2026-09-28", aar: "2027", maned: "2026-10", periode: "test-periode", okt: "test-okt" }).referanse;
function app(routeSurface: "agency" | "player" = "agency", role: "coach" | "player" = "coach") {
  return draw("app", () => AG11Workbench({
    playerId: "syntetisk-p1", spillerNavn: "Syntetisk spiller", uke: loadedWeek, kilder: [],
    roster: [{ id: "syntetisk-p1", navn: "Syntetisk spiller" }, { id: "syntetisk-p2", navn: "Syntetisk spiller 2" }],
    grupper: [], goals: [], fys: { physicalBlocks: [], tournamentPlans: [], openConflicts: [] },
    planKontekst: reference, valgtOktId: reference.okt, routeSurface, role,
  }));
}
function checkReference(href: string, selectedWeek = "2026-09-28") {
  const url = new URL(href, "https://test.invalid");
  assert.equal(url.searchParams.get("uke"), selectedWeek);
  assert.equal(url.searchParams.get("aar"), "2027");
  assert.equal(url.searchParams.get("maned"), "2026-10");
  assert.equal(url.searchParams.get("periode"), "test-periode");
  assert.equal(url.searchParams.get("okt"), "test-okt");
  return url;
}

test("ekte ukeoverskrift bruker alle fire nyere uketyper og legacy som fallback", () => {
  const details = tommeUkeplandetaljer();
  loadedWeek.weekPlan = {
    id: "syntetisk-plan", playerId: "syntetisk-p1", isoYear: 2026, weekNumber: 40,
    weekType: "UTVIKLING", notes: [], planningDetails: details,
  };
  for (const type of UKEPLAN_TYPER) {
    states.clear(); details.weekType = type.id;
    assert.equal((find(app(), (n) => n.props.className === "a9-ukenav__tittel").props.children as (string | number)[]).join(""),
      `Uke 40 · 28.09–04.10 · ${type.navn}`);
  }
  states.clear(); details.weekType = null;
  assert.equal((find(app(), (n) => n.props.className === "a9-ukenav__tittel").props.children as (string | number)[]).join(""),
    "Uke 40 · 28.09–04.10 · Utvikling");
});

test("ekte AG11 bevarer alle valg i nivå- og spillerbytte og uke 40 → 41", () => {
  for (const surface of ["agency", "player"] as const) {
    states.clear();
    const tree = app(surface);
    const pathname = surface === "player" ? "/portal/planlegge/workbench" : "/admin/workbench/syntetisk-p1";
    for (const id of ["ar", "periode", "maned"]) assert.equal(checkReference(find(tree, (n) => n.props.controlId === `workbench-niva-${id}`).props.href as string).pathname, pathname);
    for (const id of ["okt", "vol", "mal", "uke"]) {
      click(find(app(surface), (n) => n.props.controlId === `workbench-niva-${id}`));
      assert.equal(checkReference(replacements.at(-1)!).pathname, pathname);
    }
    (find(app(surface), (n) => n.type === "chooser").props.onNeste as () => void)();
    assert.equal(checkReference(pushes.at(-1)!).pathname, surface === "player" ? pathname : "/admin/workbench/syntetisk-p2");
    click(find(app(surface), (n) => n.props["aria-label"] === "Neste uke"));
    checkReference(pushes.at(-1)!, "2026-10-05");
  }
});

test("VisningPiller holder periode og kalenderkontekst på begge flater", () => {
  for (const routeSurface of ["agency", "player"] as const) {
    const tree = draw("pills", () => VisningPiller({ playerId: "syntetisk-p1", visning: "uke", ...reference, routeSurface }));
    const links = nodes(tree).filter((n) => n.props.role === "tab");
    assert.equal(links.length, 7);
    for (const link of links) assert.equal(checkReference(link.props.href as string).pathname, routeSurface === "player" ? "/portal/planlegge/workbench" : "/admin/workbench/syntetisk-p1");
  }
});

test("coach og spiller ser sann delttekst i faktisk ukeplanrender; snarveien heter Ukenotat", () => {
  loadedWeek.weekPlan = {
    id: "syntetisk-plan", playerId: "syntetisk-p1", isoYear: 2026, weekNumber: 40,
    weekType: "UTVIKLING", notes: [], customNotes: "Syntetisk delt ukenotat",
  };
  for (const role of ["coach", "player"] as const) {
    states.clear();
    const renderApp = () => app(role === "coach" ? "agency" : "player", role);
    click(find(renderApp(), (n) => n.props.children === "Ukeplan og mål"));
    const plan = find(renderApp(), (n) => n.type === UkeplanArk);
    const planHtml = renderToStaticMarkup(draw("delt-ukeplan", () => UkeplanArk(plan.props as Parameters<typeof UkeplanArk>[0])));
    assert.match(planHtml, /Ukenotat/);
    assert.match(planHtml, /DELES MED SPILLEREN/);
    assert.match(planHtml, /Syntetisk delt ukenotat/);
    assert.doesNotMatch(planHtml, /BARE COACH|Coachnotat/);
    if (role === "coach") {
      click(find(renderApp(), (n) => n.props.children === "Ukenotat"));
      const note = find(renderApp(), (n) => n.type === CoachnotatArk);
      const noteTree = draw("delt-notatark", () => CoachnotatArk(note.props as Parameters<typeof CoachnotatArk>[0]));
      assert.equal(noteTree.props.title, "Ukenotat");
      const noteHtml = renderToStaticMarkup(noteTree);
      assert.match(noteHtml, /DELES MED SPILLEREN/);
      assert.match(noteHtml, /Syntetisk delt ukenotat/);
      assert.doesNotMatch(noteHtml, /BARE COACH|Coachnotat/);
    }
  }
});

test("ekte ark beholder inndata ved lagringsfeil og unntak og lukkes ved vellykket retry", async () => {
  click(find(app(), (n) => n.props.children === "Ukeplan og mål"));
  const sheet = () => find(app(), (n) => n.type === UkeplanArk);
  const renderSheet = () => draw("ukeplan-ark", () => UkeplanArk(sheet().props as Parameters<typeof UkeplanArk>[0]));
  change(field(renderSheet(), "Oppholdssted"), "Syntetisk treningssted");
  change(field(renderSheet(), "TEK fokus"), "Behold dette ved feil");
  change(field(renderSheet(), "TEK økter"), "0");
  for (const throws of [false, true]) {
    saveThrows = throws;
    click(find(renderSheet(), (n) => n.props.children === "Lagre ukeplan"));
    assert.ok(sheet(), "Arket lukkes ikke før svar");
    await settle();
    assert.equal(field(renderSheet(), "Oppholdssted").props.value, "Syntetisk treningssted");
    assert.equal(field(renderSheet(), "TEK fokus").props.value, "Behold dette ved feil");
    assert.equal(field(renderSheet(), "TEK økter").props.value, "0");
  }
  saveThrows = false; saveResult = { ok: true, data: {} };
  click(find(renderSheet(), (n) => n.props.children === "Lagre ukeplan"));
  await settle();
  assert.equal(nodes(app()).some((n) => n.type === UkeplanArk), false);
  assert.equal(saved.length, 3);
  for (const input of saved) {
    assert.equal(input.planningDetails?.location, "Syntetisk treningssted");
    assert.equal(input.planningDetails?.areas.TEK.sessionBudget, 0);
    assert.equal(input.planningDetails?.areas.TEK.focus, "Behold dette ved feil");
  }
});

});
