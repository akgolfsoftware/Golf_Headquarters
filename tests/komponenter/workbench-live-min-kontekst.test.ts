import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSession } from "@/lib/domain/workbench/operations";
import { parsePlanKontekst, type PlanReferanse } from "@/lib/workbench/plan-kontekst";
import type { MinKalenderData } from "@/lib/workbench/min-calendar";
import type { WorkbenchSurface } from "@/lib/workbench/visning-url";

const pushed: string[] = [];
mock.module("react", { namedExports: { ...React, useEffect() {}, useMemo: (f: () => unknown) => f(), useRef: (v: unknown) => ({ current: v }),
  useState: (v: unknown) => [typeof v === "function" ? v() : v, () => undefined], useTransition: () => [false, () => undefined] } });
mock.module("@/lib/workbench/wb-session-life-actions", { namedExports: { loadSessionExecution: async () => ({ ok: false, error: "Ubrukt gjennomføringslesing" }), mutateSessionExecution: async () => ({ ok: false, error: "Ubrukt gjennomføringshandling" }) } });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ push: (u: string) => pushed.push(u), replace() {}, refresh() {} }),
  usePathname: () => "/portal/planlegge/workbench", useSearchParams: () => new URLSearchParams() } });
mock.module("next/link", { defaultExport: "a" });
mock.module("sonner", { namedExports: { toast: { success() {}, error() {} } } });
const unused = async () => { throw new Error("Uventet skrivehandling i lenketest"); };
mock.module("@/lib/workbench/wb-actions", { namedExports: { completeSession: unused, saveWorkbenchLiveSnapshot: unused, startNextWorkbenchLiveSession: unused } });
let Live: typeof import("@/components/workbench/WorkbenchLive").WorkbenchLive;
let Min: typeof import("@/components/workbench/WorkbenchMinKalender").WorkbenchMinKalender;
before(async () => {
  ({ WorkbenchLive: Live } = await import("@/components/workbench/WorkbenchLive"));
  ({ WorkbenchMinKalender: Min } = await import("@/components/workbench/WorkbenchMinKalender"));
});
beforeEach(() => { pushed.length = 0; });

const weekStart = "2024-12-30";
const session = { ...createSession({ playerId: "syntetisk-spiller", coachId: "syntetisk-coach", date: weekStart,
  startMinute: 600, durationMinutes: 30, title: "Syntetisk økt", pyramid: "TEK", createdBy: "COACH" }), id: "valgt-okt" };
const first = { ...session, id: "forste-okt", title: "Første syntetiske økt" };
function kalender(): MinKalenderData {
  return { weekStart, days: [{ date: weekStart, items: [first, session].map(s => ({ id: `workbench:${s.id}`, kind: "WORKBENCH", date: s.date,
    startMinute: s.startMinute, durationMinutes: s.durationMinutes, title: s.title, pyramid: s.pyramid, session: s,
    href: "/gammel-lenke" })) }], templates: [], bookings: [], todayIso: weekStart, nowMinute: 0 };
}
function refs(html: string): URL[] { return [...html.matchAll(/href="([^"]+)"/g)].map(m => new URL(m[1].replaceAll("&amp;", "&"), "https://syntetisk.invalid")); }
function assertRef(url: URL, ref: PlanReferanse, surface: WorkbenchSurface, uke = weekStart) {
  assert.equal(url.pathname, surface === "player" ? "/portal/planlegge/workbench" : "/admin/workbench/syntetisk-spiller");
  assert.equal(url.searchParams.get("uke"), uke);
  for (const k of ["aar", "maned", "periode", "okt"] as const) assert.equal(url.searchParams.get(k), ref[k] ?? null);
}
type Element = React.ReactElement<Record<string, unknown>>;
function nodes(n: React.ReactNode): Element[] {
  if (Array.isArray(n)) return n.flatMap(nodes);
  if (!React.isValidElement<Record<string, unknown>>(n)) return [];
  return [n, ...nodes(n.props.children as React.ReactNode)];
}

for (const surface of ["player", "agency"] as const) {
  for (const aar of ["2025", "2030"]) {
    test(`${surface}: Live/Min beholder valgt planår ${aar}, måned, periode og økt over ISO-årsskifte`, () => {
      const ref = parsePlanKontekst({ uke: weekStart, aar, maned: "2027-06", periode: "valgt-periode", okt: session.id }).referanse;
      const live = renderToStaticMarkup(Live({ playerId: session.playerId, spillerNavn: "Syntetisk", routeSurface: surface,
        planKontekst: ref, data: { current: null, next: null, snapshot: null, from: weekStart, to: "2025-01-12" } }));
      for (const href of refs(live)) assertRef(href, ref, surface);
      assert.equal(refs(live).find(u => u.searchParams.get("niva") === "ar")?.searchParams.get("aar"), aar);
      const min = Min({ playerId: session.playerId, coachName: "Syntetisk", routeSurface: surface, planKontekst: ref, data: kalender() });
      const links = refs(renderToStaticMarkup(min));
      for (const href of links) assertRef(href, ref, surface);
      assert.ok(links.filter(u => u.searchParams.get("niva") === "okt").every(u => u.searchParams.get("okt") === session.id));
      const nav = nodes(min).find(n => n.props["aria-label"] === "Velg uke"); assert.ok(nav);
      const buttons = nodes(nav.props.children as React.ReactNode).filter(n => n.type === "button");
      (buttons[0].props.onClick as () => void)(); (buttons[2].props.onClick as () => void)();
      assertRef(new URL(pushed[0], "https://syntetisk.invalid"), ref, surface, "2024-12-23");
      assertRef(new URL(pushed[1], "https://syntetisk.invalid"), ref, surface, "2025-01-06");
    });
  }
}
test("eldre Live/Min-kall uten plankontekst bruker ISO-ukeår som standard", () => {
  const live = renderToStaticMarkup(Live({ playerId: session.playerId, spillerNavn: "Syntetisk", data: { current: null, next: null, snapshot: null, from: weekStart, to: "2025-01-12" } }));
  const min = renderToStaticMarkup(Min({ playerId: session.playerId, coachName: "Syntetisk", data: kalender() }));
  for (const html of [live, min]) assert.equal(refs(html).find(u => u.searchParams.get("niva") === "ar")?.searchParams.get("aar"), "2025");
});
test("coachkalender åpner riktig spiller og rydder bort annen spillers periode-ID", () => {
  const data = kalender(); data.days[0].items = [{ ...data.days[0].items[1], session: { ...session, playerId: "annen-syntetisk" } }];
  const html = renderToStaticMarkup(Min({ playerId: session.playerId, coachName: "Syntetisk", data,
    planKontekst: { uke: weekStart, aar: "2030", maned: "2027-06", periode: "periode-for-opprinnelig", okt: session.id } }));
  const open = refs(html).filter(u => u.pathname === "/admin/workbench/annen-syntetisk"); assert.equal(open.length, 2);
  for (const url of open) { assert.equal(url.searchParams.get("periode"), null); assert.equal(url.searchParams.get("okt"), session.id); assert.equal(url.searchParams.get("aar"), "2030"); }
});
test("bookinglenker endres ikke til Workbench-økter", () => {
  const data = kalender(); data.days[0].items = [{ id: "syntetisk-booking", kind: "BOOKING", date: weekStart, startMinute: 0, durationMinutes: 0,
    title: "Syntetisk booking", href: "/portal/booking/syntetisk-booking" }];
  const html = renderToStaticMarkup(Min({ playerId: session.playerId, coachName: "Syntetisk", routeSurface: "player", data,
    planKontekst: { uke: weekStart, aar: "2025", periode: "valgt-periode" } }));
  assert.equal(refs(html).filter(u => u.pathname === "/portal/booking/syntetisk-booking").length, 2);
});
