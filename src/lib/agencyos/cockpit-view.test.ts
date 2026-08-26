import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTrainLockCockpit } from "./cockpit-view";
import type { CockpitTimelineSession } from "@/components/admin/cockpit/agency-cockpit";
import type { AiDispatchRad } from "./ai-dispatch-build";

function session(overrides: Partial<CockpitTimelineSession> & { id: string }): CockpitTimelineSession {
  return {
    startMin: 540,
    durMin: 50,
    time: "09.00",
    initials: "ØR",
    playerName: "Øyvind Rohjan",
    axis: "tek",
    axisLabel: "Teknikk",
    title: "Innspill 50–80 m",
    meta: [{ icon: "map-pin", text: "Onsøy GK · Range" }],
    href: `/admin/gjennomfore/okter/${overrides.id}`,
    ...overrides,
  };
}

function rad(overrides: Partial<AiDispatchRad> & { id: string }): AiDispatchRad {
  return {
    til: "hq-godkjenning",
    tilLabel: "Godkjenninger",
    oppgave: "Behandle 3 AI-planforslag i køen",
    ferdigNar: "Kø tom eller utsatt med vilje",
    href: "/admin/godkjenninger",
    prioritet: "hoy",
    ...overrides,
  };
}

test("ingen aktiv økt og tom kø gir AG-14 tom-tilstand", () => {
  const view = buildTrainLockCockpit({ timeline: [], now: 540 }, { rader: [] });
  assert.equal(view.liveNow, null);
  assert.deepEqual(view.queue, []);
  assert.equal(view.next, null);
});

test("aktiv økt regnes ut med riktig min igjen og fremdrift", () => {
  const view = buildTrainLockCockpit(
    { timeline: [session({ id: "a", startMin: 500, durMin: 60 })], now: 530 },
    { rader: [] },
  );
  assert.ok(view.liveNow);
  assert.equal(view.liveNow?.metaText, "Innspill 50–80 m · 30 min igjen");
  assert.equal(view.liveNow?.progressPct, 50);
  assert.equal(view.liveNow?.locationTag, "Onsøy GK · Range");
});

test("kun ekte dispatch-rader havner i køen, forslags-rader filtreres bort", () => {
  const view = buildTrainLockCockpit(
    { timeline: [], now: 540 },
    {
      rader: [
        rad({ id: "plan-actions" }),
        rad({ id: "workbench-plan", prioritet: "normal", oppgave: "Planlegg neste uke i Workbench" }),
        rad({ id: "agent-team-start", prioritet: "normal", oppgave: "Kjør research → utkast → review" }),
      ],
    },
  );
  assert.equal(view.queue.length, 1);
  assert.equal(view.queue[0]?.id, "plan-actions");
  assert.equal(view.queue[0]?.dimmed, false);
});

test("kø-kort etter det første er dimmet", () => {
  const view = buildTrainLockCockpit(
    { timeline: [], now: 540 },
    { rader: [rad({ id: "plan-actions" }), rad({ id: "caddie-drafts" }), rad({ id: "session-requests" })] },
  );
  assert.equal(view.queue[0]?.dimmed, false);
  assert.equal(view.queue[1]?.dimmed, true);
  assert.equal(view.queue[2]?.dimmed, true);
});

test("neste økt finnes selv uten aktiv økt (AG-14 sin «Neste: …»)", () => {
  const view = buildTrainLockCockpit(
    { timeline: [session({ id: "b", startMin: 600, durMin: 50, playerName: "Øyvind Rohjan" })], now: 540 },
    { rader: [] },
  );
  assert.equal(view.next?.firstName, "Øyvind");
  assert.equal(view.next?.timeRange, "10.00–10.50");
});
