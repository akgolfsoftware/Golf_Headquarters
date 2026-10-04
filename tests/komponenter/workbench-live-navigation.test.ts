import assert from "node:assert/strict";
import { beforeEach, describe, mock, test } from "node:test";
import { createRequire } from "node:module";
import * as React from "react";
import { createSession } from "@/lib/domain/workbench/operations";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import type { WorkbenchLiveData } from "@/lib/workbench/live";

// Hendelsene kjøres i den faktiske komponenten; bare kroker og servergrensen erstattes.
const states: unknown[] = []; let cursor = 0;
const transitions: Promise<unknown>[] = [];
function useState<T>(initial: T | (() => T)): [T, (next: T | ((old: T) => T)) => void] {
  const index = cursor++;
  if (!(index in states)) states[index] = typeof initial === "function" ? (initial as () => T)() : initial;
  return [states[index] as T, next => { states[index] = typeof next === "function" ? (next as (old: T) => T)(states[index] as T) : next; }];
}
mock.module("react", { namedExports: { ...React, useState, useRef: (value: unknown) => ({ current: value }), useEffect() {}, useTransition: () => [false, (run: () => Promise<unknown>) => transitions.push(run())] } });
let pathname = "/portal/planlegge/workbench";
let query = new URLSearchParams();
const replaced: { url: string; options: { scroll?: boolean } | undefined }[] = [];
let refreshed = 0;
mock.module("@/lib/workbench/wb-session-life-actions", { namedExports: { loadSessionExecution: async () => ({ ok: false, error: "Ubrukt gjennomføringslesing" }), mutateSessionExecution: async ({ sessionId }: { sessionId: string }) => fails ? { ok: false, error: "Syntetisk fullføringsfeil" } : { ok: true, data: session(sessionId, "COMPLETED") } } });
mock.module("next/navigation", { namedExports: { usePathname: () => pathname, useSearchParams: () => query, useRouter: () => ({
  replace: (url: string, options?: { scroll?: boolean }) => replaced.push({ url, options }), refresh: () => { refreshed++; },
}) } });
mock.module("@/components/workbench/VisningPiller", { namedExports: { VisningPiller: () => null } });
const errors: string[] = []; const successes: string[] = [];
const toastMock = { toast: { error: (message: string) => errors.push(message), success: (message: string) => successes.push(message) } };
mock.module("sonner", { namedExports: toastMock });
// Biblioteket har ulike import-/require-innganger; tsx kan bruke require i komponenten.
mock.module(createRequire(`${process.cwd()}/package.json`).resolve("sonner"), { namedExports: toastMock });
const started: { currentSessionId?: string; nextSessionId: string }[] = [];
const completed: string[] = [];
let fails = false;
function MockExecutionPanel({ session: current, onSaved }: { session: WorkbenchSession; onSaved: (session: WorkbenchSession, execution: null) => void }) {
  return React.createElement("button", { type: "button", onClick: () => transitions.push((async () => {
    if (fails) { errors.push("Syntetisk fullføringsfeil"); return; }
    const result = await (await import("@/lib/workbench/wb-session-life-actions")).mutateSessionExecution({ sessionId: current.id });
    if (result.ok) { completed.push(current.id); successes.push("Økten er fullført"); onSaved(result.data, null); }
    else errors.push(result.error);
  })()) }, "Fullfør økt");
}
mock.module("@/components/workbench/SessionExecutionPanel", { namedExports: { SessionExecutionPanel: MockExecutionPanel } });
function session(id: string, status: WorkbenchSession["status"]): WorkbenchSession {
  return { ...createSession({ playerId: "syntetisk-spiller", coachId: "syntetisk-coach", date: "2026-10-01", startMinute: 600, durationMinutes: 60,
    title: "Syntetisk økt", pyramid: "TEK", createdBy: "COACH" }), id, status,
    drills: [{ id: `${id}-ovelse`, title: "Syntetisk øvelse", durationMinutes: 30, order: 0, akFormel: { pyramid: "TEK", area: "TEE", label: "Syntetisk" } }],
  };
}
mock.module("@/lib/workbench/wb-actions", { namedExports: {
  startNextWorkbenchLiveSession: async (input: { currentSessionId?: string; nextSessionId: string }) => { started.push(input); return fails ? { ok: false, error: "Syntetisk startfeil" } : { ok: true, data: session(input.nextSessionId, "IN_PROGRESS") }; },
  completeSession: async (id: string) => { completed.push(id); return fails ? { ok: false, error: "Syntetisk fullføringsfeil" } : { ok: true, data: session(id, "COMPLETED") }; },
  saveWorkbenchLiveSnapshot: async () => { throw new Error("Navigasjon skal ikke skrive live-snapshot"); },
} });

describe("Workbench Live: valgt økt følger vellykket handling", async () => {
const { WorkbenchLive } = await import("@/components/workbench/WorkbenchLive");
type Node = React.ReactElement<Record<string, unknown>>;
function nodes(node: React.ReactNode): Node[] { if (Array.isArray(node)) return node.flatMap(nodes); if (!React.isValidElement<Record<string, unknown>>(node)) return []; const children = node.type === MockExecutionPanel ? (node.type as typeof MockExecutionPanel)(node.props as unknown as Parameters<typeof MockExecutionPanel>[0]) : node.props.children as React.ReactNode; return [node, ...nodes(children)]; }
function find(node: React.ReactNode, predicate: (n: Node) => boolean): Node { const n = nodes(node).find(predicate); assert.ok(n, "Den faktiske komponentens kontroll finnes"); return n; }
function click(node: Node) { (node.props.onClick as () => void)(); }
async function settle() { while (transitions.length) await transitions.shift(); }
function liveData(): WorkbenchLiveData {
  return { from: "2026-09-28", to: "2026-10-04", current: session("syntetisk-gammel", "IN_PROGRESS"), next: session("syntetisk-neste", "PUBLISHED"),
    snapshot: { startedAtISO: "2026-10-01T08:00:00Z", updatedAtISO: "2026-10-01T09:00:00Z", totalSec: 3600,
      drills: [{ drillId: "syntetisk-gammel-ovelse", reps: 36, elapsedSec: 3600, status: "done" }], seriesTargets: { "syntetisk-gammel-ovelse": 3 } },
  };
}
function render(surface: "player" | "agency") { cursor = 0; return WorkbenchLive({ playerId: "syntetisk-spiller", spillerNavn: "Syntetisk spiller", data: liveData(), routeSurface: surface }); }
function startButton(node: React.ReactNode): Node {
  const next = find(node, n => typeof n.props.onStart === "function");
  assert.equal(typeof next.type, "function");
  // NextSession er en vanlig funksjonskomponent uten kroker; knappens binding prøves også.
  const panel = (next.type as (props: Record<string, unknown>) => React.ReactNode)(next.props);
  return find(panel, n => n.type === "button" && n.props.children === "START ØKT");
}
function setUrl(surface: "player" | "agency") {
  pathname = surface === "player" ? "/portal/planlegge/workbench" : "/admin/workbench/syntetisk-spiller";
  query = new URLSearchParams({ niva: "live", uke: "2026-09-28", aar: "2026", maned: "2026-10", periode: "syntetisk-periode", okt: "syntetisk-gammel", klassisk: "1", filter: "egen plan" });
}
function checkContext(url: URL, original: URLSearchParams) {
  assert.equal(url.pathname, pathname);
  for (const [key, value] of original) if (key !== "okt" && key !== "niva") assert.equal(url.searchParams.get(key), value, `${key} skal beholdes`);
}
beforeEach(() => { states.length = 0; cursor = 0; transitions.length = 0; replaced.length = 0; errors.length = 0; successes.length = 0; started.length = 0; completed.length = 0; refreshed = 0; fails = false; });

for (const surface of ["player", "agency"] as const) {
  test(`${surface}: start av allerede valgt neste økt henter bekreftet status uten å navigere til samme URL`, async () => {
    setUrl(surface); query.set("okt", "syntetisk-neste");
    click(startButton(render(surface))); await settle();
    assert.equal(refreshed, 1); assert.equal(replaced.length, 0); assert.equal(errors.length, 0);
    assert.ok(successes.includes("Økten er startet"));
  });
  test(`${surface}: start neste velger riktig ID og beholder kalenderkontekst`, async () => {
    setUrl(surface); const original = new URLSearchParams(query);
    click(startButton(render(surface))); await settle();
    assert.deepEqual(started, [{ currentSessionId: "syntetisk-gammel", nextSessionId: "syntetisk-neste" }]);
    assert.equal(replaced.length, 1); const url = new URL(replaced[0].url, "https://syntetisk.invalid"); checkContext(url, original);
    assert.equal(url.searchParams.get("okt"), "syntetisk-neste"); assert.deepEqual(replaced[0].options, { scroll: false }); assert.equal(errors.length, 0); assert.ok(successes.includes("Økten er startet"));
  });
  test(`${surface}: fullføring åpner oppsummeringen for riktig økt og beholder andre valg`, async () => {
    setUrl(surface); const original = new URLSearchParams(query);
    click(find(render(surface), n => n.type === "button" && n.props.children === "Fullfør økt")); await settle();
    assert.deepEqual(completed, ["syntetisk-gammel"]); assert.equal(replaced.length, 1);
    const url = new URL(replaced[0].url, "https://syntetisk.invalid"); checkContext(url, original); assert.equal(url.searchParams.get("niva"), "okt"); assert.equal(url.searchParams.get("okt"), "syntetisk-gammel"); assert.deepEqual(replaced[0].options, { scroll: false }); assert.equal(errors.length, 0); assert.ok(successes.includes("Økten er fullført"));
  });
  test(`${surface}: avvist start og fullføring beholder adressen og viser feil`, async () => {
    setUrl(surface); const original = query.toString(); fails = true;
    const node = render(surface); click(startButton(node)); await settle();
    assert.deepEqual(errors, ["Syntetisk startfeil"]); assert.equal(replaced.length, 0); assert.equal(refreshed, 0); assert.equal(query.toString(), original);
    click(find(node, n => n.type === "button" && n.props.children === "Fullfør økt")); await settle();
    assert.deepEqual(errors, ["Syntetisk startfeil", "Syntetisk fullføringsfeil"]); assert.equal(replaced.length, 0); assert.equal(refreshed, 0); assert.equal(query.toString(), original); assert.equal(successes.length, 0);
  });
}
});
