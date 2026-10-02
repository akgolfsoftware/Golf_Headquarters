import assert from "node:assert/strict";
import { beforeEach, describe, mock, test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildWeekViewModel, createSession } from "@/lib/domain/workbench/operations";
import { parsePlanKontekst } from "@/lib/workbench/plan-kontekst";
import { summerTreningsvolum } from "@/lib/workbench/treningsvolum";
import type { WorkbenchSamletData } from "@/lib/workbench/workbench-samlet-typer";
import type { CreateSessionSeriesInput } from "@/lib/workbench/wb-actions";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";

const states = new Map<string, unknown[]>(); let context = "", cursor = 0;
const transitions: Promise<unknown>[] = [];
function draw<T>(id: string, render: () => T): T { context = id; cursor = 0; return render(); }
function useState<T>(initial: T | (() => T)): [T, (next: T | ((old: T) => T)) => void] {
  const slots = states.get(context) ?? []; states.set(context, slots); const index = cursor++;
  if (!(index in slots)) slots[index] = typeof initial === "function" ? (initial as () => T)() : initial;
  return [slots[index] as T, next => { slots[index] = typeof next === "function" ? (next as (old: T) => T)(slots[index] as T) : next; }];
}
mock.module("react", { namedExports: { ...React, useState, useMemo: (fn: () => unknown) => fn(), useCallback: (fn: unknown) => fn, useRef: (v: unknown) => ({ current: v }), useEffect() {}, useTransition: () => [false, (fn: () => Promise<unknown>) => transitions.push(fn())] } });
const replacements: string[] = [];
mock.module("next/navigation", { namedExports: { useRouter: () => ({ push() {}, refresh() {}, replace: (url: string) => replacements.push(url) }) } });
mock.module("next/link", { defaultExport: "a" });
mock.module("sonner", { namedExports: { toast: { success() {}, error() {} } } });
for (const css of ["precision-a4.css", "precision-a8.css"]) mock.module(`@/styles/${css}`, { namedExports: {} });
mock.module("@/components/workbench/workbench-samlet.css", { namedExports: {} });
mock.module("@/components/precision/pa-a4", { namedExports: { Ark: "sheet", Dialogboks: "dialog" } });
mock.module("@/components/admin/precision/AG11Ark", { namedExports: {
  NyOktArk: "new-session", OktArk: "session-sheet", OvelseArk: "exercise-sheet", PubliserArk: "publish-sheet", UkeplanArk: "week-sheet", CoachnotatArk: "note-sheet", UKETYPE_NAVN: { UTVIKLING: "Utvikling" },
  dagOgDato: (d: string) => d, klokke: (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
} });
const created: CreateSessionSeriesInput[] = []; const deleted: { sessionId: string; policy: string }[] = [];
let saveFails = false;
type GroupPayload = { groupId: string; requestId: string; drills: { sourceId?: string; exerciseId?: string; positionTaskId?: string }[] };
const groupSaved: GroupPayload[] = []; let groupError: string | null = null; let groupSession: WorkbenchSession | null = null;
const unused = async () => { throw new Error("Uventet handling"); };
mock.module("@/lib/workbench/wb-actions", { namedExports: {
  addDrill: unused, addDrillFromSource: unused, createSession: unused, createSessionFromSource: unused,
  createSessionSeries: async (input: CreateSessionSeriesInput) => { created.push(input); return saveFails ? { ok: false, error: "Syntetisk lagringsfeil" } : { ok: true, data: [{ id: "lagret-tiltak" }] }; },
  deleteSession: unused, deleteSessionSeries: async (input: { sessionId: string; policy: string }) => { deleted.push(input); return { ok: true, data: { slettet: 1 } }; },
  moveSession: unused, publishSessions: unused, resolvePlayerApproval: unused, removeDrill: unused, reorderDrills: unused, setSessionTemplate: unused, unpublishSession: unused, updateSessionEffort: unused, updateDrill: unused, loadWeek: unused, saveWeekPlan: unused, createSeasonPlan: unused, deleteSeasonPeriod: unused, saveSeasonPeriod: unused,
} });
mock.module("@/lib/workbench/workbench-samlet-sesong-actions", { namedExports: { saveSeasonBounds: unused } });
mock.module("@/lib/workbench/group-session-actions", { namedExports: { loadGroupWorkbenchSessions: unused, publishGroupWorkbenchSessions: unused, saveGroupWorkbenchSession: async (input: GroupPayload) => { groupSaved.push(input); if (groupError) return { ok: false, error: groupError }; assert.ok(groupSession); return { ok: true, data: groupSession }; }, withdrawGroupWorkbenchSessions: unused } });

describe("Samlet Workbench: faktiske komponenter", async () => {
const { WorkbenchSamlet, samletMerRegister } = await import("@/components/workbench/WorkbenchSamlet");
const { WorkbenchAnalyse } = await import("@/components/workbench/WorkbenchAnalyse");
const { WorkbenchUkeverksted } = await import("@/components/workbench/WorkbenchUkeverksted");
const { WorkbenchTrenerbord } = await import("@/components/workbench/WorkbenchTrenerbord");
const { WorkbenchSesongkart } = await import("@/components/workbench/WorkbenchSesongkart");
const session = { ...createSession({ playerId: "syntetisk-p1", coachId: "syntetisk-c1", date: "2026-10-01", startMinute: 600, durationMinutes: 60, title: "Syntetisk økt", pyramid: "TEK", createdBy: "COACH" }), id: "egen-okt", status: "COMPLETED" as const, actualMinutes: 0 };
const week = buildWeekViewModel("2026-09-28", [session], [], { kind: "PLAYER", subjectId: "syntetisk-p1", sources: [] });
const volum = summerTreningsvolum([{ ...session, date: new Date(`${session.date}T00:00:00Z`), updatedAt: new Date(session.updatedAt) }], { fraDato: new Date("2026-09-28T00:00:00Z"), tilDato: new Date("2026-10-05T00:00:00Z"), naa: new Date("2026-10-02T12:00:00Z") });
function fixture(): WorkbenchSamletData {
  return { player: { id: "syntetisk-p1", navn: "Syntetisk spiller" }, routeSurface: "player", role: "player", flate: "uke", planKontekst: parsePlanKontekst({ uke: "2026-09-28" }), uke: week,
    kilder: [{ id: "exercise:syntetisk", kind: "DRILL", title: "Syntetisk øvelse", durationMinutes: 30, drill: { title: "Syntetisk øvelse", durationMinutes: 30, akFormel: { pyramid: "TEK", area: "TEE", label: "Syntetisk" } } }], goals: [], fys: { physicalBlocks: [], tournamentPlans: [], openConflicts: [], available: true }, roster: [{ id: "syntetisk-p1", navn: "Syntetisk spiller" }], grupper: [], volum, volumKilde: "SYNTETISK SAMLET KILDE", valgtOkt: session, varsler: [],
    sesong: { plan: null, vindu: { fraDato: "2026-01-01", tilDato: "2027-01-01" }, perioder: [], hendelser: [], sessions: [session], volum, maneder: [] },
    bord: { rader: [{ spiller: { id: "syntetisk-p1", navn: "Syntetisk spiller" }, uke: week, volum, error: null, followup: { sessions: [session], pendingPlanActionIds: [], from: "2026-09-28", to: "2026-10-11" } }], total: 1, samtidigeLesere: 1 },
    analyse: { vindu: { fraDato: "2026-01-01", tilDato: "2027-01-01" }, kilde: "SYNTETISK KILDE", volum,
      runder: [{ id: "syntetisk-runde", dato: "2026-09-30T23:00:00Z", brutto: 74, hull: 18, sgKilde: "SYNTETISK REFERANSE", sgTotal: 0, sgOtt: -1, sgApp: 1, sgArg: null, sgPutt: null }],
      tester: [{ id: "syntetisk-test", testId: "syntetisk-katalog", navn: "Syntetisk test", dato: "2026-09-30T23:00:00Z", verdi: 0, enhet: "poeng" }], trackman: [], sg: { roundCount: 1, total: null, ott: null, app: null, arg: null, putt: null, referanse: "Felles referanse er ikke dokumentert" } },
  };
}
type Node = React.ReactElement<Record<string, unknown>>;
function nodes(n: React.ReactNode): Node[] { if (Array.isArray(n)) return n.flatMap(nodes); if (!React.isValidElement<Record<string, unknown>>(n)) return []; return [n, ...nodes(n.props.children as React.ReactNode)]; }
function find(n: React.ReactNode, predicate: (n: Node) => boolean): Node { const found = nodes(n).find(predicate); assert.ok(found); return found; }
function field(n: React.ReactNode, label: string) { const l = find(n, x => x.type === "label" && Array.isArray(x.props.children) && x.props.children.filter(c => typeof c === "string").join("") === label); return find(l.props.children as React.ReactNode, x => ["input", "select", "textarea"].includes(x.type as string)); }
function change(n: Node, value: string) { (n.props.onChange as (e: { target: { value: string } }) => void)({ target: { value } }); }
function click(n: Node) { (n.props.onClick as () => void)(); }
async function settle() { while (transitions.length) await transitions.shift(); }
function html(n: React.ReactNode) { return renderToStaticMarkup(n).replace(/<[^>]+>/g, " ").replace(/\s+/g, " "); }
beforeEach(() => { states.clear(); created.length = 0; deleted.length = 0; transitions.length = 0; replacements.length = 0; saveFails = false; groupSaved.length = 0; groupError = null; groupSession = null; });

test("fire reelle flater har sine egne arbeidsområder", () => {
  const d = fixture();
  assert.match(html(draw("sesong", () => WorkbenchSesongkart({ data: d }))), /Sesongens treningsvolum/);
  assert.match(html(draw("uke", () => WorkbenchUkeverksted({ data: d }))), /Bibliotek.*Øvelser i rekkefølge/);
  assert.match(html(draw("bord", () => WorkbenchTrenerbord({ data: d }))), /Plan og registrering.*Følg opp/);
  assert.match(html(draw("stats", () => WorkbenchAnalyse({ data: d }))), /Datagrunnlag.*Fra måling til tiltak/);
});
test("gruppeark sender valgt banks konkrete referanser og viser serverens tekniske avslag", async () => {
  const base = fixture();
  const bank = { ...base.kilder[0], drill: { ...base.kilder[0].drill!, sourceId: "exercise:syntetisk-bank", exerciseId: "syntetisk-bank" } };
  const tek = { ...bank, id: "tek:syntetisk-oppgave", kind: "TEK" as const, title: "Syntetisk teknisk oppgave", drill: { ...bank.drill, sourceId: "tek:syntetisk-oppgave", exerciseId: undefined, positionTaskId: "syntetisk-oppgave" } };
  const data: WorkbenchSamletData = { ...base, role: "coach", routeSurface: "agency", grupper: [{ id: "syntetisk-gruppe", navn: "Syntetisk gruppe" }], kilder: [bank, tek] };
  const renderBord = () => draw("gruppe-bord", () => WorkbenchTrenerbord({ data }));
  click(find(renderBord(), n => n.props.children === "Gruppeøkter"));
  const render = () => {
    const child = find(renderBord(), n => typeof n.type === "function" && n.type.name === "GruppeArk");
    return draw("ekte-gruppeark", () => (child.type as (props: Record<string, unknown>) => React.ReactNode)(child.props));
  };
  change(field(render(), "Øvelse"), bank.id); groupSession = { ...session, id: "syntetisk-gruppeoriginal", status: "DRAFT" };
  click(find(render(), n => n.props.children === "Opprett gruppeutkast")); await settle();
  assert.equal(groupSaved[0].groupId, "syntetisk-gruppe");
  assert.deepEqual(groupSaved[0].drills[0], { title: bank.drill.title, description: bank.drill.description, durationMinutes: bank.drill.durationMinutes, akFormel: bank.drill.akFormel, techniqueFocus: bank.drill.techniqueFocus, sourceId: "exercise:syntetisk-bank", exerciseId: "syntetisk-bank", positionTaskId: undefined });
  assert.match(html(render()), /Gruppeøkten er lagret som utkast/);
  change(field(render(), "Øvelse"), tek.id); groupError = "Teknisk oppgave er ikke tilgjengelig for denne gruppen.";
  click(find(render(), n => n.props.children === "Opprett gruppeutkast")); await settle();
  assert.equal(groupSaved[1].drills[0].sourceId, "tek:syntetisk-oppgave"); assert.equal(groupSaved[1].drills[0].positionTaskId, "syntetisk-oppgave"); assert.equal(groupSaved[1].drills[0].exerciseId, undefined);
  assert.match(html(render()), /Teknisk oppgave er ikke tilgjengelig for denne gruppen/);
  assert.equal(field(render(), "Øvelse").props.value, tek.id);
});
test("ukeflaten beholder samlet servervolum, uttrykkelig null og kilde", () => {
  const d = fixture(); const enhanced = { ...d, volum: { ...volum, total: { ...volum.total, planlagtMinutter: 180 } } };
  const text = html(draw("uke", () => WorkbenchUkeverksted({ data: enhanced })));
  assert.match(text, /SYNTETISK SAMLET KILDE/); assert.match(text, /Planlagt 180 min/); assert.match(text, /Registrert 0 min/);
});
test("Stats beholder null og 0 og bruker måledato i Oslo", () => {
  const text = html(draw("stats", () => WorkbenchAnalyse({ data: fixture() })));
  assert.match(text, /2026-10-01 · 74 brutto · 18 hull/); assert.match(text, /Total 0,0/); assert.match(text, /Nærspill —/);
  assert.match(text, /Syntetisk test · 2026-10-01 0,0 poeng/); assert.match(text, /Felles referanse er ikke dokumentert/);
});
test("tom tiltakdato og ugyldige minutter kaster ikke og kan ikke lagres", () => {
  const render = () => draw("stats", () => WorkbenchAnalyse({ data: fixture() }));
  change(field(render(), "Øvelse A"), "exercise:syntetisk"); change(field(render(), "Første dato"), "");
  assert.doesNotThrow(render); const save = find(render(), n => Array.isArray(n.props.children) && n.props.children[0] === "Legg alternativ "); assert.equal(save.props.disabled, true); click(save); assert.equal(created.length, 0);
  change(field(render(), "Første dato"), "2026-10-02"); change(field(render(), "Øktvarighet · min"), "15.5");
  click(find(render(), n => Array.isArray(n.props.children) && n.props.children[0] === "Legg alternativ ")); assert.equal(created.length, 0);
});
test("tiltak beholder utkast ved feil og har reell lagring og Angre", async () => {
  const render = () => draw("stats", () => WorkbenchAnalyse({ data: fixture() }));
  change(field(render(), "Øvelse A"), "exercise:syntetisk"); change(field(render(), "Gjentakelse"), "4");
  const save = () => find(render(), n => Array.isArray(n.props.children) && n.props.children[0] === "Legg alternativ ");
  saveFails = true; click(save()); await settle(); assert.match(html(render()), /Syntetisk lagringsfeil/); assert.equal(field(render(), "Øvelse A").props.value, "exercise:syntetisk");
  saveFails = false; click(save()); await settle(); assert.equal(created.at(-1)?.repeatWeeks, 4); assert.equal(created.at(-1)?.playerId, "syntetisk-p1"); assert.match(html(render()), /lagret som utkast/);
  click(find(render(), n => n.props.children === "Angre tiltak")); await settle(); assert.deepEqual(deleted, [{ sessionId: "lagret-tiltak", policy: "HELE_SERIEN" }]);
});
test("Mer er kildetro 18 innganger med tydelige mangler og virkelige klassiske ruter", () => {
  const registry = samletMerRegister(fixture()); assert.equal(registry.length, 18); assert.equal(new Set(registry.map(x => x.id)).size, 18);
  assert.equal(registry.find(x => x.id === "X02")?.navn, "Støtteapparat"); assert.equal(registry.find(x => x.id === "X18")?.navn, "Forventet putt");
  assert.match(registry.find(x => x.id === "X04")!.detalj, /Fyll ut sesongevaluering/); assert.match(registry.find(x => x.id === "X14")!.href, /klassisk=1.*side=tp/);
  assert.match(registry.find(x => x.id === "X15")!.href, /pille=fys/);
});
test("evaluering og utviklingssjekk har reelle spillerlenker og autoriserte trenerlenker", () => {
  const player = samletMerRegister(fixture());
  assert.equal(player.find(x => x.id === "X04")?.href, "/portal/mal/evaluering?ny=SESONGEVALUERING");
  assert.equal(player.find(x => x.id === "X11")?.href, "/portal/mal/evaluering?ny=UTVIKLINGSSJEKK");
  const coach = samletMerRegister({ ...fixture(), role: "coach", routeSurface: "agency" });
  assert.equal(coach.find(x => x.id === "X04")?.href, "/admin/spillere/syntetisk-p1?vis=360&fane=iup");
  assert.equal(coach.find(x => x.id === "X11")?.href, "/admin/spillere/syntetisk-p1?vis=360&fane=talent");
  for (const id of ["X04", "X11"]) assert.match(coach.find(x => x.id === id)!.detalj, /ikke ferdig/);
  for (const role of ["player", "coach"] as const) {
    const data: WorkbenchSamletData = { ...fixture(), role, routeSurface: role === "coach" ? "agency" : "player" };
    const render = () => draw(`mer-${role}`, () => {
      const wrapper = WorkbenchSamlet({ data });
      return (wrapper.type as (props: { data: WorkbenchSamletData }) => React.ReactNode)(wrapper.props);
    });
    click(find(render(), n => n.props.children === "Mer"));
    const ark = find(render(), n => n.type === "sheet" && n.props.title === "Mer");
    for (const id of ["X04", "X11"]) {
      const expected = (role === "coach" ? coach : player).find(x => x.id === id)!;
      const link = find(ark.props.children as React.ReactNode, n => n.type === "a" && n.props.href === expected.href && nodes(n.props.children as React.ReactNode).some(child => child.type === "strong" && child.props.children === expected.navn));
      assert.match(html(link), new RegExp(expected.navn));
    }
  }
});
test("samlet spillerbord har bare serverens egen rad og nav viser Stats", () => {
  const text = html(draw("bord", () => WorkbenchTrenerbord({ data: fixture() }))); assert.match(text, /1 spiller/); assert.ok(!text.includes("Gruppeøkter"));
  const n = draw("skall", () => WorkbenchSamlet({ data: { ...fixture(), flate: "analyse", analyse: null } }));
  const markup = renderToStaticMarkup(n);
  for (const navn of ["Sesongkart", "Ukeverksted", "Trenerbord", "Stats"]) assert.ok(markup.includes(`aria-label="${navn}"`));
  assert.match(html(n), /Stats.*Mer/); assert.ok(!markup.includes('aria-label="Analyse"'));
});
test("valg av økt og periode følger URL uten å miste kalender og zoom", () => {
  const d = fixture();
  const renderUke = () => draw("uke", () => WorkbenchUkeverksted({ data: d }));
  const dagvalg = find(renderUke(), n => n.props.className === "ws-day-tabs");
  const dager = nodes(dagvalg.props.children as React.ReactNode).filter(n => n.type === "button");
  click(dager[3]);
  const uke = renderUke();
  const kalender = find(uke, n => typeof n.type === "function" && n.type.name === "MobilDagKalender" && !n.props.desktop);
  const kalenderTre = (kalender.type as (props: Record<string, unknown>) => React.ReactNode)(kalender.props);
  click(find(kalenderTre, n => n.type === "button" && n.props.className === "ws-session"));
  const detaljer = find(renderUke(), n => n.type === "sheet" && n.props.title === "Økt og ukesum");
  assert.match(html(detaljer.props.children as React.ReactNode), /Registrert 0 min/);
  assert.ok(nodes(detaljer.props.children as React.ReactNode).some(n => n.props.children === "Tid, serie og detaljer"));
  const ukeQuery = new URL(replacements.at(-1)!, "https://syntetisk.invalid").searchParams;
  assert.equal(ukeQuery.get("okt"), session.id); assert.equal(ukeQuery.get("uke"), d.uke.weekStart); assert.equal(ukeQuery.get("flate"), "uke");
  const sesong: WorkbenchSamletData = { ...d, planKontekst: parsePlanKontekst({ niva: "aar", aar: "2026", maned: "2026-10", uke: d.uke.weekStart }), sesong: { ...d.sesong!, perioder: [{ id: "syntetisk-periode", type: "GRUNN", startDate: "2026-09-01", endDate: "2026-12-31", focus: null, weeklyVolMin: null, weeklyVolMax: null, sessionBudget: null, volum }] } };
  click(find(draw("sesong", () => WorkbenchSesongkart({ data: sesong })), n => n.type === "button" && n.props.className === "ws-period"));
  const q = new URL(replacements.at(-1)!, "https://syntetisk.invalid").searchParams;
  assert.equal(q.get("periode"), "syntetisk-periode"); assert.equal(q.get("uke"), d.uke.weekStart); assert.equal(q.get("aar"), "2026"); assert.equal(q.get("maned"), "2026-10"); assert.equal(q.get("niva"), "ar"); assert.equal(q.get("flate"), "sesong");
});
test("mobil kalender vises før verktøy og Bibliotek åpner samme kildehandling i ark", () => {
  const render = () => draw("mobiluke", () => WorkbenchUkeverksted({ data: fixture() }));
  const start = render();
  const dagvalg = find(start, n => n.props.className === "ws-mobile-day-selector");
  const toolbar = find(start, n => n.props.className === "ws-toolbar ws-week-toolbar");
  assert.ok(nodes(start).indexOf(dagvalg) < nodes(start).indexOf(toolbar));
  click(find(start, n => n.props["aria-expanded"] === false && n.props.children === "Bibliotek"));
  const ark = find(render(), n => n.type === "sheet" && n.props.title === "Bibliotek");
  click(find(ark.props.children as React.ReactNode, n => n.props.children === "Plasser i uka"));
  const etter = render();
  assert.ok(!nodes(etter).some(n => n.type === "sheet" && n.props.title === "Bibliotek"));
  assert.match(html(etter), /Plasserer «Syntetisk øvelse»/);
});
test("desktop samtidige økter beholder klokkeakse, startminutter, varighet og separate spor", () => {
  const base = fixture();
  const sessions = [session, { ...session, id: "overlapp", startMinute: 615, durationMinutes: 90, status: "DRAFT" as const }, { ...session, id: "etter", startMinute: 720, durationMinutes: 30 }];
  const data: WorkbenchSamletData = { ...base, uke: buildWeekViewModel(base.uke.weekStart, sessions, [], base.uke.mode) };
  data.uke = { ...data.uke, days: data.uke.days.map(d => d.date !== session.date ? d : { ...d, lockedBlocks: [{ id: "laast", startMinute: 645, durationMinutes: 120, title: "Syntetisk opptatt", kind: "OPPTATT", dimmed: true }] }) };
  const renderDay = (data: WorkbenchSamletData) => {
    const tree = draw(`desktop-${data.uke.days.flatMap(d => d.sessions).length}`, () => WorkbenchUkeverksted({ data }));
    const day = find(tree, n => typeof n.type === "function" && n.type.name === "MobilDagKalender" && n.props.desktop === true && n.props.dag === session.date);
    return (day.type as (props: Record<string, unknown>) => React.ReactNode)(day.props);
  };
  const simple = renderDay(base), overlap = renderDay(data);
  assert.equal((find(simple, n => n.props.className === "ws-day-calendar ws-desktop-day").props.style as React.CSSProperties).height,
    (find(overlap, n => n.props.className === "ws-day-calendar ws-desktop-day").props.style as React.CSSProperties).height);
  const blocks = nodes(overlap).filter(n => n.props.className === "ws-day-block");
  const first = blocks.find(n => n.key === session.id)!, second = blocks.find(n => n.key === "overlapp")!, third = blocks.find(n => n.key === "etter")!, locked = blocks.find(n => n.key === "laast")!;
  assert.equal((first.props.style as React.CSSProperties).top, "144px");
  assert.equal((second.props.style as React.CSSProperties).top, "156px");
  assert.equal((second.props.style as React.CSSProperties).height, "69px");
  assert.equal((third.props.style as React.CSSProperties).top, "240px");
  assert.notEqual((first.props.style as React.CSSProperties).left, (second.props.style as React.CSSProperties).left);
  assert.equal((locked.props.style as React.CSSProperties).top, "180px");
  assert.equal((locked.props.style as React.CSSProperties).height, "93px");
  assert.equal(nodes(overlap).filter(n => n.props.className === "ws-time-place").length, 15);
  const tree = draw("desktop-drop", () => WorkbenchUkeverksted({ data }));
  const day = find(tree, n => typeof n.type === "function" && n.type.name === "MobilDagKalender" && n.props.desktop === true && n.props.dag === session.date);
  const drops: { id: string; minute: number }[] = [];
  const dropTree = (day.type as (props: Record<string, unknown>) => React.ReactNode)({ ...day.props, onDrop: (id: string, minute: number) => drops.push({ id, minute }) });
  const canvas = find(dropTree, n => n.props.className === "ws-day-calendar ws-desktop-day");
  (canvas.props.onDrop as (event: unknown) => void)({ preventDefault() {}, clientY: 368, currentTarget: { getBoundingClientRect: () => ({ top: 200 }) }, dataTransfer: { getData: () => "overlapp" } });
  assert.deepEqual(drops, [{ id: "overlapp", minute: 600 }]);
  const dense: WorkbenchSamletData = { ...base, uke: buildWeekViewModel(base.uke.weekStart, Array.from({ length: 12 }, (_, i) => ({ ...session, id: `samtidig-${i}` })), [], base.uke.mode) };
  const denseCanvas = find(renderDay(dense), n => n.props.className === "ws-day-calendar ws-desktop-day");
  assert.equal((denseCanvas.props.style as React.CSSProperties).height, (canvas.props.style as React.CSSProperties).height);
  const denseTree = draw("desktop-tolv", () => WorkbenchUkeverksted({ data: dense }));
  const grid = find(denseTree, n => n.props.className === "ws-calendar ws-continuous-calendar");
  assert.match((grid.props.style as React.CSSProperties).gridTemplateColumns as string, /minmax\(600px,1fr\)/);
});
});
